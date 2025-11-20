import React from "react";

function AddAnswerButton({
  onClick,
  ariaLabel = "영상답변 추가",
  iconSrc = "/icons/add.svg",
  className = "",
}) {
  const baseClass =
    "fixed right-4 z-40 flex items-center justify-center rounded-full bg-accent shadow-md";

  // 크기/위치: BottomNav(h-20) 위에 살짝 떠 있도록 bottom 값 조절
  const sizeAndPos = "w-14 h-14 bottom-24"; // 필요하면 bottom-20, bottom-28 등으로 조절

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${baseClass} ${sizeAndPos} ${className}`}
    >
      <img src={iconSrc} alt="" className="w-6 h-6" />
    </button>
  );
}

export default AddAnswerButton;
