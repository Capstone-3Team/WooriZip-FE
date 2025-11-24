import React from "react";

function FamilyProfile({
  variant = "vertical", // "big" | "vertical" | "horizontal"
  name = "누군가",
  imageSrc, // 프로필 이미지 (없으면 placeholder)
  date, // "11월 12일" 같은 문자열 (horizontal 전용)
  showMore = false, // 더보기 아이콘 on/off
  onClickMore,
  onClickAvatar,
  moreIconSrc = "/icons/more-vert.svg",
  className = "",
}) {
  // 공통 아바타 (크기만 variant별로 조절)
  const renderAvatar = () => {
    // variant별 크기
    let sizeClass = "";
    if (variant === "big") {
      sizeClass = "w-32 h-32"; // 큰 원
    } else if (variant === "horizontal") {
      sizeClass = "w-8 h-8"; // 댓글용
    } else {
      sizeClass = "w-11 h-11"; // 기본 세로형 리스트
    }

    const avatar = (
      <div
        className={`rounded-full bg-gray-10 flex items-center justify-center overflow-hidden ${sizeClass}`}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={`${name} 프로필`}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src="/icons/generic-avatar.svg"
            alt=""
            className="w-full h-full opacity-70"
          />
        )}
      </div>
    );

    if (onClickAvatar) {
      return (
        <button
          type="button"
          onClick={onClickAvatar}
          className="inline-flex"
          aria-label="프로필 이미지 변경"
        >
          {avatar}
        </button>
      );
    }

    return avatar;
  };

  // big: 프로필 추가/수정 큰 버전
  if (variant === "big") {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        {renderAvatar()}

        {/* 닉네임 + 연필 아이콘 같이 묶고 싶을 때를 대비해서 래퍼 */}
        <div className="mt-3 flex items-center gap-1">
          <span className="text-base font-medium text-text-main">{name}</span>
          {/* 수정 아이콘이 필요하면 여기서 조건부로 렌더링 */}
          {/* <img src="/icons/edit_small.svg" alt="" className="w-3 h-3" /> */}
        </div>
      </div>
    );
  }

  // horizontal: 댓글 헤더 영역 (프로필 + 닉네임 + 날짜 + 더보기)
  if (variant === "horizontal") {
    return (
      <div className={`flex items-start justify-between w-full ${className}`}>
        <div className="flex items-center gap-3">
          {renderAvatar()}
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-text-main">{name}</span>
            {date && <span className="text-xs text-gray-60">{date}</span>}
          </div>
        </div>

        {showMore && (
          <button
            type="button"
            onClick={onClickMore}
            className="mt-1 p-1"
            aria-label="더보기"
          >
            {moreIconSrc ? (
              <img src={moreIconSrc} alt="" className="w-4 h-4" />
            ) : (
              <span className="text-text-main text-lg leading-none">⋮</span>
            )}
          </button>
        )}
      </div>
    );
  }

  // vertical: 세로형 (프로필 + 닉네임) - 가족 구성원 리스트 등
  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      {renderAvatar()}
      <span className="text-sm text-medium text-text-main">{name}</span>
    </div>
  );
}

export default FamilyProfile;
