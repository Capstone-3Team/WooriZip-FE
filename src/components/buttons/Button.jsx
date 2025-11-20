function Button({
  children,
  // large = 넓은 버튼, medium = 한 줄 두 개, small = input 옆
  size = "large", // "large" | "medium" | "small"
  // 색/스타일 버전
  variant = "primary", // "primary" | "accent" | "focus" | "notFocus" | "default"
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  // 모든 버튼 공통: 같은 높이 + 둥근 모서리 + 기본 border
  const baseClass =
    "inline-flex h-13 items-center justify-center rounded-lg border font-semibold transition-colors duration-150";

  // 크기별: 가로 폭 / 폰트 크기만 달라짐 (높이는 h-13로 고정)
  let sizeClass = "";
  if (size === "large") {
    // 넓은 CTA 버튼 (w-full)
    sizeClass = "w-full px-4 text-md";
  } else if (size === "medium") {
    // 토글 / 중간 버튼 (flex-1로 나열)
    sizeClass = "px-8 text-md";
  } else if (size === "small") {
    // input 옆 작은 버튼
    sizeClass = "px-4 text-md";
  }

  // 색/스타일
  let variantClass = "";
  if (disabled) {
    // 비활성: 배경/텍스트/테두리에 gray-60 사용
    variantClass = "bg-gray-60 text-gray-60 border-gray-60 cursor-not-allowed";
  } else {
    switch (variant) {
      case "primary":
        // 메인 노랑 채움
        variantClass = "bg-yellow-main text-text-main border-yellow-main";
        break;
      case "accent":
        // 다홍 채움 (삭제/가족 코드 공유 등)
        variantClass = "bg-accent text-bg-app border-accent";
        break;
      case "focus":
        // 채움 X + 노랑 테두리 (선택된 탭/토글)
        variantClass =
          "bg-transparent text-text-main border-2 border-yellow-main";
        break;
      case "notFocus":
        // 채움 X + 회색 테두리 (비선택 탭/토글)
        variantClass = "bg-transparent text-gray-60 border border-gray-40";
        break;
      case "default":
      default:
        // 채움 X + 외곽선 = 텍스트 색과 동일
        // text-color를 바꾸면 border-color도 자동으로 같이 변함
        variantClass = "bg-transparent text-text-main border border-current";
        break;
    }
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClass} ${sizeClass} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
