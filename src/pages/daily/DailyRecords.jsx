import { useRef, useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import BottomNav from "@/layouts/BottomNav";
import MoreMenuBox from "@/components/MoreMenuBox";
import DailyRecordCard from "@/components/DailyRecordCard";
import CommentToastModal from "@/components/comments/CommentToastModal";
import ConfirmModal from "@/components/ConfirmModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// TODO: 백엔드에서 내 글 여부(isMine) 또는 작성자 id를 내려주면
//       내 글/댓글에만 수정·삭제 버튼을 노출하도록 개선하기.

/** ISO → 'MM월 DD일' */
function formatDateLabel(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  const month = d.getMonth() + 1;
  const date = d.getDate();
  return `${month}월 ${date}일`;
}

// ==============================
// 1. 일상 기록 페이지 컴포넌트
// ==============================
export default function DailyRecords() {
  const location = useLocation();
  const navigate = useNavigate();

  // ===== 게시글 목록 / 로딩 상태 =====
  const [records, setRecords] = useState([]); // 화면에 렌더링할 일상 기록 배열
  const [isLoading, setIsLoading] = useState(true); // 초기 데이터 로딩 여부
  const [loadError, setLoadError] = useState(""); // 로딩 실패 시 에러 메시지

  // ===== 각 일상 기록 카드의 "더보기" 메뉴 상태 =====
  const [openRecordMenuId, setOpenRecordMenuId] = useState(null); // 현재 더보기 메뉴가 열려 있는 record id

  // ===== 글 삭제 모달 =====
  const [isDeleteRecordModalOpen, setIsDeleteRecordModalOpen] = useState(false); // 글 삭제 모달 열림 여부
  const [recordIdToDelete, setRecordIdToDelete] = useState(null); // 삭제 대상 글 id

  // ===== 앨범(파일 선택) input 참조 =====
  const albumInputRef = useRef(null);

  // ===== 댓글 토스트 상태 =====
  const [isCommentToastOpen, setIsCommentToastOpen] = useState(false); // 댓글 토스트 모달 열림 여부
  const [commentTargetId, setCommentTargetId] = useState(null); // 댓글을 보고 있는 대상 글 id
  const [commentInput, setCommentInput] = useState(""); // 댓글 입력창 내용

  // ===== 댓글 수정 / 삭제용 상태 =====
  const [editingCommentId, setEditingCommentId] = useState(null); // 수정 중인 댓글 id
  const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] =
    useState(false); // 댓글 삭제 모달 열림 여부
  const [commentIdToDelete, setCommentIdToDelete] = useState(null); // 삭제 대상 댓글 id

  // ==============================
  // 2. 초기 게시글 목록 조회
  // ==============================
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      // 토큰이 없으면 로그인 페이지로 보냄
      navigate("/login");
      return;
    }

    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        // 전체 일상 기록 조회
        const res = await fetch(`${API_BASE_URL}/post`, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          // 토큰 만료 또는 인증 실패 → 로그인 화면으로
          localStorage.removeItem("accessToken");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("일상 기록을 불러오지 못했습니다.");
        }

        const data = await res.json();

        const mapped = (data || []).map((item) => {
          // 상대 경로를 절대 URL로 변환하기 위한 prefix
          const prefix = API_BASE_URL?.replace(/\/$/, "") ?? "";

          // 상대/절대 경로를 통일하기 위한 헬퍼
          const toAbsoluteUrl = (url) => {
            if (!url) return url;
            // 이미 http 또는 blob: 으로 시작하면 그대로 사용
            if (url.startsWith("http") || url.startsWith("blob:")) return url;
            // 그렇지 않으면 백엔드 base URL 기준으로 붙여줌
            const cleaned = url.startsWith("/") ? url : `/${url}`;
            return `${prefix}${cleaned}`;
          };

          // 작성자 이름
          const authorName =
            item.writerNickname ??
            item.nickname ??
            item.familyMemberName ??
            item.authorName ??
            item.writerName ??
            "가족";

          // 작성자 프로필
          let profileImage = item.writerProfile ?? item.profileImage ?? null;
          if (profileImage) {
            profileImage = toAbsoluteUrl(profileImage);
          }

          // ✅ 이미지 & 영상 구분 (확장자 기준)
          let images = [];
          let videoUrl = null;

          // backend가 mediaUrl 또는 mediaUrls[0] 에 대표 미디어를 넣는다고 가정
          const rawMediaUrls =
            (Array.isArray(item.mediaUrls) && item.mediaUrls.length > 0
              ? item.mediaUrls
              : null) || [];

          // 대표 후보: mediaUrl 우선, 없으면 mediaUrls[0]
          const mainRawUrl = item.mediaUrl || rawMediaUrls[0] || null;

          const isVideo =
            mainRawUrl && /\.(mp4|mov|m4v|webm|ogg)$/i.test(mainRawUrl); // 🔥 확장자로 판단

          if (isVideo) {
            // 영상 글: videoUrl만 세팅
            videoUrl = toAbsoluteUrl(mainRawUrl);
          } else {
            // 이미지 글: mediaUrls / imageUrls / files / imageUrl / thumbnailUrl 다 모아서 이미지 배열로
            if (rawMediaUrls.length > 0) {
              images = rawMediaUrls;
            } else if (Array.isArray(item.imageUrls)) {
              images = item.imageUrls;
            } else if (Array.isArray(item.files)) {
              images = item.files;
            } else if (item.imageUrl) {
              images = [item.imageUrl];
            } else if (item.thumbnailUrl) {
              images = [item.thumbnailUrl];
            }

            images = images.map(toAbsoluteUrl);
          }

          return {
            id: item.id,
            authorName,
            profileImage,
            dateLabel: formatDateLabel(item.createdAt),
            content: item.description ?? "",
            images,
            videoUrl, // DailyRecordCard 쪽에서 이 값이 있으면 영상 카드로 렌더링
            commentCount: item.commentCount ?? 0,
            comments: [], // 댓글 토스트 열릴 때 별도로 채움
          };
        });

        setRecords(mapped);
      } catch (error) {
        console.error(error);
        setLoadError("일상 기록을 불러오지 못했어요.");
      } finally {
        setIsLoading(false);
      }
    };

    // location.key를 의존성에 넣었기 때문에
    // 같은 페이지에서 뒤로가기/다시 들어오기 등에도 재조회됨
    fetchPosts();
  }, [navigate, location.key]);

  // ====== 특정 게시글의 댓글 목록 조회 ======
  const fetchCommentsForPost = async (postId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/post-comment/${postId}`, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // 인증 에러 시 로그인으로
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("accessToken");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("댓글을 불러오지 못했습니다.");
      }

      const data = await res.json();

      const prefix = API_BASE_URL?.replace(/\/$/, "") ?? "";

      const mapped = (data || []).map((c) => {
        // 스웨거 응답 필드에 맞춰 사용
        const authorName = c.writerNickname ?? "가족";

        let profileImage = c.writerProfile ?? null;
        if (profileImage) {
          if (!profileImage.startsWith("http")) {
            const cleaned = profileImage.startsWith("/")
              ? profileImage
              : `/${profileImage}`;
            profileImage = `${prefix}${cleaned}`;
          }
        }

        return {
          id: c.id,
          authorName,
          authorProfileImageUrl: profileImage,
          dateLabel: formatDateLabel(c.createdAt),
          content: c.content ?? "",
        };
      });

      // records 중 해당 게시글의 comments / commentCount만 갱신
      setRecords((prev) =>
        prev.map((record) =>
          record.id === postId
            ? {
                ...record,
                comments: mapped,
                commentCount: mapped.length,
              }
            : record
        )
      );
    } catch (error) {
      console.error(error);
      // 댓글만 실패해도 페이지 전체는 유지
    }
  };

  // ==============================
  // 4. 현재 댓글을 열어둔 게시글 정보 메모이제이션
  // ==============================

  // commentTargetId와 records를 기준으로 항상 최신 record를 참조
  const activeRecordForComments = useMemo(
    () => records.find((r) => r.id === commentTargetId) ?? null,
    [records, commentTargetId]
  );

  // 댓글 아이콘 클릭 → 댓글 목록 조회 후 토스트 열기
  const handleOpenComments = async (recordId) => {
    setCommentTargetId(recordId);
    setCommentInput("");
    setEditingCommentId(null);
    await fetchCommentsForPost(recordId); // 댓글 목록 최신화
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

  // ==============================
  // 5. 댓글 작성 / 수정 / 삭제
  // ==============================

  const handleSubmitComment = async () => {
    if (!commentInput.trim() || !activeRecordForComments) return;

    const trimmed = commentInput.trim();
    const targetRecordId = activeRecordForComments.id;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // 수정 모드
      if (editingCommentId !== null) {
        const url = `${API_BASE_URL}/post-comment/${editingCommentId}?content=${encodeURIComponent(
          trimmed
        )}`;

        const res = await fetch(url, {
          method: "PUT",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          alert("본인이 작성한 댓글만 수정할 수 있어요.");
          return;
        }

        if (!res.ok) {
          throw new Error("댓글을 수정하지 못했습니다.");
        }
      } else {
        // 새 댓글 작성
        const url = `${API_BASE_URL}/post-comment?postId=${targetRecordId}&content=${encodeURIComponent(
          trimmed
        )}`;

        const res = await fetch(url, {
          method: "POST",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          // 댓글 작성도 인증 필요 → 토큰 제거 후 로그인으로
          localStorage.removeItem("accessToken");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("댓글을 작성하지 못했습니다.");
        }
      }

      // 성공 후 댓글 목록 다시 조회
      await fetchCommentsForPost(targetRecordId);

      setEditingCommentId(null);
      setCommentInput("");
    } catch (error) {
      console.error(error);
      alert("댓글 처리 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  // 댓글 수정 시작 → 토스트 입력창에 기존 내용 채워넣기
  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setCommentInput(comment.content);
  };

  // 댓글 삭제 모달 열기
  const handleOpenDeleteCommentModal = (commentId) => {
    setCommentIdToDelete(commentId);
    setIsDeleteCommentModalOpen(true);
  };

  // 댓글 삭제 확정
  const handleConfirmDeleteComment = async () => {
    if (commentIdToDelete == null || !activeRecordForComments) return;

    const targetRecordId = activeRecordForComments.id;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/post-comment/${commentIdToDelete}`,
        {
          method: "DELETE",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401 || res.status === 403) {
        alert("본인이 작성한 댓글만 삭제할 수 있어요.");
        return;
      }

      if (!res.ok) {
        throw new Error("댓글을 삭제하지 못했습니다.");
      }

      // 삭제 후 댓글 목록 재조회
      await fetchCommentsForPost(targetRecordId);
    } catch (error) {
      console.error(error);
      alert("댓글 삭제 중 오류가 발생했어요.");
    } finally {
      // 수정 중이던 댓글을 삭제한 경우 수정 상태 초기화
      if (editingCommentId === commentIdToDelete) {
        setEditingCommentId(null);
        setCommentInput("");
      }
      setCommentIdToDelete(null);
      setIsDeleteCommentModalOpen(false);
    }
  };

  const handleCloseDeleteCommentModal = () => {
    setIsDeleteCommentModalOpen(false);
    setCommentIdToDelete(null);
  };

  // ==============================
  // 6. 게시글 더보기 메뉴 & 글 삭제
  // ==============================

  const handleCloseAllMenus = () => {
    setOpenRecordMenuId(null);
  };

  // 특정 게시글의 더보기 메뉴 열기/닫기
  const handleOpenRecordMenu = (id) => {
    setOpenRecordMenuId((prev) => (prev === id ? null : id));
  };

  // 글 수정 버튼 클릭 → /daily/new 로 이동 (state로 editPost 전달)
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

  // 실제 DELETE 요청
  const handleRecordDelete = async (id) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/post/${id}`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("[DELETE /post]", id, res.status);

      if (res.status === 401 || res.status === 403) {
        const msg = await res.text().catch(() => "");
        console.error("delete forbidden:", msg);
        alert("본인이 작성한 일상 기록만 삭제할 수 있어요.");
        return;
      }

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        console.error("delete failed:", msg);
        throw new Error("일상 기록을 삭제하지 못했습니다.");
      }

      // 성공하면 해당 record를 목록에서 제거
      setRecords((prev) => prev.filter((record) => record.id !== id));
    } catch (error) {
      console.error(error);
      alert("기록 삭제 중 오류가 발생했어요.");
    }
  };

  // 글 삭제 모달 열기
  const handleOpenDeleteRecordModal = (id) => {
    setRecordIdToDelete(id);
    setOpenRecordMenuId(null);
    setIsDeleteRecordModalOpen(true);
  };

  // 글 삭제 확정
  const handleConfirmDeleteRecord = async () => {
    if (recordIdToDelete == null) return;
    await handleRecordDelete(recordIdToDelete); // 재조회
    setRecordIdToDelete(null);
    setIsDeleteRecordModalOpen(false);
  };

  const handleCloseDeleteRecordModal = () => {
    setIsDeleteRecordModalOpen(false);
    setRecordIdToDelete(null);
  };

  // ==============================
  // 7. 글쓰기(앨범에서 선택) 관련
  // ==============================

  // "글쓰기" 버튼 클릭 → 숨겨진 file input 클릭 트리거
  const handleWriteButtonClick = (e) => {
    e.stopPropagation();
    if (albumInputRef.current) {
      albumInputRef.current.click();
    }
  };

  // 앨범에서 파일 선택 시 호출
  const handleAlbumChange = (e) => {
    const { files } = e.target;
    if (!files || files.length === 0) return;

    // FileList → 실제 배열로 변환
    const fileArray = Array.from(files);

    // /daily/new 페이지로 이동하면서 선택한 파일들을 state로 넘김
    navigate("/daily/new", {
      state: {
        files: fileArray,
      },
    });

    // 같은 파일을 다시 선택할 수 있도록 value 초기화
    e.target.value = "";
  };

  // ==============================
  // 8. 렌더링
  // ==============================

  return (
    <div
      className="min-h-screen bg-bg-app flex flex-col"
      onClick={handleCloseAllMenus}
    >
      <Header variant="plain" title="일상 기록" bgClassName="bg-yellow-20" />

      {/* 메인 영역: 스크롤 가능 */}
      <main className="flex-1 overflow-y-auto pb-32">
        {isLoading ? (
          <p className="px-4 pt-4 text-sm text-gray-60">
            일상 기록을 불러오는 중이에요…
          </p>
        ) : loadError ? (
          <p className="px-4 pt-4 text-sm text-red-500">{loadError}</p>
        ) : records.length === 0 ? (
          <p className="px-4 pt-4 text-sm text-gray-60">
            아직 등록된 일상 기록이 없어요.
          </p>
        ) : (
          records.map((record) => (
            <div key={record.id} className="relative mb-4">
              <DailyRecordCard
                id={record.id}
                authorName={record.authorName}
                dateLabel={record.dateLabel}
                content={record.content}
                images={record.images}
                commentCount={record.commentCount}
                profileImage={record.profileImage}
                videoUrl={record.videoUrl}
                // TODO: isMine 정보를 받게 되면 내 글에만 onMoreClick을 넘기도록 변경
                onMoreClick={handleOpenRecordMenu}
                onCommentClick={handleOpenComments}
              />

              {/* 카드별 더보기 메뉴 (수정/삭제) */}
              {openRecordMenuId === record.id && (
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
          ))
        )}
      </main>

      {/* 우측 하단 "글쓰기" 버튼 */}
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

      {/* 실제로는 숨겨져 있는 앨범(file) 입력 */}
      <input
        ref={albumInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleAlbumChange}
      />

      {/* 댓글 토스트 모달 (선택된 record 기준) */}
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

      {/* 글 삭제 확인 모달 */}
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

      {/* 댓글 삭제 확인 모달 */}
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
