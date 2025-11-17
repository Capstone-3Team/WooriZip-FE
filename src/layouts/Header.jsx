export default function Header({
  title,
  /** "bar" = 아이콘+노랑 배경, "title" = 텍스트만 */
  variant = "bar",
  leftIconSrc,
  leftIconAlt = "",
  onLeftClick,
}) {
  // 2번 타입: 배경 없이, 왼쪽에 텍스트만 (조금 더 큰 글씨)
  if (variant === "title") {
    return (
      <header className="px-4 pt-6 pb-3">
        <h1 className="text-xl font-semibold text-text-main">{title}</h1>
      </header>
    );
  }

  // 1번 타입: 아이콘 + 가운데 제목 + yellow-20 배경
  return (
    <header className="flex h-12 items-center bg-yellow-20 px-4">
      {/* 왼쪽 아이콘 (svg) */}
      <button
        type="button"
        onClick={onLeftClick}
        className="flex flex-1 items-center justify-start text-text-main"
      >
        {leftIconSrc && (
          <img src={leftIconSrc} alt={leftIconAlt} className="h-5 w-5" />
        )}
      </button>

      {/* 가운데 타이틀 */}
      <h1 className="flex-1 text-center text-base font-semibold text-text-main">
        {title}
      </h1>

      {/* 오른쪽 빈공간 (타이틀 가운데 정렬용) */}
      <div className="flex flex-1 justify-end" />
    </header>
  );
}
