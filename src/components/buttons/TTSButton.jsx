import React from "react";

function TTSButton({
  active = false, // false: 비활성(gray-60), true: 활성(yellow-40)
  onClick,
  ariaLabel = "TTS 재생",
  iconSrc = "/icons/speaker.svg",
  className = "",
}) {
  const baseClass =
    "flex items-center justify-center h-11 w-11 rounded-xl border transition-colors duration-150";

  const stateClass = active
    ? "bg-yellow-40 border-yellow-40 text-text-main"
    : "bg-bg-app border-gray-40 text-gray-60";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${baseClass} ${stateClass} ${className}`}
    >
      <img src={iconSrc} alt="" className="w-5 h-5" />
    </button>
  );
}

export default TTSButton;
