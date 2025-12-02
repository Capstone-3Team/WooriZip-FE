import { useState } from "react";
import CommentItem from "./CommentItem";
import CommentInputBar from "./CommentInputBar";
import MoreMenuBox from "@/components/MoreMenuBox";

export default function CommentToastModal({
  isOpen,
  onClose,
  comments = [],
  commentValue,
  onChangeComment,
  onSubmitComment,
  onStartEditComment,
  onRequestDeleteComment,
}) {
  const [openCommentMenuId, setOpenCommentMenuId] = useState(null);

  if (!isOpen) return null;

  const hasComments = comments.length > 0;

  const handleClose = () => {
    setOpenCommentMenuId(null);
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col justify-end bg-black/30"
      onClick={handleClose}
    >
      <section
        className="relative w-full max-h-[90%] min-h-[70%] rounded-t-3xl bg-bg-app px-5 pt-3 pb-24 shadow-[0_-4px_12px_rgba(0,0,0,0.15)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-16 rounded-full bg-black/80" />

        <header className="mb-4 flex items-center justify-center">
          <h2 className="text-base font-semibold text-text-main">댓글</h2>
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 p-1"
            aria-label="댓글 닫기"
          >
            <img src="/icons/close.svg" alt="닫기" className="w-5 h-5" />
          </button>
        </header>

        <div className="h-full overflow-y-auto pr-1">
          {hasComments ? (
            <ul className="space-y-6">
              {comments.map((comment) => {
                const isMenuOpen = openCommentMenuId === comment.id;

                return (
                  <li key={comment.id} className="relative">
                    <CommentItem
                      key={comment.id}
                      authorName={comment.authorName}
                      dateLabel={comment.dateLabel}
                      content={comment.content}
                      imageSrc={comment.authorProfileImageUrl}
                      onMoreClick={() =>
                        setOpenCommentMenuId((prev) =>
                          prev === comment.id ? null : comment.id
                        )
                      }
                    />

                    {isMenuOpen && (
                      // 🔽 여기만 수정: 위가 아니라 아래로 뜨도록
                      <div className="absolute right-1 top-8 z-20">
                        <MoreMenuBox
                          variant="icon"
                          items={[
                            {
                              key: "edit",
                              label: "수정",
                              iconSrc: "/icons/edit.svg",
                              onClick: () => {
                                onStartEditComment?.(comment);
                                setOpenCommentMenuId(null);
                              },
                            },
                            {
                              key: "delete",
                              label: "삭제",
                              iconSrc: "/icons/delete.svg",
                              onClick: () => {
                                onRequestDeleteComment?.(comment.id);
                                setOpenCommentMenuId(null);
                              },
                            },
                          ]}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-text-main">첫 댓글을 남겨보세요</p>
            </div>
          )}
        </div>

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
  );
}
