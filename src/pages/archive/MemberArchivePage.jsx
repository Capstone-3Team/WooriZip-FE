import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import BottomNav from "@/layouts/BottomNav";
import ArchiveSectionCard from "@/components/archive/ArchiveSectionCard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DAILY_POSTS_URL = `${API_BASE_URL}/post`;
const VIDEO_ANSWER_URL = `${API_BASE_URL}/video-answer`;
const QUESTION_LIST_URL = `${API_BASE_URL}/question/list`;

function extractImageUrl(value) {
  if (!value) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:") ||
      trimmed.startsWith("/")
    ) {
      return trimmed;
    }

    const looksLikeBase64 =
      /^[0-9A-Za-z+/=]+$/.test(trimmed) && trimmed.length > 100;

    if (looksLikeBase64) {
      return `data:image/jpeg;base64,${trimmed}`;
    }

    return trimmed;
  }

  if (typeof value === "object") {
    const cand =
      value.url ||
      value.imageUrl ||
      value.fileUrl ||
      value.path ||
      value.location ||
      null;
    return typeof cand === "string" ? extractImageUrl(cand) : null;
  }

  return null;
}

function detectMediaType(url) {
  if (!url) return "image";
  const lowered = url.toLowerCase();

  if (lowered.startsWith("data:video") || lowered.startsWith("blob:video")) {
    return "video";
  }

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

function buildPostMediaItems(post) {
  const urls = [];

  const main = extractImageUrl(post.mediaUrl);
  if (main) urls.push(main);

  if (Array.isArray(post.mediaUrls)) {
    post.mediaUrls.forEach((u) => {
      const url = extractImageUrl(u);
      if (url && !urls.includes(url)) {
        urls.push(url);
      }
    });
  }

  return urls.map((url, index) => {
    const mediaType = detectMediaType(url);

    return {
      id: `POST_${post.id}_${index}`,
      postId: post.id,
      familyMemberId: post.familyMemberId,
      familyId: post.familyId,
      nickname: post.writerNickname,
      profileImageUrl: extractImageUrl(post.writerProfile),
      createdAt: post.createdAt,
      mediaUrl: url,
      thumbnailUrl: url,
      mediaType,
      source: "DAILY_POST",
    };
  });
}

function formatKoreanDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const date = d.getDate();
  return `${year}년 ${month}월 ${date}일`;
}

function mapVideoAnswerToArchiveItem(answer) {
  const videoUrl = extractImageUrl(answer.videoUrl);
  const thumbUrl = extractImageUrl(answer.thumbnailUrl) || videoUrl;

  if (!videoUrl && !thumbUrl) return null;

  return {
    id: `VIDEO_${answer.id}`,
    familyMemberId: answer.familyMemberId,
    familyId: answer.familyId,
    nickname: answer.nickname,
    profileImageUrl: extractImageUrl(answer.profileImageUrl),
    createdAt: answer.createdAt,
    mediaUrl: videoUrl || thumbUrl,
    thumbnailUrl: thumbUrl || videoUrl,
    mediaType: "video",
    source: "VIDEO_ANSWER",
    owner: answer.owner,
    questionId: answer.questionId,
  };
}

async function fetchAllVideoAnswers(headers) {
  try {
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

export default function MemberArchivePage() {
  const navigate = useNavigate();
  const [memberSections, setMemberSections] = useState([]);

  const handleBack = () => navigate(-1);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

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
          .flatMap(buildPostMediaItems)
          .filter(Boolean);

        const videoItems = (Array.isArray(videoAnswers) ? videoAnswers : [])
          .map(mapVideoAnswerToArchiveItem)
          .filter(Boolean);

        const allMemberItems = [...dailyItems, ...videoItems].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const memberMap = new Map();

        allMemberItems.forEach((item) => {
          if (!item.familyMemberId) return;
          const key = item.familyMemberId;

          if (!memberMap.has(key)) {
            memberMap.set(key, {
              id: key,
              name: item.nickname || "가족",
              profileImageUrl: extractImageUrl(item.profileImageUrl) || "",
              previews: [],
            });
          }

          const section = memberMap.get(key);
          if (section.previews.length < 3) {
            const thumb = extractImageUrl(item.thumbnailUrl || item.mediaUrl);

            if (thumb) {
              section.previews.push({
                thumbnailUrl: thumb, // ✅ URL / data URL 보장
                type: item.mediaType, // ✅ "image" | "video"
                alt: `${section.name}의 추억 (${formatKoreanDate(
                  item.createdAt
                )})`,
              });
            }
          }
        });

        setMemberSections(Array.from(memberMap.values()));
      } catch (error) {
        console.error(error);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Header
        bgClassName="bg-bg-app"
        variant="solid"
        title="멤버별 추억 보관함"
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-6 h-6" />
        }
        onLeftClick={handleBack}
        leftAriaLabel="뒤로가기"
      />

      <main className="flex-1 bg-yellow-20 px-6 pt-4 pb-10 overflow-y-auto">
        {memberSections.map((member) => (
          <ArchiveSectionCard
            key={member.id}
            title={member.name}
            previewItems={member.previews}
            onClick={() => navigate(`/archive/members/${member.id}`)}
          />
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
