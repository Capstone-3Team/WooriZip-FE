import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/layouts/Header";
import CommentInputBar from "@/components/comments/CommentInputBar";
import CommentItem from "@/components/comments/CommentItem";
import MoreMenuBox from "@/components/MoreMenuBox";
import ConfirmModal from "@/components/ConfirmModal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const TOKEN_STORAGE_KEY = "accessToken";

// 날짜 라벨 변환: 2025. 11. 14. 형식
function formatDateLabel(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}. ${month}. ${day}.`;
}

function buildThumbnailSrc(thumbnailUrl) {
  if (!thumbnailUrl) return "";
  if (thumbnailUrl.startsWith("data:image")) return thumbnailUrl;
  return `data:image/jpeg;base64,${thumbnailUrl}`;
}

function getAuthHeaders() {
  const token =
    localStorage.getItem(TOKEN_STORAGE_KEY) ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function VideoAnswerDetail() {
  const navigate = useNavigate();
  const { answerId } = useParams();

  const [answer, setAnswer] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [isAnswerMoreOpen, setIsAnswerMoreOpen] = useState(false);
  const [openCommentMenuId, setOpenCommentMenuId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [isDeleteAnswerModalOpen, setIsDeleteAnswerModalOpen] = useState(false);
  const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] =
    useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState(null);
  const [isCurrentWeek, setIsCurrentWeek] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isMyAnswer = !!answer?.isMine;

  const handleBack = () => {
    navigate(-1);
  };

  // 백엔드 댓글 응답 → 화면용 모델로 변환
  const mapComment = (data, isMineDefault = false) => ({
    id: data.id,
    content: data.content,
    authorName: data.nickname || "가족", // 댓글 작성자 닉네임만 사용 (영상 작성자 이름으로 fallback 하지 말기)
    authorProfileImageUrl:
      data.profileImageUrl || data.writerProfile || data.profileImage || null, // 댓글 작성자 프로필 이미지 저장
    dateLabel: formatDateLabel(data.createdAt),
    // POST/PUT 직후 owner 값이 없을 수 있으므로 보정
    isMine: typeof data.owner === "boolean" ? data.owner : !!isMineDefault,
  });

  // 댓글 목록 다시 불러오기 (작성/수정 후 사용)
  const reloadComments = async (videoAnswerId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/video-answer-comment?videoAnswerId=${videoAnswerId}`,
        { headers: { ...getAuthHeaders() } }
      );

      if (!res.ok) {
        console.error("댓글 목록을 다시 불러오지 못했습니다.");
        return;
      }

      const json = await res.json();
      const mapped = (json ?? []).map((item) => mapComment(item));
      setComments(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  // 상세 + 댓글 + 현재 주차 질문 동시 조회
  useEffect(() => {
    if (!answerId) return;

    const fetchAll = async () => {
      try {
        setIsLoading(true);
        setError("");

        const headers = {
          ...getAuthHeaders(),
        };

        const [answerRes, commentsRes, currentQRes] = await Promise.all([
          fetch(`${API_BASE_URL}/video-answer/${answerId}`, { headers }),
          fetch(
            `${API_BASE_URL}/video-answer-comment?videoAnswerId=${answerId}`,
            { headers }
          ),
          fetch(`${API_BASE_URL}/question/current`, { headers }),
        ]);

        if (!answerRes.ok) {
          throw new Error("영상 답변을 불러오지 못했습니다.");
        }

        const answerJson = await answerRes.json();

        // 현재 주차인지 여부 계산
        if (currentQRes.ok) {
          const currentQ = await currentQRes.json();
          setIsCurrentWeek(currentQ.id === answerJson.questionId);
        } else {
          setIsCurrentWeek(false);
        }

        setAnswer({
          id: answerJson.id,
          questionId: answerJson.questionId,
          videoUrl: answerJson.videoUrl,
          thumbnailUrl: buildThumbnailSrc(answerJson.thumbnailUrl),
          title: answerJson.title,
          summary: answerJson.summary,
          sttText: answerJson.summary, // STT 별도 필드 생기면 교체
          authorName: answerJson.nickname || "가족",
          authorProfileImageUrl: answerJson.profileImageUrl || null,
          isMine: !!answerJson.owner,
          dateLabel: formatDateLabel(answerJson.createdAt),
        });

        if (commentsRes.ok) {
          const commentsJson = await commentsRes.json();
          const mapped = (commentsJson ?? []).map((item) => mapComment(item));
          setComments(mapped);
        } else {
          setComments([]);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "알 수 없는 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [answerId]);

  // 댓글 작성 / 수정
  const handleSubmitComment = async () => {
    if (!answer) return;
    const trimmed = commentText.trim();
    if (!trimmed) return;

    try {
      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      };

      // 수정
      if (editingCommentId !== null) {
        const res = await fetch(
          `${API_BASE_URL}/video-answer-comment/${editingCommentId}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({
              videoAnswerId: answer.id,
              content: trimmed,
            }),
          }
        );

        if (!res.ok) throw new Error("댓글을 수정하지 못했습니다.");

        // ✅ 응답 JSON으로 로컬 보정하지 말고, 서버에서 한 번 더 전체 목록 가져오기
        await reloadComments(answer.id);

        setEditingCommentId(null);
        setCommentText("");
        return;
      }

      // 새 댓글
      const res = await fetch(`${API_BASE_URL}/video-answer-comment`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          videoAnswerId: answer.id,
          content: trimmed,
        }),
      });

      if (!res.ok) throw new Error("댓글을 작성하지 못했습니다.");

      // ✅ 새 댓글도 마찬가지로 전체 목록 다시 조회
      await reloadComments(answer.id);

      setCommentText("");
    } catch (err) {
      console.error(err);
      alert(err.message || "댓글 처리 중 오류가 발생했습니다.");
    }
  };

  // 메뉴 닫기
  const handleCloseAllMenus = () => {
    setIsAnswerMoreOpen(false);
    setOpenCommentMenuId(null);
  };

  // 답변 더보기
  const handleToggleAnswerMore = () => {
    if (!isCurrentWeek || !isMyAnswer) return;
    setIsAnswerMoreOpen((prev) => !prev);
  };

  const handleEditAnswer = () => {
    if (!answer || !isCurrentWeek || !isMyAnswer) return;

    navigate("/answers/new", {
      state: {
        videoAnswerId: answer.id,
        questionId: answer.questionId,
        videoUrl: answer.videoUrl,
        thumbnailUrl: answer.thumbnailUrl,
        title: answer.title,
        description: answer.summary,
      },
    });

    setIsAnswerMoreOpen(false);
  };

  const handleOpenDeleteAnswerModal = () => {
    setIsAnswerMoreOpen(false);
    setIsDeleteAnswerModalOpen(true);
  };

  const handleDeleteAnswer = async () => {
    if (!answer) return;

    try {
      const res = await fetch(`${API_BASE_URL}/video-answer/${answer.id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) throw new Error("영상 답변을 삭제하지 못했습니다.");

      navigate("/week-answer", { replace: true });
    } catch (err) {
      console.error(err);
      alert(err.message || "영상 삭제 중 오류가 발생했습니다.");
    }
  };

  // 댓글 메뉴
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

  const handleOpenDeleteCommentModal = (id) => {
    setCommentIdToDelete(id);
    setOpenCommentMenuId(null);
    setIsDeleteCommentModalOpen(true);
  };

  const handleConfirmDeleteComment = async () => {
    if (commentIdToDelete == null) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/video-answer-comment/${commentIdToDelete}`,
        {
          method: "DELETE",
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      if (!res.ok) throw new Error("댓글을 삭제하지 못했습니다.");

      setComments((prev) => prev.filter((c) => c.id !== commentIdToDelete));

      if (editingCommentId === commentIdToDelete) {
        setEditingCommentId(null);
        setCommentText("");
      }

      setCommentIdToDelete(null);
    } catch (err) {
      console.error(err);
      alert(err.message || "댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <div
        className="min-h-screen bg-bg-app flex flex-col"
        onClick={handleCloseAllMenus}
      >
        <Header
          variant="solid"
          title={answer?.title || "영상 답변"}
          leftIcon={
            <img src="/icons/back.svg" alt="뒤로가기" className="w-6 h-6" />
          }
          onLeftClick={handleBack}
        />

        <main className="flex-1 flex flex-col">
          {/* 상단 영상 + STT */}
          <section className="bg-yellow-20 px-6 py-4">
            <div className="relative">
              {/* 작성자 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-10 flex items-center justify-center overflow-hidden">
                    {answer?.authorProfileImageUrl ? (
                      <img
                        src={answer.authorProfileImageUrl}
                        alt={answer.authorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-80">
                        {answer?.authorName?.[0] ?? "가"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-main">
                      {answer?.authorName ?? ""}
                    </p>
                    <p className="text-xs text-gray-60">
                      {answer?.dateLabel ?? ""}
                    </p>
                  </div>
                </div>

                {/* 더보기: 이번 주 + 내 답변일 때만 */}
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

              {/* 썸네일 */}
              <div className="w-full aspect-video bg-gray-20 rounded-2xl flex items-center justify-center overflow-hidden">
                {answer?.thumbnailUrl ? (
                  <img
                    src={answer.thumbnailUrl}
                    alt="영상 썸네일"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <button
                    type="button"
                    className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow"
                  >
                    <img src="/icons/play.svg" alt="재생" className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* STT/요약 텍스트 */}
              <p className="mt-4 text-sm text-text-main whitespace-pre-line">
                {answer?.sttText ?? ""}
              </p>
            </div>
          </section>

          {/* 댓글 목록 */}
          <section className="flex-1 bg-app px-6 py-4 space-y-6 overflow-y-auto pb-30">
            {isLoading && !answer && (
              <p className="text-sm text-gray-80">불러오는 중입니다...</p>
            )}

            {error && (
              <p className="text-sm text-red-500 whitespace-pre-line">
                {error}
              </p>
            )}

            {!error &&
              comments.map((comment) => {
                const canUseMenu = isCurrentWeek && comment.isMine;

                return (
                  <div key={comment.id} className="relative">
                    <CommentItem
                      authorName={comment.authorName}
                      dateLabel={comment.dateLabel}
                      content={comment.content}
                      imageSrc={comment.authorProfileImageUrl}
                      onMoreClick={
                        canUseMenu
                          ? () => handleOpenCommentMenu(comment.id, canUseMenu)
                          : undefined
                      }
                    />

                    {openCommentMenuId === comment.id && canUseMenu && (
                      <div className="absolute right-1 top-8 z-20">
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

      {/* 영상 삭제 모달 */}
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

      {/* 댓글 삭제 모달 */}
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
