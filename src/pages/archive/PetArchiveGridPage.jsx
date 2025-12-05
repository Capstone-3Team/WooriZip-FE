import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import ArchiveFilterDropdown from "@/components/archive/ArchiveFilterDropdown";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PET_POSTS_URL = `${API_BASE_URL}/post/pet/archive`;

// 반려동물 보관함 즐겨찾기 로컬스토리지 키
const PET_FAVORITES_KEY = "petArchiveFavorites";

// 로컬스토리지에서 즐겨찾기 ID 목록 로드
function loadPetFavorites() {
  try {
    const raw = localStorage.getItem(PET_FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("failed to parse pet favorites", e);
    return [];
  }
}

function extractImageUrl(value) {
  if (!value) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();

    // 이미 완전한 URL / data URL 이면 그대로 사용
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:") ||
      trimmed.startsWith("/")
    ) {
      return trimmed;
    }

    // base64 로 보이는 긴 문자열이면 data URL 로 감싸기
    const looksLikeBase64 =
      /^[0-9A-Za-z+/=]+$/.test(trimmed) && trimmed.length > 100;

    if (looksLikeBase64) {
      return `data:image/jpeg;base64,${trimmed}`;
    }

    // 나머지는 일단 그대로
    return trimmed;
  }

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

function formatKoreanDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const date = d.getDate();
  return `${year}년 ${month}월 ${date}일`;
}

export default function PetArchiveGridPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleBack = () => navigate(-1);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    async function loadPetPosts() {
      try {
        const res = await fetch(PET_POSTS_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        });

        if (!res.ok) throw new Error("failed to fetch /post/pet/archive");

        const data = await res.json();

        // 저장된 즐겨찾기 ID 불러와서 Set으로 보관
        const favoriteIds = loadPetFavorites();
        const favoriteSet = new Set(favoriteIds);

        // ✅ /post/pet/archive 응답: { images: [...], shorts: [...] }
        const imageItems = Array.isArray(data.images) ? data.images : [];
        const shortItems = Array.isArray(data.shorts) ? data.shorts : [];

        // 일상 + 영상답변(쇼츠) 다 합쳐서 최신순 정렬
        const rawPosts = [...imageItems, ...shortItems].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        const mapped = rawPosts
          .map((post) => {
            const mediaUrl =
              extractImageUrl(post.mediaUrl) ||
              extractImageUrl(post.thumbnailUrl) || // 쇼츠 썸네일 같은 거 대비
              (Array.isArray(post.mediaUrls)
                ? extractImageUrl(post.mediaUrls[0])
                : null);

            if (!mediaUrl) return null;

            return {
              id: post.id,
              type: detectMediaType(mediaUrl), // JPG → image, MOV/MP4 → video
              src: mediaUrl,
              dateLabel: formatKoreanDate(post.createdAt),
              isFavorite: favoriteSet.has(post.id),
            };
          })
          .filter(Boolean);

        setItems(mapped);
      } catch (error) {
        console.error(error);
      }
    }

    loadPetPosts();
  }, []);

  const toggleFavorite = (id) => {
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      );

      // 🔹 즐겨찾기된 아이템들의 id만 저장
      const favoriteIds = updated
        .filter((item) => item.isFavorite)
        .map((item) => item.id);

      localStorage.setItem(PET_FAVORITES_KEY, JSON.stringify(favoriteIds));

      return updated;
    });
  };

  const handleFilterIconClick = () => {
    setIsFilterOpen((prev) => !prev);
  };

  const handleChangeFilter = (value) => {
    setFilter(value);
    setIsFilterOpen(false);
  };

  const filteredItems = items.filter((item) => {
    if (filter === "favorite") return item.isFavorite;
    if (filter === "image") return item.type === "image";
    if (filter === "video") return item.type === "video";
    return true;
  });

  const handleOpenDetail = (item) => {
    navigate("/archive/pets/detail", { state: { item } });
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Header
        bgClassName="bg-bg-app"
        variant="solid"
        title="반려동물과의 추억"
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

      <main className="flex-1 bg-gray-10">
        <div className="grid grid-cols-3 border-t border-gray-20">
          {filteredItems.map((item) => (
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
      </main>

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
