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
    // ✅ commentCount는 배열 길이와 맞춰두기
    commentCount: 2,
  },
  {
    id: 2,
    authorName: "엄마",
    dateLabel: "11월 10일",
    content: "주말에 가족들이랑 같이 밥 먹으면서 이런저런 이야기를 나눴어요.",
    images: [],
    comments: [], // 없으면 그냥 빈 배열
    commentCount: 0,
  },
];

export default function DailyRecords() {
  const location = useLocation();
  const navigate = useNavigate();

  const [records, setRecords] = useState(MOCK_RECORDS);
  const [openRecordMenuId, setOpenRecordMenuId] = useState(null);

  // ✅ 삭제 모달 상태
  const [isDeleteRecordModalOpen, setIsDeleteRecordModalOpen] = useState(false);
  const [recordIdToDelete, setRecordIdToDelete] = useState(null);

  const albumInputRef = useRef(null);

  // 댓글 토스트 상태
  const [isCommentToastOpen, setIsCommentToastOpen] = useState(false);

  // ✅ 어떤 기록의 댓글을 보고 있는지 id만 저장
  const [commentTargetId, setCommentTargetId] = useState(null);
  const [commentInput, setCommentInput] = useState("");

  // ✅ 항상 최신 records에서 대상 기록을 찾아서 씀
  const activeRecordForComments = useMemo(
    () => records.find((r) => r.id === commentTargetId) ?? null,
    [records, commentTargetId]
  );

  // ✅ 댓글 아이콘 클릭 → 토스트 열기
  const handleOpenComments = (recordId) => {
    setCommentTargetId(recordId);
    setCommentInput("");
    setIsCommentToastOpen(true);
  };

  const handleCloseComments = () => {
    setIsCommentToastOpen(false);
    setCommentTargetId(null);
    setCommentInput("");
  };

  const handleSubmitComment = () => {
    if (!commentInput.trim() || !activeRecordForComments) return;

    // 댓글 데이터 구조에 맞게 수정해서 사용하면 됨
    const newComment = {
      id: Date.now(),
      authorName: CURRENT_USER_NAME,
      dateLabel: "오늘", // TODO: 실제 날짜 포맷으로 교체
      content: commentInput.trim(),
      isMine: true,
    };

    // ✅ 현재 기록에 댓글 추가 (records 상태 갱신)
    setRecords((prev) =>
      prev.map((record) =>
        record.id === activeRecordForComments.id
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
      // 한 번 반영 후 state 비우기
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // 배경 클릭 시 모든 메뉴 닫기
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

    // NewDailyPost를 "수정 모드"로 열기
    navigate("/daily/new", {
      state: {
        editPost: target, // 기존 글 전체를 넘겨둠
      },
    });
  };

  const handleRecordDelete = (id) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
  };

  // 메뉴에서 "삭제" 클릭 → 어떤 글 지울지 기억 + 모달 오픈
  const handleOpenDeleteRecordModal = (id) => {
    setRecordIdToDelete(id);
    setOpenRecordMenuId(null); // 더보기 박스 닫기
    setIsDeleteRecordModalOpen(true);
  };

  // 모달에서 '삭제' 눌렀을 때
  const handleConfirmDeleteRecord = () => {
    if (recordIdToDelete == null) return;
    handleRecordDelete(recordIdToDelete);
    setRecordIdToDelete(null);
    setIsDeleteRecordModalOpen(false);
  };

  // 모달에서 '취소' 또는 바깥 클릭
  const handleCloseDeleteRecordModal = () => {
    setIsDeleteRecordModalOpen(false);
    setRecordIdToDelete(null);
  };

  // 글쓰기 버튼 클릭 → 바로 파일 선택(앨범/카메라) UI 열기
  const handleWriteButtonClick = (e) => {
    e.stopPropagation(); // 배경 onClick 막기
    if (albumInputRef.current) {
      albumInputRef.current.click();
    }
  };

  // 파일 선택/촬영이 끝난 뒤 호출되는 처리
  const handleAlbumChange = (e) => {
    const { files } = e.target;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    console.log("선택된 파일들:", fileArray);

    // 새 게시물 작성 페이지로 이동
    navigate("/daily/new", {
      state: {
        files: fileArray,
      },
    });

    // 같은 파일을 다시 선택해도 change 이벤트가 잘 발생하도록 value 초기화
    e.target.value = "";
  };

  return (
    <div
      className="min-h-screen bg-bg-app flex flex-col"
      onClick={handleCloseAllMenus}
    >
      {/* 헤더: "일상 기록" */}
      <Header variant="plain" title="일상 기록" />

      {/* 피드 리스트 – 바텀탭/플로팅 버튼에 안 가리도록 패딩 */}
      <main className="flex-1 overflow-y-auto pb-32">
        {records.map((record) => {
          const isMyRecord = record.authorName === CURRENT_USER_NAME;

          return (
            <div
              key={record.id}
              className="relative mb-4"
              // onClick={(e) => e.stopPropagation()} // 카드 클릭해도 메뉴 안 닫히게
            >
              <DailyRecordCard
                id={record.id}
                authorName={record.authorName}
                dateLabel={record.dateLabel}
                content={record.content}
                images={record.images}
                commentCount={record.commentCount}
                // 내가 쓴 글일 때만 더보기 버튼 활성화
                onMoreClick={isMyRecord ? handleOpenRecordMenu : undefined}
                onCommentClick={handleOpenComments}
              />

              {/* 더보기 박스도 내가 쓴 글일 때만 표시 */}
              {openRecordMenuId === record.id && isMyRecord && (
                <div
                  className="absolute right-4 top-4 z-30"
                  onClick={(e) => e.stopPropagation()} // 박스 안 클릭 시 배경 onClick 막기
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
        onClick={(e) => e.stopPropagation()} // 이 영역 클릭해도 배경 onClick 안 타게
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

      {/* 하단 네비게이션 */}
      <BottomNav />

      {/* 숨겨진 파일 입력 – 이미지/영상 모두, 앨범/카메라 선택 가능 */}
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
    </div>
  );
}
