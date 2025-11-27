import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import CommentInputBar from "@/components/comments/CommentInputBar";
import CommentItem from "@/components/comments/CommentItem";
import MoreMenuBox from "@/components/MoreMenuBox";
import ConfirmModal from "@/components/ConfirmModal";

// ====== 임시 상수 (나중에 실제 값으로 교체) ======
const CURRENT_USER_NAME = "나동생"; // TODO: 로그인 유저 이름으로 교체
const IS_CURRENT_WEEK = true; // TODO: 해당 주차 여부 (API/props로 교체)

// === 테스트용 더미 데이터 ===
const MOCK_ANSWER_DETAIL = {
  id: 1,
  title: "유쾌한 우리집",
  authorName: "나동생",
  dateLabel: "11월 11일",
  sttText: "STT 내용입니다.\n한 줄에서 두 줄 정도 나올 듯함.",
};

const MOCK_COMMENTS = [
  {
    id: 1,
    authorName: "귀요미",
    dateLabel: "11월 12일",
    content: "하긴 우리집이 재밌긴 해~",
  },
  {
    id: 2,
    authorName: "엄마",
    dateLabel: "11월 12일",
    content: "귀염당",
  },
];

export default function VideoAnswerDetail() {
  const navigate = useNavigate();

  const [answer] = useState(MOCK_ANSWER_DETAIL);
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [commentText, setCommentText] = useState("");
  const [isAnswerMoreOpen, setIsAnswerMoreOpen] = useState(false);
  const [openCommentMenuId, setOpenCommentMenuId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);

  // 삭제 모달 관련 상태
  const [isDeleteAnswerModalOpen, setIsDeleteAnswerModalOpen] = useState(false);
  const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] =
    useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState(null);

  const isCurrentWeek = IS_CURRENT_WEEK;
  const isMyAnswer = answer.authorName === CURRENT_USER_NAME;

  const handleBack = () => {
    navigate(-1);
  };

  // ====== 댓글 작성 / 수정 ======
  const handleSubmitComment = () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    // 수정 모드
    if (editingCommentId !== null) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === editingCommentId ? { ...c, content: trimmed } : c
        )
      );
      setEditingCommentId(null);
      setCommentText("");
      return;
    }

    // 새 댓글 작성
    const newComment = {
      id: Date.now(),
      authorName: CURRENT_USER_NAME,
      dateLabel: "11월 12일", // TODO: 실제 날짜
      content: trimmed,
    };

    setComments((prev) => [...prev, newComment]);
    setCommentText("");
  };

  // ====== 공통: 모든 메뉴 닫기 ======
  const handleCloseAllMenus = () => {
    setIsAnswerMoreOpen(false);
    setOpenCommentMenuId(null);
  };

  // ====== 답변(영상) 더보기 ======
  const handleToggleAnswerMore = () => {
    if (!isCurrentWeek || !isMyAnswer) return;
    setIsAnswerMoreOpen((prev) => !prev);
  };

  const handleEditAnswer = () => {
    if (!isCurrentWeek || !isMyAnswer) return;

    // 일상기록에서 /daily/new 로 editPost 넘겨주던 패턴 그대로
    navigate("/answers/new", {
      state: {
        editAnswer: answer, // ✏️ AddVideoAnswer 페이지에서 이걸로 초기값 세팅
      },
    });

    setIsAnswerMoreOpen(false);
  };

  // 삭제 “확인” 버튼에서 실제 삭제 실행
  const handleDeleteAnswer = () => {
    console.log("영상 답변 삭제", answer.id);
    navigate(-1);
  };

  // 메뉴에서 “삭제” 클릭 → 모달 열기
  const handleOpenDeleteAnswerModal = () => {
    setIsAnswerMoreOpen(false);
    setIsDeleteAnswerModalOpen(true);
  };

  // ====== 댓글 더보기 메뉴 ======
  const handleOpenCommentMenu = (id, canUseMenu) => {
    if (!canUseMenu) return;
    setOpenCommentMenuId((prev) => (prev === id ? null : id));
  };

  const handleEditComment = (id) => {
    const target = comments.find((c) => c.id === id);
    if (!target) return;

    setCommentText(target.content);
    setEditingCommentId(id);
    setOpenCommentMenuId(null);
  };

  // 메뉴에서 “삭제” 클릭 → 어떤 댓글 지울지 기억 + 모달 오픈
  const handleOpenDeleteCommentModal = (id) => {
    setCommentIdToDelete(id);
    setOpenCommentMenuId(null);
    setIsDeleteCommentModalOpen(true);
  };

  // 삭제 모달의 “삭제” 버튼에서 실제 삭제 실행
  const handleConfirmDeleteComment = () => {
    if (commentIdToDelete == null) return;

    setComments((prev) => prev.filter((c) => c.id !== commentIdToDelete));

    if (editingCommentId === commentIdToDelete) {
      setEditingCommentId(null);
      setCommentText("");
    }

    setCommentIdToDelete(null);
  };

  return (
    <>
      {/* 바깥 아무 곳이나 클릭하면 메뉴 닫기 */}
      <div
        className="min-h-screen bg-bg-app flex flex-col"
        onClick={handleCloseAllMenus}
      >
        {/* 헤더 */}
        <Header
          variant="solid"
          title={answer.title}
          leftIcon={
            <img src="/icons/back.svg" alt="뒤로가기" className="w-6 h-6" />
          }
          onLeftClick={handleBack}
        />

        <main className="flex-1 flex flex-col">
          {/* 상단 영상 + STT 영역 */}
          <section className="bg-yellow-20 px-6 py-4">
            <div className="relative">
              {/* 작성자 정보 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-10 flex items-center justify-center">
                    <span className="text-xs text-gray-80">
                      {answer.authorName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-main">
                      {answer.authorName}
                    </p>
                    <p className="text-xs text-gray-60">{answer.dateLabel}</p>
                  </div>
                </div>

                {/* 영상 더보기: 이번 주차 + 내가 쓴 답변일 때만 */}
                {isCurrentWeek && isMyAnswer && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAnswerMore();
                      }}
                      className="p-1"
                      aria-label="영상 더보기"
                    >
                      <img
                        src="/icons/more-vert.svg"
                        alt="더보기"
                        className="w-4 h-4"
                      />
                    </button>

                    {isAnswerMoreOpen && (
                      <div className="absolute right-0 mt-2 z-30">
                        <MoreMenuBox
                          variant="icon"
                          items={[
                            {
                              key: "edit",
                              label: "수정",
                              iconSrc: "/icons/edit.svg",
                              onClick: handleEditAnswer,
                            },
                            {
                              key: "delete",
                              label: "삭제",
                              iconSrc: "/icons/delete.svg",
                              onClick: handleOpenDeleteAnswerModal,
                            },
                          ]}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 영상 썸네일 (더미) */}
              <div className="w-full aspect-video bg-gray-20 rounded-2xl flex items-center justify-center">
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow"
                >
                  <img src="/icons/play.svg" alt="재생" className="w-6 h-6" />
                </button>
              </div>

              {/* STT 텍스트 */}
              <p className="mt-4 text-sm text-text-main whitespace-pre-line">
                {answer.sttText}
              </p>
            </div>
          </section>

          {/* 댓글 목록 */}
          <section className="flex-1 bg-app px-6 py-4 space-y-6 overflow-y-auto pb-30">
            {comments.map((comment) => {
              const isMyComment = comment.authorName === CURRENT_USER_NAME;
              const canUseMenu = isCurrentWeek && isMyComment;

              return (
                <div key={comment.id} className="relative">
                  <CommentItem
                    authorName={comment.authorName}
                    dateLabel={comment.dateLabel}
                    content={comment.content}
                    onMoreClick={
                      canUseMenu
                        ? () => handleOpenCommentMenu(comment.id, canUseMenu)
                        : undefined
                    }
                  />

                  {openCommentMenuId === comment.id && canUseMenu && (
                    <div className="absolute right-0 bottom-full mb-2 z-20">
                      <MoreMenuBox
                        variant="icon"
                        items={[
                          {
                            key: "edit",
                            label: "수정",
                            iconSrc: "/icons/edit.svg",
                            onClick: () => handleEditComment(comment.id),
                          },
                          {
                            key: "delete",
                            label: "삭제",
                            iconSrc: "/icons/delete.svg",
                            onClick: () =>
                              handleOpenDeleteCommentModal(comment.id),
                          },
                        ]}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        </main>

        {/* 댓글 입력 바 */}
        <CommentInputBar
          value={commentText}
          onChange={setCommentText}
          onSubmit={handleSubmitComment}
          placeholder={
            isCurrentWeek
              ? "댓글을 입력해주세요"
              : "현재 주차에는 댓글을 남길 수 없어요"
          }
          disabled={!isCurrentWeek}
        />
      </div>

      {/* ===== 영상 삭제 확인 모달 ===== */}
      <ConfirmModal
        isOpen={isDeleteAnswerModalOpen}
        onClose={() => setIsDeleteAnswerModalOpen(false)}
        title="영상 답변 삭제"
        description={"삭제한 영상은 되돌릴 수 없어요.\n정말 삭제하시겠어요?"}
        layout="inline"
        primaryLabel="삭제"
        secondaryLabel="취소"
        onPrimary={handleDeleteAnswer}
        onSecondary={() => {}}
      />

      {/* ===== 댓글 삭제 확인 모달 ===== */}
      <ConfirmModal
        isOpen={isDeleteCommentModalOpen}
        onClose={() => {
          setIsDeleteCommentModalOpen(false);
          setCommentIdToDelete(null);
        }}
        title="댓글 삭제"
        description="삭제한 댓글은 되돌릴 수 없어요."
        layout="inline"
        primaryLabel="삭제"
        secondaryLabel="취소"
        onPrimary={handleConfirmDeleteComment}
        onSecondary={() => {}}
      />
    </>
  );
}
