export default function CommentItem({
  authorName,
  dateLabel,
  content,
  onMoreClick,
  imageSrc,
}) {
  const hasImage = !!imageSrc;

  return (
    <div className="flex gap-3">
      {/* 프로필 */}
      <div className="mt-1">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-10 flex items-center justify-center">
          {hasImage ? (
            <img
              src={imageSrc}
              alt={authorName}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="/icons/user.svg"
              alt={authorName}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-text-main">{authorName}</p>
            <p className="text-xs text-gray-60">{dateLabel}</p>
          </div>

          {/* onMoreClick 있을 때만 더보기 아이콘 노출 → 내 댓글만 보이게 됨 */}
          {onMoreClick && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoreClick();
              }}
              className="p-1"
              aria-label="댓글 더보기"
            >
              <img
                src="/icons/more-vert.svg"
                alt="더보기"
                className="w-4 h-4"
              />
            </button>
          )}
        </div>

        <p className="mt-2 text-sm text-text-main whitespace-pre-line">
          {content}
        </p>
      </div>
    </div>
  );
}
