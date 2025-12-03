import FamilyProfile from "@/components/FamilyProfile";

function VideoAnswerCard({
  isMine,
  title,
  description,
  thumbnailUrl,
  authorName,
  profileImageUrl, // ✅ WeekAnswer에서 넘겨줄 이미지 URL
  onClick,
}) {
  const containerDirection = isMine ? "flex-row-reverse" : "flex-row";

  return (
    <div
      className={`flex items-end gap-2 ${containerDirection} cursor-pointer`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* 프로필 (왼쪽 or 오른쪽) */}
      <FamilyProfile
        variant="vertical"
        name={authorName}
        // ✅ 실제 프로필 이미지 사용, 없으면 기존 기본 아이콘
        imageSrc={profileImageUrl || "/icons/user.svg"}
        className="shrink-0"
      />

      {/* 카드 본문 */}
      <div className="bg-gray-10 rounded-2xl overflow-hidden shadow-sm w-65 max-w-xs border-2 border-yellow-main">
        {/* 제목 */}
        <div className="px-4 pt-3 pb-2">
          <h3 className="text-sm font-semibold text-text-main wrap-break-word">
            {title}
          </h3>
        </div>

        {/* 썸네일 (영상 영역) */}
        <div className="bg-gray-20 w-full aspect-3/2 flex items-center justify-center">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-60">영상 썸네일</span>
          )}
        </div>

        {/* 내용 미리보기 */}
        <div className="px-4 py-2">
          <p className="text-xs text-gray-80 line-clamp-2">
            {description}
            <span className="text-xs text-gray-80"> ...더보기</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default VideoAnswerCard;
