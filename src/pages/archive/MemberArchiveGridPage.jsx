import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/layouts/Header";
import ArchiveFilterDropdown from "@/components/archive/ArchiveFilterDropdown";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ALBUM_MEMBER_URL = `${API_BASE_URL}/album/member`;
// 멤버별 즐겨찾기 로컬스토리지 키 prefix
const MEMBER_FAVORITES_PREFIX = "memberArchiveFavorites:";

// ============================
// 1. 공통 유틸 함수들
// ============================

// ISO 문자열 → "YYYY년 M월 D일" 변환
function formatKoreanDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const date = d.getDate();
  return `${year}년 ${month}월 ${date}일`;
}

// ============================
// 2. 멤버별 아카이브 그리드 페이지
//    - 한 멤버가 올린 일상기록 + 영상답변 전체를
//      /album/member/{memberId} 로 한 번에 받아와서
//      그리드로 표시
// ============================
export default function MemberArchiveGridPage() {
  const navigate = useNavigate();
  const { memberId } = useParams();

  // 상단 헤더에 표시할 멤버 이름
  const [memberName, setMemberName] = useState("멤버");

  // 그리드에 표시할 아이템 리스트
  // 각 아이템: { id, type, src, dateLabel, isFavorite, createdAt }
  const [items, setItems] = useState([]);

  // 필터 상태: all | favorite | image | video
  const [filter, setFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleBack = () => navigate(-1);

  // ----------------------------
  // 페이지 진입 시:
  // - memberId가 주어졌다면
  //   /album/member/{memberId} 호출해서 데이터 불러오기
  // ----------------------------
  useEffect(() => {
    if (!memberId) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "*/*",
    };

    async function loadData() {
      try {
        // ✅ 멤버별 보관함 API 호출
        const res = await fetch(`${ALBUM_MEMBER_URL}/${memberId}`, { headers });

        if (!res.ok) {
          throw new Error("failed to fetch /album/member");
        }

        // 응답: [{ type, url, createdAt, profileImageUrl, nickname }, ...]
        const data = await res.json();
        const albumItems = Array.isArray(data) ? data : [];

        // 최신순 정렬
        const sorted = [...albumItems].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // 🔹 이 멤버의 즐겨찾기 목록 로드
        const favoritesKey = `${MEMBER_FAVORITES_PREFIX}${memberId}`;
        let favoriteIds = [];
        try {
          const raw = localStorage.getItem(favoritesKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) favoriteIds = parsed;
          }
        } catch (e) {
          console.error("failed to parse member favorites", e);
        }
        const favoriteSet = new Set(favoriteIds);

        // 그리드에서 쓸 아이템으로 매핑
        const gridItems = sorted
          .map((item) => {
            if (!item.url) return null;

            // type: IMAGE / VIDEO / VIDEO_ANSWER ...
            const rawType = (item.type || "").toUpperCase();
            const type =
              rawType === "VIDEO" || rawType === "VIDEO_ANSWER"
                ? "video"
                : "image";

            // 🔹 /album/member에는 id가 없으니
            //    type + url + createdAt 조합으로 안정적인 id 생성
            const stableId = `${rawType}_${item.url}_${item.createdAt}`;

            return {
              id: stableId,
              type,
              src: item.url,
              createdAt: item.createdAt,
              dateLabel: formatKoreanDate(item.createdAt),
              // 저장된 즐겨찾기 목록에 있으면 true
              isFavorite: favoriteSet.has(stableId),
              nickname: item.nickname,
            };
          })
          .filter(Boolean);

        setItems(gridItems);

        // 상단 헤더 제목: 멤버 이름
        if (gridItems[0]?.nickname) {
          setMemberName(gridItems[0].nickname);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadData();
  }, [memberId]);

  // 즐겨찾기 토글 (프론트 로컬 상태로만 반영)
  const toggleFavorite = (id) => {
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      );

      // 🔹 현재 멤버 id 기준으로 즐겨찾기 저장
      const favoritesKey = `${MEMBER_FAVORITES_PREFIX}${memberId}`;
      const favoriteIds = updated
        .filter((item) => item.isFavorite)
        .map((item) => item.id);

      localStorage.setItem(favoritesKey, JSON.stringify(favoriteIds));

      return updated;
    });
  };

  // 필터 아이콘 클릭 시 드롭다운 토글
  const handleFilterIconClick = () => {
    setIsFilterOpen((prev) => !prev);
  };

  // 필터 선택 변경 핸들러
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

  // 아이템 클릭 시 상세 페이지로 이동
  const handleOpenDetail = (item) => {
    navigate(`/archive/members/${memberId}/detail`, { state: { item } });
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      {/* 상단 헤더: 멤버 이름 + 뒤로가기 + 필터 버튼 */}
      <Header
        bgClassName="bg-bg-app"
        variant="solid"
        title={memberName}
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

      {/* 본문: 3열 그리드로 이미지/영상 나열 */}
      <main className="flex-1 bg-gray-10">
        <div className="grid grid-cols-3 border-t border-gray-20">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="relative aspect-square border border-gray-20 bg-gray-10 overflow-hidden"
              onClick={() => handleOpenDetail(item)}
            >
              {/* 타입에 따라 이미지/영상 분기 */}
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

              {/* 우측 상단 즐겨찾기 아이콘 */}
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
            </button>
          ))}
        </div>
      </main>

      {/* 필터 드롭다운 (모달) */}
      {isFilterOpen && (
        <ArchiveFilterDropdown
          filter={filter}
          onChange={handleChangeFilter}
          onClose={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
}
