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

export default function DailyRecords() {
  const location = useLocation();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

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

  // ====== 초기 게시글 목록 조회 ======
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

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
          const prefix = API_BASE_URL?.replace(/\/$/, "") ?? "";

          const toAbsoluteUrl = (url) => {
            if (!url) return url;
            if (url.startsWith("http") || url.startsWith("blob:")) return url;
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
            videoUrl, // ✅ DailyRecordCard로 내려감
            commentCount: item.commentCount ?? 0,
            comments: [],
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
        // 📌 스웨거 응답 필드에 맞춰 사용
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

  // ✅ 항상 최신 records에서 대상 기록을 찾아서 씀
  const activeRecordForComments = useMemo(
    () => records.find((r) => r.id === commentTargetId) ?? null,
    [records, commentTargetId]
  );

  // ✅ 댓글 아이콘 클릭 → 댓글 목록 조회 후 토스트 열기
  const handleOpenComments = async (recordId) => {
    setCommentTargetId(recordId);
    setCommentInput("");
    setEditingCommentId(null);
    await fetchCommentsForPost(recordId);
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
      // ✏️ 수정 모드
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
        // ➕ 새 댓글 작성
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
          localStorage.removeItem("accessToken");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("댓글을 작성하지 못했습니다.");
        }
      }

      await fetchCommentsForPost(targetRecordId);

      setEditingCommentId(null);
      setCommentInput("");
    } catch (error) {
      console.error(error);
      alert("댓글 처리 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setCommentInput(comment.content);
  };

  const handleOpenDeleteCommentModal = (commentId) => {
    setCommentIdToDelete(commentId);
    setIsDeleteCommentModalOpen(true);
  };

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

      await fetchCommentsForPost(targetRecordId);
    } catch (error) {
      console.error(error);
      alert("댓글 삭제 중 오류가 발생했어요.");
    } finally {
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

      setRecords((prev) => prev.filter((record) => record.id !== id));
    } catch (error) {
      console.error(error);
      alert("기록 삭제 중 오류가 발생했어요.");
    }
  };

  const handleOpenDeleteRecordModal = (id) => {
    setRecordIdToDelete(id);
    setOpenRecordMenuId(null);
    setIsDeleteRecordModalOpen(true);
  };

  const handleConfirmDeleteRecord = async () => {
    if (recordIdToDelete == null) return;
    await handleRecordDelete(recordIdToDelete);
    setRecordIdToDelete(null);
    setIsDeleteRecordModalOpen(false);
  };

  const handleCloseDeleteRecordModal = () => {
    setIsDeleteRecordModalOpen(false);
    setRecordIdToDelete(null);
  };

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
      <Header variant="plain" title="일상 기록" bgClassName="bg-yellow-20" />

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
