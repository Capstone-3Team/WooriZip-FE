import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import ArchiveFilterDropdown from "@/components/archive/ArchiveFilterDropdown";

// TODO: 나중에 실제 데이터로 교체
const MOCK_ITEMS = [
  {
    id: 1,
    type: "image",
    src: "/mock/daily-1.png",
    dateLabel: "2025년 11월 6일",
    isFavorite: false,
  },
  {
    id: 2,
    type: "image",
    src: "/mock/daily-2.png",
    dateLabel: "2025년 11월 13일",
    isFavorite: false,
  },
  {
    id: 3,
    type: "video",
    src: "/mock/member-3.jpg", // 영상 썸네일 (실제 영상 src 따로 둘 수도 있음)
    dateLabel: "2025년 11월 27일",
    isFavorite: true,
  },
  // ...추가 mock
];

export default function DailyArchivePage() {
  const navigate = useNavigate();

  const [items, setItems] = useState(MOCK_ITEMS);

  // 🔽 필터 상태
  const [filter, setFilter] = useState("all"); // "all" | "favorite" | "image" | "video"
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleBack = () => navigate(-1);

  const toggleFavorite = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  // 필터 아이콘 클릭 → 박스 열기/닫기
  const handleFilterIconClick = () => {
    setIsFilterOpen((prev) => !prev);
  };

  // 드롭다운에서 옵션 선택
  const handleChangeFilter = (value) => {
    setFilter(value);
    setIsFilterOpen(false);
  };

  // 실제로 보여줄 아이템
  const filteredItems = items.filter((item) => {
    if (filter === "favorite") return item.isFavorite;
    if (filter === "image") return item.type === "image";
    if (filter === "video") return item.type === "video";
    return true; // "all"
  });

  const handleOpenDetail = (item) => {
    // 상세 페이지로 이동하면서 선택한 미디어 정보를 넘김
    navigate("/archive/daily/detail", { state: { item } });
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
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

      {/* 앨범 그리드 */}
      <main className="flex-1 bg-gray-10">
        <div className="grid grid-cols-3 border-t border-gray-20">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="relative aspect-square border border-gray-20 bg-gray-10 overflow-hidden"
              onClick={() => handleOpenDetail(item)}
            >
              {/* 미리보기 이미지/썸네일 */}
              <img
                src={item.src}
                alt={item.dateLabel}
                className="w-full h-full object-cover"
              />

              {/* 즐겨찾기 하트 (우상단) */}
              <button
                type="button"
                className="absolute top-1 right-1 z-10"
                onClick={(e) => {
                  e.stopPropagation(); // 상세로 넘어가는 클릭 막기
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
