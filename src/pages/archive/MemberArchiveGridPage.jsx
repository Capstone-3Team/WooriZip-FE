import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/layouts/Header";
import ArchiveFilterDropdown from "@/components/archive/ArchiveFilterDropdown";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DAILY_POSTS_URL = `${API_BASE_URL}/post`;
const VIDEO_ANSWER_URL = `${API_BASE_URL}/video-answer`;
const QUESTION_LIST_URL = `${API_BASE_URL}/question/list`;

function extractImageUrl(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return (
      value.url ||
      value.imageUrl ||
      value.fileUrl ||
      value.path ||
      value.location ||
      null
    );
  }
  return null;
}

function detectMediaType(url) {
  if (!url) return "image";
  const lowered = url.toLowerCase();
  if (
    lowered.endsWith(".mp4") ||
    lowered.endsWith(".mov") ||
    lowered.endsWith(".avi") ||
    lowered.endsWith(".webm")
  ) {
    return "video";
  }
  return "image";
}

function formatKoreanDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const date = d.getDate();
  return `${year}년 ${month}월 ${date}일`;
}

function mapPostToArchiveItem(post) {
  const mediaUrl =
    extractImageUrl(post.mediaUrl) ||
    (Array.isArray(post.mediaUrls) ? extractImageUrl(post.mediaUrls[0]) : null);

  if (!mediaUrl) return null;

  return {
    id: `POST_${post.id}`,
    familyMemberId: post.familyMemberId,
    familyId: post.familyId,
    nickname: post.writerNickname,
    profileImageUrl: extractImageUrl(post.writerProfile),
    createdAt: post.createdAt,
    mediaUrl,
    mediaType: detectMediaType(mediaUrl),
    source: "DAILY_POST",
  };
}

function mapVideoAnswerToArchiveItem(answer) {
  const thumbnailUrl =
    extractImageUrl(answer.thumbnailUrl) || extractImageUrl(answer.videoUrl);

  if (!thumbnailUrl) return null;

  return {
    id: `VIDEO_${answer.id}`,
    familyMemberId: answer.familyMemberId,
    familyId: answer.familyId,
    nickname: answer.nickname,
    profileImageUrl: extractImageUrl(answer.profileImageUrl),
    createdAt: answer.createdAt,
    mediaUrl: thumbnailUrl,
    mediaType: "video",
    source: "VIDEO_ANSWER",
    owner: answer.owner,
    questionId: answer.questionId,
  };
}

async function fetchAllVideoAnswers(headers) {
  try {
    // 1) 올해 질문 목록 조회
    const currentYear = new Date().getFullYear();
    const qRes = await fetch(`${QUESTION_LIST_URL}?year=${currentYear}`, {
      headers,
    });

    if (!qRes.ok) {
      console.error("failed to fetch /question/list");
      return [];
    }

    const questions = await qRes.json();
    if (!Array.isArray(questions) || questions.length === 0) {
      return [];
    }

    const questionIds = questions.map((q) => q.id);

    // 2) 각 questionId별 영상답변 조회
    const results = await Promise.all(
      questionIds.map(async (questionId) => {
        try {
          const res = await fetch(
            `${VIDEO_ANSWER_URL}?questionId=${questionId}`,
            { headers }
          );

          if (!res.ok) {
            console.error("failed to fetch /video-answer", questionId);
            return [];
          }

          const data = await res.json();
          if (!Array.isArray(data)) return [];
          return data;
        } catch (error) {
          console.error("error fetching /video-answer", questionId, error);
          return [];
        }
      })
    );

    return results.flat();
  } catch (error) {
    console.error("error in fetchAllVideoAnswers", error);
    return [];
  }
}

export default function MemberArchiveGridPage() {
  const navigate = useNavigate();
  const { memberId } = useParams();

  const [memberName, setMemberName] = useState("멤버");
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleBack = () => navigate(-1);

  useEffect(() => {
    if (!memberId) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const numericMemberId = Number(memberId);

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "*/*",
    };

    async function loadData() {
      try {
        const [postRes, videoAnswers] = await Promise.all([
          fetch(DAILY_POSTS_URL, { headers }),
          fetchAllVideoAnswers(headers),
        ]);

        if (!postRes.ok) throw new Error("failed to fetch /post");

        const posts = await postRes.json();

        const dailyItems = (Array.isArray(posts) ? posts : [])
          .map(mapPostToArchiveItem)
          .filter(Boolean)
          .filter((item) => item.familyMemberId === numericMemberId);

        const videoItems = (Array.isArray(videoAnswers) ? videoAnswers : [])
          .map(mapVideoAnswerToArchiveItem)
          .filter(Boolean)
          .filter((item) => item.familyMemberId === numericMemberId);

        const allItems = [...dailyItems, ...videoItems].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const gridItems = allItems.map((item) => ({
          id: item.id,
          type: item.mediaType,
          src: item.mediaUrl,
          dateLabel: formatKoreanDate(item.createdAt),
          isFavorite: false,
        }));

        setItems(gridItems);

        if (allItems[0]?.nickname) {
          setMemberName(allItems[0].nickname);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadData();
  }, [memberId]);

  const toggleFavorite = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const handleFilterIconClick = () => {
    setIsFilterOpen((prev) => !prev);
  };

  const handleChangeFilter = (value) => {
    setFilter(value);
    setIsFilterOpen(false);
  };

  const filteredItems = items.filter((item) => {
    if (filter === "favorite") return item.isFavorite;
    if (filter === "image") return item.type === "image";
    if (filter === "video") return item.type === "video";
    return true;
  });

  const handleOpenDetail = (item) => {
    navigate(`/archive/members/${memberId}/detail`, { state: { item } });
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Header
        bgClassName="bg-bg-app"
        variant="solid"
        title={memberName}
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-6 h-6" />
        }
        onLeftClick={handleBack}
        leftAriaLabel="뒤로가기"
        rightIcon={
          <img src="/icons/filter.svg" alt="필터" className="w-5 h-5" />
        }
        onRightClick={handleFilterIconClick}
        rightAriaLabel="필터 열기"
      />

      <main className="flex-1 bg-gray-10">
        <div className="grid grid-cols-3 border-t border-gray-20">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="relative aspect-square border border-gray-20 bg-gray-10 overflow-hidden"
              onClick={() => handleOpenDetail(item)}
            >
              {/* ✅ 타입에 따라 image / video 분기 */}
              {item.type === "video" ? (
                <video
                  src={item.src}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={item.src}
                  alt={item.dateLabel}
                  className="w-full h-full object-cover"
                />
              )}

              <button
                type="button"
                className="absolute top-1 right-1 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
              >
                <img
                  src={
                    item.isFavorite
                      ? "/icons/heart-filled.svg"
                      : "/icons/heart-outline.svg"
                  }
                  alt="즐겨찾기"
                  className="w-4 h-4"
                />
              </button>
            </button>
          ))}
        </div>
      </main>

      {isFilterOpen && (
        <ArchiveFilterDropdown
          filter={filter}
          onChange={handleChangeFilter}
          onClose={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
}
