function Header({
  // "solid" = 아이콘 + 가운데 제목 + 배경
  // "plain" = 배경 없이, 왼쪽에만 큰 텍스트
  variant = "solid",
  title,
  className = "", // 밖에서 추가로 Tailwind 클래스 넣고 싶을 때 사용

  // 왼쪽 아이콘 & 동작 (뒤로가기, 닫기, 필터 등)
  leftIcon,
  onLeftClick,
  leftAriaLabel = "", // 용도에 맞게 "뒤로가기", "닫기", "필터 열기" 등

  // (옵션) 오른쪽 아이콘 & 동작 (추가 액션용)
  rightIcon,
  onRightClick,
  rightAriaLabel,

  // 스타일 커스터마이징용
  bgClassName = "bg-app", // 1번 헤더 배경 색
  titleClassName = "text-lg font-semibold", // 제목추가 클래스: 글자 크기/굵기/색
  iconWrapperClassName = "w-8 h-8 flex items-center justify-center", // 아이콘 영역 크기
}) {
  // 공통: 가로 전체, 좌우 여백 px-4, flex로 내부를 수평 배치, 가운데 정렬, 세로 높이 h-16
  const baseClass = "w-full px-4 pt-10 pb-3 flex items-center min-h-14 gap-3";

  // 왼쪽 아이콘 렌더링 (있을 수도, 없을 수도)
  const renderLeft = () => {
    // 아이콘도 없고 클릭도 없으면: 그냥 자리만 차지하거나 완전 비워도 됨
    if (!leftIcon && !onLeftClick) {
      // 제목을 정확히 가운데 맞추기 위해 solid 헤더에서는 placeholder 역할
      return <div className={iconWrapperClassName} />;
    }

    // 클릭 동작이 있으면 button으로 렌더링
    if (onLeftClick) {
      return (
        <button
          type="button"
          onClick={onLeftClick}
          aria-label={leftAriaLabel}
          className={iconWrapperClassName}
        >
          {leftIcon}
        </button>
      );
    }

    // 그냥 아이콘만 보여줄 때
    return <div className={iconWrapperClassName}>{leftIcon}</div>;
  };

  // 오른쪽 아이콘 렌더링 (optional)
  const renderRight = () => {
    if (!rightIcon && !onRightClick) {
      // 왼쪽이랑 같은 너비로 맞춰서 제목이 가운데 오도록 하는 placeholder
      return <div className={iconWrapperClassName} />;
    }

    if (onRightClick) {
      return (
        <button
          type="button"
          onClick={onRightClick}
          aria-label={rightAriaLabel}
          className={iconWrapperClassName}
        >
          {rightIcon}
        </button>
      );
    }

    return <div className={iconWrapperClassName}>{rightIcon}</div>;
  };

  // 2번: 배경 없이, 왼쪽 정렬 큰 텍스트
  if (variant === "plain") {
    return (
      <header className={`${baseClass} ${bgClassName} ${className}`}>
        {/* 밖에서 titleClassName 들어오면 Tailwind는 뒤에 오는 클래스가 이겨서 사실상 titleClassName이 적용됨
        + 위치 지정 안해주면 기본적으로 왼쪽 정렬됨 */}
        <h1 className={`text-2xl font-semibold break-keep`}>{title}</h1>
      </header>
    );
  }

  // 1번: 아이콘 + 가운데 제목 + 배경
  return (
    <header className={`${baseClass} ${bgClassName} ${className}`}>
      {/* 왼쪽 아이콘 */}
      {renderLeft()}

      {/* 가운데 제목 */}
      {/* flex-1: 양 옆 아이콘 영역 빼고 남은 공간을 전부 차지 */}
      {/* break-keep: 단어 단위로 줄바꿈 */}
      <div className={`flex-1 text-center break-keep ${titleClassName}`}>
        {title}
      </div>

      {/* 오른쪽 dummy 영역: 아이콘 영역이랑 너비 맞춰서 진짜 가운데 정렬 */}
      {renderRight()}
    </header>
  );
}

export default Header;
