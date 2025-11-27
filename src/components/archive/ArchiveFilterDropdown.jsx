// 필터 선택 박스
// filter: "all" | "favorite" | "image" | "video"
// onChange: (value) => void
// onClose: () => void
function ArchiveFilterDropdown({ filter, onChange, onClose }) {
  const options = [
    { value: "all", label: "전체보기", icon: "/icons/filter-all.svg" },
    { value: "favorite", label: "즐겨찾기", icon: "/icons/heart-outline.svg" },
    { value: "image", label: "사진", icon: "/icons/filter-image.svg" },
    { value: "video", label: "비디오", icon: "/icons/filter-video.svg" },
  ];

  return (
    // 바깥을 클릭하면 닫히도록 전체 오버레이
    <div className="fixed inset-0 z-30" onClick={onClose}>
      {/* 실제 박스는 우측 상단 근처에 */}
      <div
        className="absolute right-4 top-16 w-40 rounded-xl bg-yellow-20 shadow-md border border-yellow-40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 제목 줄 */}
        <div className="px-3 py-2 border-b border-yellow-40 flex items-center justify-between text-xs font-bold text-text-main">
          <span>필터</span>
          <span className="text-xs font-bold">
            {filter === "all"
              ? "전체보기"
              : filter === "favorite"
              ? "즐겨찾기"
              : filter === "image"
              ? "사진"
              : "비디오"}
          </span>
        </div>

        {/* 옵션들 */}
        {options.map((opt) => {
          const isActive = filter === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              className="w-full px-3 py-2 flex items-center justify-between text-xs"
              onClick={() => onChange(opt.value)}
            >
              <span
                className={
                  isActive ? "font-bold text-text-main" : "text-gray-80"
                }
              >
                {opt.label}
              </span>
              {opt.icon && <img src={opt.icon} alt="" className="w-4 h-4" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ArchiveFilterDropdown;
