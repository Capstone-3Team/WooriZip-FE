/**
 * mode:
 *  - "daily"  : 일상기록용 (배경 accent, 흰 글씨)
 *  - "video"  : 영상답변용 (배경 bg-app, text-main)
 */
function MoreBox({
  mode = "video", // "daily" | "video"
  items = [], // [{ label, onClick }]
  className = "",
}) {
  const baseClass =
    "flex flex-col rounded-lg overflow-hidden shadow-md text-sm min-w-[120px]";

  let containerClass = "";
  let dividerClass = "";

  if (mode === "daily") {
    // 일상기록: accent 배경 + 흰 글씨, 가운데 흰 구분선
    containerClass = "bg-accent text-bg-app";
    dividerClass = "border-t border-bg-app/50";
  } else {
    // 영상답변: bg-app 배경 + 진한 텍스트, 테두리/구분선 text-main 계열
    containerClass = "bg-bg-app text-text-main border border-text-main";
    dividerClass = "border-t border-text-main/20";
  }

  return (
    <div className={`${baseClass} ${containerClass} ${className}`}>
      {items.map((item, index) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className={[
            "px-4 py-2 text-center",
            index !== 0 ? dividerClass : "",
            mode === "daily" ? "hover:bg-accent/90" : "hover:bg-yellow-40/40",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default MoreBox;
