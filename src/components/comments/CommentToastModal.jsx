import CommentItem from "./CommentItem";
import CommentInputBar from "./CommentInputBar"; // 하단 입력 바 재사용

/**
 * 댓글 토스트 모달
 *
 * props 예시
 * comments: [
 *   { id: 1, authorName: "귀요미", dateLabel: "11월 12일", content: "하긴 우리zip이 재밌긴 해~", isMine: false },
 *   { id: 2, authorName: "엄마", dateLabel: "11월 12일", content: "귀염당", isMine: true },
 * ]
 */
export default function CommentToastModal({
  isOpen,
  onClose,
  comments = [],
  commentValue,
  onChangeComment,
  onSubmitComment,
}) {
  if (!isOpen) return null;

  const hasComments = comments.length > 0;

  return (
    <>
      {/* 오버레이 + 바텀시트 */}
      <div
        className="fixed inset-0 z-40 flex flex-col justify-end bg-black/30"
        onClick={onClose}
      >
        {/* 바텀시트 본문 */}
        <section
          className="relative w-full max-h-[90%] min-h-[70%] rounded-t-3xl bg-bg-app px-5 pt-3 pb-24 shadow-[0_-4px_12px_rgba(0,0,0,0.15) flex flex-col"
          onClick={(e) => e.stopPropagation()} // 안쪽 클릭 시 모달 닫히지 않게
        >
          {/* 상단 핸들바 */}
          <div className="mx-auto mb-3 h-1 w-16 rounded-full bg-black/80" />

          {/* 헤더 */}
          <header className="mb-4 flex items-center justify-center">
            <h2 className="text-base font-semibold text-text-main">댓글</h2>

            {/* 닫기 버튼 (우측 상단) */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 p-1"
              aria-label="댓글 닫기"
            >
              <img src="/icons/close.svg" alt="닫기" className="w-5 h-5" />
            </button>
          </header>

          {/* 스크롤 영역 */}
          <div className="h-full overflow-y-auto pr-1">
            {hasComments ? (
              <ul className="space-y-6">
                {comments.map((comment) => (
                  <li key={comment.id}>
                    <CommentItem
                      authorName={comment.authorName}
                      dateLabel={comment.dateLabel}
                      content={comment.content}
                      // 내 댓글일 때만 더보기 버튼 노출
                      onMoreClick={
                        comment.isMine
                          ? () => comment.onMoreClick?.(comment)
                          : undefined
                      }
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-text-main">첫 댓글을 남겨보세요</p>
              </div>
            )}
          </div>

          {/* ✅ 바텀시트 안, 맨 아래에 입력창 고정 */}
          <div className="mt-3">
            <CommentInputBar
              value={commentValue}
              onChange={onChangeComment}
              onSubmit={onSubmitComment}
              placeholder="댓글을 입력해주세요"
            />
          </div>
        </section>
      </div>
    </>
  );
}
