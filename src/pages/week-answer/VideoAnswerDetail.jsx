import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/layouts/Header";
import CommentInputBar from "@/components/comments/CommentInputBar";
import CommentItem from "@/components/comments/CommentItem";
import MoreMenuBox from "@/components/MoreMenuBox";
import ConfirmModal from "@/components/ConfirmModal";

// ==============================
// 공통 상수 / 유틸 함수
// ==============================

// 백엔드 API 기본 URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// 로컬스토리지에 토큰을 저장해 둔 키 이름
const TOKEN_STORAGE_KEY = "accessToken";

/**
 * ISO 날짜 문자열 → "2025. 11. 14." 형식으로 변환
 */
function formatDateLabel(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}. ${month}. ${day}.`;
}

/**
 * 썸네일 URL 정규화
 * - 백엔드가 base64만 보낼 수도 있고(data만) data URL 전체를 보낼 수도 있어
 * - data:image로 시작하면 그대로 사용
 * - 아니면 "data:image/jpeg;base64,..." 를 앞에 붙여서 <img src>에 쓸 수 있게 만듦
 */
function buildThumbnailSrc(thumbnailUrl) {
  if (!thumbnailUrl) return "";
  if (thumbnailUrl.startsWith("data:image")) return thumbnailUrl;
  return `data:image/jpeg;base64,${thumbnailUrl}`;
}

/**
 * Authorization 헤더 생성
 * - accessToken / token / jwt 세 가지 키 중 있는 것을 사용
 */
function getAuthHeaders() {
  const token =
    localStorage.getItem(TOKEN_STORAGE_KEY) ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ==============================
// 영상 답변 상세 페이지 컴포넌트
// ==============================
export default function VideoAnswerDetail() {
  const navigate = useNavigate();
  const { answerId } = useParams(); // /answers/:answerId 에서 answerId 추출

  // 영상 답변 상세 정보
  const [answer, setAnswer] = useState(null);

  // 댓글 목록
  const [comments, setComments] = useState([]);

  // 댓글 입력창 텍스트
  const [commentText, setCommentText] = useState("");

  // 상단 영상 카드의 더보기 메뉴 열림 여부
  const [isAnswerMoreOpen, setIsAnswerMoreOpen] = useState(false);

  // 댓글별 더보기 메뉴에서 "열려 있는 댓글 id"
  const [openCommentMenuId, setOpenCommentMenuId] = useState(null);

  // 현재 수정 중인 댓글 id (없으면 null)
  const [editingCommentId, setEditingCommentId] = useState(null);

  // 영상 삭제 모달 열림 여부
  const [isDeleteAnswerModalOpen, setIsDeleteAnswerModalOpen] = useState(false);

  // 댓글 삭제 모달 열림 여부
  const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] =
    useState(false);

  // 삭제 대상으로 선택된 댓글 id
  const [commentIdToDelete, setCommentIdToDelete] = useState(null);

  // "현재 주차" 영상인지 여부 (이번 주 질문에 대한 답변인가?)
  const [isCurrentWeek, setIsCurrentWeek] = useState(false);

  // 로딩 / 에러 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 이 영상이 "내가 올린 답변"인지 여부
  // - answer.owner(또는 BE owner flag)를 기반으로 계산됨
  const isMyAnswer = !!answer?.isMine;

  // 뒤로가기
  const handleBack = () => {
    navigate(-1);
  };

  /**
   * 백엔드 댓글 응답 → 화면에서 쓰기 좋은 모델로 변환하는 함수
   */
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

  /**
   * 댓글 목록 다시 불러오기
   * - 댓글 작성/수정 후에 항상 최신 목록을 불러오기 위해 사용
   */
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

  // ==============================
  // 1) 영상 상세 + 댓글 + 현재 주차 질문 동시 조회
  // ==============================
  useEffect(() => {
    if (!answerId) return;

    const fetchAll = async () => {
      try {
        setIsLoading(true);
        setError("");

        const headers = {
          ...getAuthHeaders(),
        };

        // Promise.all로 병렬 요청:
        // - 영상 상세 /video-answer/{id}
        // - 댓글 목록 /video-answer-comment?videoAnswerId=...
        // - 현재 주차 질문 /question/current
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
        // - 현재 질문 id === 이 영상의 questionId 이면 이번 주 질문에 대한 답변
        if (currentQRes.ok) {
          const currentQ = await currentQRes.json();
          setIsCurrentWeek(currentQ.id === answerJson.questionId);
        } else {
          setIsCurrentWeek(false);
        }

        // 상세 응답 → 화면 모델로 변환
        setAnswer({
          id: answerJson.id,
          questionId: answerJson.questionId,
          videoUrl: answerJson.videoUrl,
          thumbnailUrl: buildThumbnailSrc(answerJson.thumbnailUrl),
          title: answerJson.title,
          summary: answerJson.summary,
          // STT 전용 필드가 생기면 교체할 예정. 지금은 summary를 그대로 사용.
          sttText: answerJson.summary,
          authorName: answerJson.nickname || "가족",
          authorProfileImageUrl: answerJson.profileImageUrl || null,
          isMine: !!answerJson.owner,
          dateLabel: formatDateLabel(answerJson.createdAt),
        });

        // 댓글 목록
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

  // ==============================
  // 2) 댓글 작성 / 수정
  // ==============================
  const handleSubmitComment = async () => {
    if (!answer) return;
    const trimmed = commentText.trim();
    if (!trimmed) return;

    try {
      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      };

      // (1) 댓글 수정 모드
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

        // 로컬 state를 부분 업데이트하지 않고, 서버 기준으로 전체 목록 한 번 더 조회
        await reloadComments(answer.id);

        setEditingCommentId(null);
        setCommentText("");
        return;
      }

      // (2) 새 댓글 작성
      const res = await fetch(`${API_BASE_URL}/video-answer-comment`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          videoAnswerId: answer.id,
          content: trimmed,
        }),
      });

      if (!res.ok) throw new Error("댓글을 작성하지 못했습니다.");

      // 새로 작성한 댓글도 전체 목록 다시 조회
      await reloadComments(answer.id);

      setCommentText("");
    } catch (err) {
      console.error(err);
      alert(err.message || "댓글 처리 중 오류가 발생했습니다.");
    }
  };

  // ==============================
  // 3) 더보기 메뉴 / 모달 관련 핸들러
  // ==============================

  // 배경 클릭 시 모든 더보기 메뉴 닫기
  const handleCloseAllMenus = () => {
    setIsAnswerMoreOpen(false);
    setOpenCommentMenuId(null);
  };

  // 상단 영상 카드의 더보기 메뉴 토글
  const handleToggleAnswerMore = () => {
    // 이번 주 + 내 답변일 때만 열 수 있음
    if (!isCurrentWeek || !isMyAnswer) return;
    setIsAnswerMoreOpen((prev) => !prev);
  };

  /**
   * 영상 수정 버튼
   * - AddVideoAnswer(/answers/new) 페이지로 이동하면서,
   *   기존 영상/썸네일/제목/요약 정보를 state로 넘긴다.
   */
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

  // 영상 삭제 메뉴 클릭 → 삭제 확인 모달 열기
  const handleOpenDeleteAnswerModal = () => {
    setIsAnswerMoreOpen(false);
    setIsDeleteAnswerModalOpen(true);
  };

  /**
   * 영상 삭제 확정
   * - DELETE /video-answer/{id}
   * - 성공 시 이번 주 답변 목록(WeekAnswer)로 이동
   */
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

  // 특정 댓글의 더보기 메뉴 열기/닫기
  const handleOpenCommentMenu = (id, canUseMenu) => {
    if (!canUseMenu) return;
    setOpenCommentMenuId((prev) => (prev === id ? null : id));
  };

  // 댓글 수정 메뉴 선택 → 입력창으로 내용 복사 + editingCommentId 설정
  const handleEditComment = (id) => {
    const target = comments.find((c) => c.id === id);
    if (!target) return;

    setCommentText(target.content);
    setEditingCommentId(id);
    setOpenCommentMenuId(null);
  };

  // 댓글 삭제 메뉴 선택 → 삭제 확인 모달 열기
  const handleOpenDeleteCommentModal = (id) => {
    setCommentIdToDelete(id);
    setOpenCommentMenuId(null);
    setIsDeleteCommentModalOpen(true);
  };

  /**
   * 댓글 삭제 확정
   * - DELETE /video-answer-comment/{id}
   * - 성공 시 로컬 state에서 해당 댓글 제거
   */
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

      // 삭제된 댓글을 로컬 목록에서 제거
      setComments((prev) => prev.filter((c) => c.id !== commentIdToDelete));

      // 혹시 삭제 대상이 현재 수정 중인 댓글이면 수정 상태도 초기화
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

  // ==============================
  // 4) 렌더링
  // ==============================
  return (
    <>
      {/* 바깥 div 클릭 시 더보기 메뉴들 닫히도록 onClick 설정 */}
      <div
        className="min-h-screen bg-bg-app flex flex-col"
        onClick={handleCloseAllMenus}
      >
        {/* 상단 헤더 */}
        <Header
          variant="solid"
          title={answer?.title || "영상 답변"}
          leftIcon={
            <img src="/icons/back.svg" alt="뒤로가기" className="w-6 h-6" />
          }
          onLeftClick={handleBack}
        />

        <main className="flex-1 flex flex-col">
          {/* 상단 영상 썸네일 + STT/요약 */}
          <section className="bg-yellow-20 px-6 py-4">
            <div className="relative">
              {/* 작성자 정보 영역 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* 프로필 이미지 (없으면 이니셜 렌더링) */}
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
                        e.stopPropagation(); // 바깥 클릭 이벤트로 전파되지 않게
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

              {/* 영상 썸네일 영역 */}
              <div className="w-full aspect-video bg-gray-20 rounded-2xl flex items-center justify-center overflow-hidden">
                {answer?.thumbnailUrl ? (
                  <img
                    src={answer.thumbnailUrl}
                    alt="영상 썸네일"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // 썸네일이 없을 때는 가운데 재생 버튼 아이콘만 노출
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

            {/* 에러가 없을 때만 댓글 목록 렌더링 */}
            {!error &&
              comments.map((comment) => {
                // 이번 주 + 내 댓글일 때만 더보기 메뉴 사용 가능
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

                    {/* 댓글별 더보기 메뉴 */}
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

        {/* 하단 댓글 입력 바 */}
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
