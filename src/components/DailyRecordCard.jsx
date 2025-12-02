import { useState } from "react";
import SlideIndicator from "@/components/SlideIndicator";
import ImageCarousel from "@/components/ImageCarousel"; // 🔥 방금 준 컴포넌트

export default function DailyRecordCard({
  id,
  authorName,
  profileImage,
  dateLabel,
  content,
  images = [],
  videoUrl, // ✅ 영상 URL (없으면 이미지 글)
  commentCount = 0,
  onMoreClick,
  onCommentClick,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // ✅ 캐러셀 인덱스

  const shouldShowMore = content && content.length > 20;
  const hasImages = Array.isArray(images) && images.length > 0;
  const isVideoPost = !!videoUrl;

  const handleToggleMoreText = () => {
    if (!shouldShowMore) return;
    setIsExpanded((prev) => !prev);
  };

  return (
    <article className="bg-bg-app">
      {/* 1. 상단 프로필 + 이름 + 날짜 + 더보기 */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex gap-3">
          {/* 프로필 */}
          <div className="mt-1">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-10 flex items-center justify-center">
              {profileImage ? (
                <img
                  src={profileImage}
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

      {/* 2. 미디어 영역 */}
      <div className="w-full aspect-square bg-gray-20 overflow-hidden">
        {/* 🎥 영상 게시물 */}
        {isVideoPost && (
          <video
            src={videoUrl}
            controls
            className="w-full h-full object-cover"
          />
        )}

        {/* 🖼 이미지 게시물 (여러 장 포함) */}
        {!isVideoPost && hasImages && (
          <ImageCarousel
            images={images.map((src) => ({ src, alt: "일상 기록 이미지" }))}
            currentIndex={currentIndex}
            onChangeIndex={setCurrentIndex}
            className="h-full"
            heightClass="h-full"
          />
        )}
      </div>

      {/* 3. 하단 정보 영역: 인디케이터 + 댓글 수 + 내용 + 더보기 */}
      <div className="bg-bg-app px-4 py-3">
        {/* 슬라이드 인디케이터 (이미지가 1장 이하면 안 보이게) */}
        {!isVideoPost && hasImages && images.length > 1 && (
          <div className="flex justify-center mb-2">
            <SlideIndicator total={images.length} currentIndex={currentIndex} />
          </div>
        )}

        {/* 댓글 수 */}
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-gray-80 mb-1"
          onClick={(e) => {
            e.stopPropagation();
            onCommentClick?.(id);
          }}
        >
          <img src="/icons/comment.svg" alt="댓글" className="w-3.5 h-3.5" />
          <span>{commentCount}</span>
        </button>

        {/* 내용 + ...더 보기 */}
        <div className="mt-1">
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
