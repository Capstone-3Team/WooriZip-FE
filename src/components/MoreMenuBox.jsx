// variant: "icon" | "yellow"
// - "icon": bg-app, 좌측 아이콘 + 텍스트 (영상답변 수정/삭제 등)
// - "yellow": yellow-main 배경, 아이콘 없이 텍스트만 (앨범 선택 / 카메라 롤 등)

export default function MoreMenuBox({ variant = "icon", items = [] }) {
  const baseClass =
    "min-w-22 rounded-lg border border-text-main shadow-[0_4px_10px_rgba(0,0,0,0.18)] overflow-hidden text-sm";

  const boxClass =
    variant === "yellow"
      ? "bg-yellow-main text-text-main"
      : "bg-bg-app text-text-main";

  return (
    // 메뉴 안쪽 클릭해도 상위로 클릭 이벤트 안 올라가게
    <div
      className={`${baseClass} ${boxClass}`}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, index) => (
        <button
          key={item.key ?? item.label ?? index}
          type="button"
          onClick={item.onClick}
          className={`w-full flex items-center border-0 px-4 py-2.5 text-sm font-medium
            ${variant === "yellow" ? "justify-center" : "justify-start gap-3"}
            ${index > 0 ? "border-t border-text-main" : ""}`}
        >
          {variant === "icon" && item.iconSrc && (
            <img src={item.iconSrc} alt="" className="w-4 h-4" />
          )}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
