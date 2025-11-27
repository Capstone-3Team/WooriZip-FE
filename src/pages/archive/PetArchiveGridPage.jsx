import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import ArchiveFilterDropdown from "@/components/archive/ArchiveFilterDropdown";

// TODO: 나중에 API 데이터로 교체
const PET_ITEMS = [
  {
    id: 1,
    type: "image",
    src: "/mock/pet-1.jpeg",
    dateLabel: "2025년 11월 6일",
    isFavorite: true,
  },
  {
    id: 2,
    type: "image",
    src: "/mock/member-2.jpeg",
    dateLabel: "2025년 11월 6일",
    isFavorite: false,
  },
  {
    id: 3,
    type: "video",
    src: "/mock/member-3.jpg", // 영상이면 썸네일
    dateLabel: "2025년 11월 6일",
    isFavorite: true,
  },
  // ...필요하면 더 추가
];

export default function PetArchiveGridPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState(PET_ITEMS);
  const [filter, setFilter] = useState("all"); // all | favorite | image | video
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleBack = () => navigate(-1);

  const toggleFavorite = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
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
            <button
              key={item.id}
              type="button"
              className="relative aspect-square border border-gray-20 bg-gray-10 overflow-hidden"
              onClick={() => handleOpenDetail(item)}
            >
              <img
                src={item.src}
                alt={item.dateLabel}
                className="w-full h-full object-cover"
              />

              {/* 즐겨찾기 하트 */}
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
