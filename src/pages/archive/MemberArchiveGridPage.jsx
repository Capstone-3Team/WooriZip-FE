import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/layouts/Header";
import ArchiveFilterDropdown from "@/components/archive/ArchiveFilterDropdown";

// 멤버별 mock 데이터 (나중에 API로 교체)
const MEMBER_CONFIG = {
  "younger-sibling": {
    name: "나동생",
    items: [
      {
        id: 1,
        type: "image",
        src: "/mock/member-1-1.png",
        dateLabel: "2025년 11월 6일",
        isFavorite: true,
      },
      {
        id: 2,
        type: "image",
        src: "/mock/member-1-2.png",
        dateLabel: "2025년 11월 6일",
        isFavorite: false,
      },
      {
        id: 3,
        type: "video",
        src: "/mock/member-1-3.png",
        dateLabel: "2025년 11월 6일",
        isFavorite: true,
      },
    ],
  },
  mom: {
    name: "엄마",
    items: [
      {
        id: 4,
        type: "image",
        src: "/mock/member-2-2.jpg",
        dateLabel: "2025년 11월 6일",
        isFavorite: false,
      },
    ],
  },
  "cute-me": {
    name: "귀요미",
    items: [
      {
        id: 5,
        type: "image",
        src: "/mock/member-3-1.jpeg",
        dateLabel: "2025년 11월 6일",
        isFavorite: true,
      },
    ],
  },
};

export default function MemberArchiveGridPage() {
  const navigate = useNavigate();
  const { memberId } = useParams();

  const memberConfig = MEMBER_CONFIG[memberId] || {
    name: "멤버",
    items: [],
  };

  const [items, setItems] = useState(memberConfig.items);

  // 필터 상태
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
    return true; // all
  });

  const handleOpenDetail = (item) => {
    // 멤버별 상세 페이지로 이동 (ArchiveMediaDetail 재사용)
    navigate(`/archive/members/${memberId}/detail`, { state: { item } });
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Header
        bgClassName="bg-bg-app"
        variant="solid"
        title={memberConfig.name}
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

      {/** 앨범 그리드 */}
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

      {/* 필터 드롭다운 */}
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
