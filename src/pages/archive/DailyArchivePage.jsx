import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import ArchiveFilterDropdown from "@/components/archive/ArchiveFilterDropdown";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// 일상 기록은 /post API 사용
const DAILY_POSTS_URL = `${API_BASE_URL}/post`;
// 일상 보관함 즐겨찾기 로컬스토리지 키
const DAILY_FAVORITES_KEY = "dailyArchiveFavorites";

// 로컬스토리지에서 즐겨찾기 ID 목록 로드
function loadDailyFavorites() {
  try {
    const raw = localStorage.getItem(DAILY_FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("failed to parse daily favorites", e);
    return [];
  }
}

// ======================================
// 이미지 URL 정규화 헬퍼
// - http/https, data URL, blob, 절대경로("/...")
//   또는 base64(raw 문자열) 까지 넓게 처리
// ======================================
function extractImageUrl(value) {
  if (!value) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();

    // 1) 이미 완전한 URL / data URL / blob 이면 그대로 사용
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:")
      // ⚠️ 여기서는 "/" 는 일단 제외
      //   ("/9j..." 같은 base64 문자열을 경로로 착각하지 않기 위해)
    ) {
      return trimmed;
    }

    // 2) base64 로 보이는 긴 문자열이면 data URL 로 감싸기
    const looksLikeBase64 =
      /^[0-9A-Za-z+/=]+$/.test(trimmed) && trimmed.length > 100;

    if (looksLikeBase64) {
      return `data:image/jpeg;base64,${trimmed}`;
    }

    // 3) 서버 절대 경로 ("/..." 형태)
    if (trimmed.startsWith("/")) {
      return trimmed;
    }

    // 4) 나머지는 일단 그대로 사용
    return trimmed;
  }

  // 객체에 url 관련 필드가 있는 경우 재귀적으로 처리
  if (typeof value === "object") {
    const cand =
      value.url ||
      value.imageUrl ||
      value.fileUrl ||
      value.path ||
      value.location ||
      null;
    return typeof cand === "string" ? extractImageUrl(cand) : null;
  }

  return null;
}

// ======================================
// URL 확장자를 보고 이미지/영상 타입 추론
// - .mp4, .mov, .avi, .webm → video
// - 그 외 → image
// ======================================
function detectMediaType(url) {
  if (!url) return "image";
  const lowered = url.toLowerCase();
  if (
    lowered.endsWith(".mp4") ||
    lowered.endsWith(".mov") ||
    lowered.endsWith(".avi") ||
    lowered.endsWith(".webm")
  ) {
    return "video";
  }
  return "image";
}

// ISO 문자열 → "YYYY년 M월 D일" 포맷 변환
function formatKoreanDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const date = d.getDate();
  return `${year}년 ${month}월 ${date}일`;
}

export default function DailyArchivePage() {
  const navigate = useNavigate();

  // 그리드에 표시할 전체 아이템
  // 각 아이템: { id, type, src, dateLabel, isFavorite }
  const [items, setItems] = useState([]);

  // 필터 상태: all | favorite | image | video
  const [filter, setFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleBack = () => navigate(-1);

  // ======================================
  // 페이지 진입 시 /post 호출해서
  // 일상 기록 전체를 불러오는 useEffect
  // ======================================
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    async function loadPosts() {
      try {
        const res = await fetch(DAILY_POSTS_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        });

        if (!res.ok) throw new Error("failed to fetch /post");

        // /post 응답: [{ id, mediaUrl, mediaUrls, createdAt, ... }]
        const data = await res.json();

        // 저장된 즐겨찾기 목록 불러와서 Set으로 보관
        const favoriteIds = loadDailyFavorites();
        const favoriteSet = new Set(favoriteIds);

        const mapped = (Array.isArray(data) ? data : [])
          .map((post) => {
            // 우선순위: 단일 mediaUrl → mediaUrls[0]
            const mediaUrl =
              extractImageUrl(post.mediaUrl) ||
              (Array.isArray(post.mediaUrls)
                ? extractImageUrl(post.mediaUrls[0])
                : null);

            // 표시할 미디어가 없으면 스킵
            if (!mediaUrl) return null;

            return {
              id: post.id,
              // 파일 확장자로 이미지/영상 구분
              type: detectMediaType(mediaUrl),
              src: mediaUrl,
              dateLabel: formatKoreanDate(post.createdAt),
              // 로컬스토리지에 있으면 즐겨찾기 true
              isFavorite: favoriteSet.has(post.id),
            };
          })
          .filter(Boolean);

        // 여기서는 백엔드 정렬을 믿고 그대로 사용
        // 필요하면 createdAt 기준으로 최신순 정렬 추가 가능
        setItems(mapped);
      } catch (error) {
        console.error(error);
      }
    }

    loadPosts();
  }, []);

  // 즐겨찾기 토글
  const toggleFavorite = (id) => {
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      );

      // 즐겨찾기된 아이템들의 id만 저장
      const favoriteIds = updated
        .filter((item) => item.isFavorite)
        .map((item) => item.id);

      localStorage.setItem(DAILY_FAVORITES_KEY, JSON.stringify(favoriteIds));

      return updated;
    });
  };

  // 필터 버튼 클릭 시 드롭다운 열기/닫기
  const handleFilterIconClick = () => {
    setIsFilterOpen((prev) => !prev);
  };

  // 드롭다운에서 필터 선택 변경
  const handleChangeFilter = (value) => {
    setFilter(value);
    setIsFilterOpen(false);
  };

  // 현재 필터 상태에 따라 아이템 필터링
  const filteredItems = items.filter((item) => {
    if (filter === "favorite") return item.isFavorite;
    if (filter === "image") return item.type === "image";
    if (filter === "video") return item.type === "video";
    return true; // "all"
  });

  // 카드 클릭 시 상세 페이지로 이동
  const handleOpenDetail = (item) => {
    navigate("/archive/daily/detail", { state: { item } });
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      {/* 상단 헤더: 뒤로가기 + 필터 버튼 */}
      <Header
        bgClassName="bg-bg-app"
        variant="solid"
        title="일상 기록"
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-6 h-6" />
        }
        onLeftClick={handleBack}
        leftAriaLabel="뒤로가기"
        rightIcon={
          <img src="/icons/filter.svg" alt="필터" className="w-5 h-5" />
        }
        onRightClick={handleFilterIconClick}
        rightAriaLabel="필터 열기"
      />

      {/* 본문: 3열 그리드로 일상 기록 보여주기 */}
      <main className="flex-1 bg-gray-10">
        <div className="grid grid-cols-3 border-t border-gray-20">
          {filteredItems.map((item) => (
            // 🔹 바깥은 div + role="button" 으로 클릭 가능 영역 처리
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              className="relative aspect-square border border-gray-20 bg-gray-10 overflow-hidden cursor-pointer"
              onClick={() => handleOpenDetail(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOpenDetail(item);
                }
              }}
            >
              {/* 이미지 / 비디오 분기 */}
              {item.type === "video" ? (
                <video
                  src={item.src}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={item.src}
                  alt={item.dateLabel}
                  className="w-full h-full object-cover"
                />
              )}

              {/* 우측 상단 즐겨찾기 버튼 */}
              <button
                type="button"
                className="absolute top-1 right-1 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
              >
                <img
                  src={
                    item.isFavorite
                      ? "/icons/heart-filled.svg"
                      : "/icons/heart-outline.svg"
                  }
                  alt="즐겨찾기"
                  className="w-4 h-4"
                />
              </button>
            </div>
          ))}
        </div>

        {/* 필터 드롭다운 모달 */}
        {isFilterOpen && (
          <ArchiveFilterDropdown
            filter={filter}
            onChange={handleChangeFilter}
            onClose={() => setIsFilterOpen(false)}
          />
        )}
      </main>
    </div>
  );
}
