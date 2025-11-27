import { useRef, useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import BottomNav from "@/layouts/BottomNav";
import MoreMenuBox from "@/components/MoreMenuBox";
import DailyRecordCard from "@/components/DailyRecordCard";
import CommentToastModal from "@/components/comments/CommentToastModal";
import ConfirmModal from "@/components/ConfirmModal";

// TODO: 실제 로그인 유저 이름으로 교체
const CURRENT_USER_NAME = "나동생";

const MOCK_RECORDS = [
  {
    id: 1,
    authorName: "나동생",
    dateLabel: "11월 11일",
    content: "오늘 날씨가 너무 좋네요~ 공원 산책하기 딱 좋은 날씨였어요.",
    images: [],
    comments: [
      {
        id: 1,
        authorName: "귀요미",
        dateLabel: "11월 12일",
        content: "하긴 우리zip이 재밌긴 해~",
        isMine: false,
      },
      {
        id: 2,
        authorName: "엄마",
        dateLabel: "11월 12일",
        content: "귀엽당",
        isMine: false,
      },
    ],
    commentCount: 2,
  },
  {
    id: 2,
    authorName: "엄마",
    dateLabel: "11월 10일",
    content: "주말에 가족들이랑 같이 밥 먹으면서 이런저런 이야기를 나눴어요.",
    images: [],
    comments: [],
    commentCount: 0,
  },
];

export default function DailyRecords() {
  const location = useLocation();
  const navigate = useNavigate();

  const [records, setRecords] = useState(MOCK_RECORDS);
  const [openRecordMenuId, setOpenRecordMenuId] = useState(null);

  // ===== 글 삭제 모달 =====
  const [isDeleteRecordModalOpen, setIsDeleteRecordModalOpen] = useState(false);
  const [recordIdToDelete, setRecordIdToDelete] = useState(null);

  const albumInputRef = useRef(null);

  // ===== 댓글 토스트 상태 =====
  const [isCommentToastOpen, setIsCommentToastOpen] = useState(false);
  const [commentTargetId, setCommentTargetId] = useState(null);
  const [commentInput, setCommentInput] = useState("");

  // 댓글 수정 / 삭제용 상태
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] =
    useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState(null);

  // ✅ 항상 최신 records에서 대상 기록을 찾아서 씀
  const activeRecordForComments = useMemo(
    () => records.find((r) => r.id === commentTargetId) ?? null,
    [records, commentTargetId]
  );

  // ✅ 댓글 아이콘 클릭 → 토스트 열기
  const handleOpenComments = (recordId) => {
    setCommentTargetId(recordId);
    setCommentInput("");
    setEditingCommentId(null);
    setIsCommentToastOpen(true);
  };

  const handleCloseComments = () => {
    setIsCommentToastOpen(false);
    setCommentTargetId(null);
    setCommentInput("");
    setEditingCommentId(null);
    setCommentIdToDelete(null);
    setIsDeleteCommentModalOpen(false);
  };

  // ===== 댓글 작성 / 수정 =====
  const handleSubmitComment = () => {
    if (!commentInput.trim() || !activeRecordForComments) return;

    const trimmed = commentInput.trim();
    const targetRecordId = activeRecordForComments.id;

    // ✏️ 수정 모드
    if (editingCommentId !== null) {
      setRecords((prev) =>
        prev.map((record) => {
          if (record.id !== targetRecordId) return record;
          return {
            ...record,
            comments: (record.comments ?? []).map((c) =>
              c.id === editingCommentId ? { ...c, content: trimmed } : c
            ),
          };
        })
      );

      setEditingCommentId(null);
      setCommentInput("");
      return;
    }

    // ➕ 새 댓글 작성
    const newComment = {
      id: Date.now(),
      authorName: CURRENT_USER_NAME,
      dateLabel: "오늘", // TODO: 실제 날짜 포맷으로 교체
      content: trimmed,
      isMine: true,
    };

    setRecords((prev) =>
      prev.map((record) =>
        record.id === targetRecordId
          ? {
              ...record,
              comments: [...(record.comments ?? []), newComment],
              commentCount: (record.commentCount ?? 0) + 1,
            }
          : record
      )
    );

    setCommentInput("");
  };

  // 댓글 "수정" 클릭
  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setCommentInput(comment.content);
  };

  // 댓글 "삭제" 클릭 → 모달 오픈
  const handleOpenDeleteCommentModal = (commentId) => {
    setCommentIdToDelete(commentId);
    setIsDeleteCommentModalOpen(true);
  };

  // 댓글 삭제 확정
  const handleConfirmDeleteComment = () => {
    if (commentIdToDelete == null || !activeRecordForComments) return;

    const targetRecordId = activeRecordForComments.id;

    setRecords((prev) =>
      prev.map((record) => {
        if (record.id !== targetRecordId) return record;
        const nextComments = (record.comments ?? []).filter(
          (c) => c.id !== commentIdToDelete
        );
        return {
          ...record,
          comments: nextComments,
          commentCount: Math.max(0, (record.commentCount ?? 0) - 1),
        };
      })
    );

    if (editingCommentId === commentIdToDelete) {
      setEditingCommentId(null);
      setCommentInput("");
    }

    setCommentIdToDelete(null);
    setIsDeleteCommentModalOpen(false);
  };

  const handleCloseDeleteCommentModal = () => {
    setIsDeleteCommentModalOpen(false);
    setCommentIdToDelete(null);
  };

  // newPost를 한 번만 적용하기 위한 플래그
  const hasHandledNewPostRef = useRef(false);

  useEffect(() => {
    const { newPost, updatedPost } = location.state ?? {};

    // 새 글 추가
    if (newPost && !hasHandledNewPostRef.current) {
      setRecords((prev) => [newPost, ...prev]);
      hasHandledNewPostRef.current = true;
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    // 기존 글 수정
    if (updatedPost) {
      setRecords((prev) =>
        prev.map((record) =>
          record.id === updatedPost.id ? { ...record, ...updatedPost } : record
        )
      );
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // 배경 클릭 시 모든 "글 더보기" 메뉴 닫기
  const handleCloseAllMenus = () => {
    setOpenRecordMenuId(null);
  };

  const handleOpenRecordMenu = (id) => {
    setOpenRecordMenuId((prev) => (prev === id ? null : id));
  };

  const handleRecordEdit = (id) => {
    const target = records.find((record) => record.id === id);
    if (!target) return;

    setOpenRecordMenuId(null);

    navigate("/daily/new", {
      state: {
        editPost: target,
      },
    });
  };

  const handleRecordDelete = (id) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
  };

  const handleOpenDeleteRecordModal = (id) => {
    setRecordIdToDelete(id);
    setOpenRecordMenuId(null);
    setIsDeleteRecordModalOpen(true);
  };

  const handleConfirmDeleteRecord = () => {
    if (recordIdToDelete == null) return;
    handleRecordDelete(recordIdToDelete);
    setRecordIdToDelete(null);
    setIsDeleteRecordModalOpen(false);
  };

  const handleCloseDeleteRecordModal = () => {
    setIsDeleteRecordModalOpen(false);
    setRecordIdToDelete(null);
  };

  // 글쓰기 버튼 → 파일 선택
  const handleWriteButtonClick = (e) => {
    e.stopPropagation();
    if (albumInputRef.current) {
      albumInputRef.current.click();
    }
  };

  const handleAlbumChange = (e) => {
    const { files } = e.target;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    console.log("선택된 파일들:", fileArray);

    navigate("/daily/new", {
      state: {
        files: fileArray,
      },
    });

    e.target.value = "";
  };

  return (
    <div
      className="min-h-screen bg-bg-app flex flex-col"
      onClick={handleCloseAllMenus}
    >
      <Header variant="plain" title="일상 기록" />

      <main className="flex-1 overflow-y-auto pb-32">
        {records.map((record) => {
          const isMyRecord = record.authorName === CURRENT_USER_NAME;

          return (
            <div key={record.id} className="relative mb-4">
              <DailyRecordCard
                id={record.id}
                authorName={record.authorName}
                dateLabel={record.dateLabel}
                content={record.content}
                images={record.images}
                commentCount={record.commentCount}
                onMoreClick={isMyRecord ? handleOpenRecordMenu : undefined}
                onCommentClick={handleOpenComments}
              />

              {openRecordMenuId === record.id && isMyRecord && (
                <div
                  className="absolute right-4 top-4 z-30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreMenuBox
                    variant="icon"
                    items={[
                      {
                        key: "edit",
                        label: "수정",
                        iconSrc: "/icons/edit.svg",
                        onClick: () => handleRecordEdit(record.id),
                      },
                      {
                        key: "delete",
                        label: "삭제",
                        iconSrc: "/icons/delete.svg",
                        onClick: () => handleOpenDeleteRecordModal(record.id),
                      },
                    ]}
                  />
                </div>
              )}
            </div>
          );
        })}
      </main>

      {/* 플로팅 글쓰기 버튼 */}
      <div
        className="fixed right-6 bottom-24 z-30"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleWriteButtonClick}
          className="flex items-center gap-2 px-4 h-10 rounded-lg bg-yellow-main text-sm font-semibold text-text-main shadow-[0_2px_4px_rgba(0,0,0,0.12)] border border-text-main"
        >
          <img src="/icons/plus.svg" alt="글쓰기 추가" className="w-4 h-4" />
          글쓰기
        </button>
      </div>

      <BottomNav />

      <input
        ref={albumInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleAlbumChange}
      />

      {/* ✅ 댓글 토스트 모달 */}
      <CommentToastModal
        isOpen={isCommentToastOpen}
        onClose={handleCloseComments}
        comments={activeRecordForComments?.comments ?? []}
        commentValue={commentInput}
        onChangeComment={setCommentInput}
        onSubmitComment={handleSubmitComment}
        onStartEditComment={handleStartEditComment}
        onRequestDeleteComment={handleOpenDeleteCommentModal}
      />

      {/* ===== 일상 기록 삭제 확인 모달 ===== */}
      <ConfirmModal
        isOpen={isDeleteRecordModalOpen}
        onClose={handleCloseDeleteRecordModal}
        title="일상 기록 삭제"
        description={
          "삭제한 일상 기록은 되돌릴 수 없어요.\n정말 삭제하시겠어요?"
        }
        layout="inline"
        primaryLabel="삭제"
        secondaryLabel="취소"
        onPrimary={handleConfirmDeleteRecord}
        onSecondary={handleCloseDeleteRecordModal}
      />

      {/* ===== 댓글 삭제 확인 모달 ===== */}
      <ConfirmModal
        isOpen={isDeleteCommentModalOpen}
        onClose={handleCloseDeleteCommentModal}
        title="댓글 삭제"
        description="삭제한 댓글은 되돌릴 수 없어요."
        layout="inline"
        primaryLabel="삭제"
        secondaryLabel="취소"
        onPrimary={handleConfirmDeleteComment}
        onSecondary={handleCloseDeleteCommentModal}
      />
    </div>
  );
}
