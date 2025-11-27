import { useState } from "react";
import SlideIndicator from "@/components/SlideIndicator";

export default function DailyRecordCard({
  id,
  authorName,
  dateLabel,
  content,
  images = [],
  commentCount = 0,
  currentImageIndex = 0,
  onMoreClick, // 카드 우측 상단 ... 메뉴 열기 (id 넘겨줄 거)
  onCommentClick, // ✅ 댓글 아이콘 클릭 핸들러 (선택)
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 내용이 어느 정도 길면 더보기 노출 (길이 기준은 필요에 따라 조절)
  const shouldShowMore = content && content.length > 20;

  const handleToggleMoreText = () => {
    if (!shouldShowMore) return;
    setIsExpanded((prev) => !prev);
  };

  const thumbnail = images[currentImageIndex] ?? images[0];

  return (
    <article className="bg-bg-app">
      {/* 1. 상단 프로필 + 이름 + 날짜 + 더보기 (CommentItem 스타일) */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex gap-3">
          {/* 프로필 */}
          <div className="mt-1">
            <div className="w-10 h-10 rounded-full bg-gray-10 flex items-center justify-center">
              {/* 실제 이미지 들어가면 <img />로 교체 */}
              <span className="text-xs text-gray-80">
                {authorName?.[0] ?? "누군가"}
              </span>
            </div>
          </div>

          {/* 이름/날짜 + 더보기 */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-text-main">
                  {authorName}
                </p>
                <p className="text-xs text-gray-60">{dateLabel}</p>
              </div>

              {onMoreClick && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoreClick(id);
                  }}
                  className="p-1"
                  aria-label="일상 기록 더보기"
                >
                  <img
                    src="/icons/more-vert.svg"
                    alt="더보기"
                    className="w-4 h-4"
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. 이미지 영역 (항상 존재한다고 가정) */}
      <div className="w-full aspect-square bg-gray-20 overflow-hidden">
        {thumbnail && (
          <img
            src={thumbnail}
            alt="일상 기록 이미지"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* 3. 하단 정보 영역: 인디케이터 + 댓글 수 + 내용 + 더보기 */}
      <div className="bg-bg-app px-4 py-3">
        {/* 슬라이드 인디케이터 (항상 렌더링) */}
        <div className="flex justify-center mb-2">
          <SlideIndicator
            total={images.length || 1}
            currentIndex={currentImageIndex}
          />
        </div>

        {/* 댓글 수 */}
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-gray-80 mb-1"
          onClick={(e) => {
            e.stopPropagation(); // 카드 전체 클릭 이벤트 막고
            onCommentClick?.(id); // ✅ 부모에 카드 id 넘겨줌
          }}
        >
          <img src="/icons/comment.svg" alt="댓글" className="w-3.5 h-3.5" />
          <span>{commentCount}</span>
        </button>

        {/* 내용 + ...더 보기 */}
        <div className="mt-1">
          {/* 한 줄까지는 보여주고, 더보기 누르면 전체 펼치기 */}
          <div className="flex items-baseline">
            <p
              className={`text-sm text-text-main ${
                isExpanded ? "" : "line-clamp-1"
              }`}
            >
              {content}
            </p>

            {!isExpanded && shouldShowMore && (
              <button
                type="button"
                onClick={handleToggleMoreText}
                className="ml-1 shrink-0 text-sm text-gray-80 underline-offset-2"
              >
                더 보기
              </button>
            )}
          </div>

          {/* 펼친 뒤 접기 버튼 (옵션) */}
          {isExpanded && shouldShowMore && (
            <button
              type="button"
              onClick={handleToggleMoreText}
              className="mt-1 text-xs text-gray-60"
            >
              접기
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
