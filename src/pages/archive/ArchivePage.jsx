import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import BottomNav from "@/layouts/BottomNav";
import ArchiveSectionCard from "@/components/archive/ArchiveSectionCard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 날짜 포맷 헬퍼
function formatKoreanDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const date = d.getDate();
  return `${year}년 ${month}월 ${date}일`;
}

function ArchivePage() {
  const navigate = useNavigate();

  // ------------------------
  // 프리뷰 섹션 3가지를 위한 상태
  // dailyPreviews: 일상 기록 최신 3건
  // memberPreviews: 멤버별 최신 1개씩 (최대 3명)
  // petPreviews: 반려동물 기록 최신 3건
  // ------------------------
  const [dailyPreviews, setDailyPreviews] = useState([]);
  const [memberPreviews, setMemberPreviews] = useState([]);
  const [petPreviews, setPetPreviews] = useState([]);

  // =============================================
  // useEffect: 페이지 진입 시 보관함 데이터 fetch
  // =============================================
  useEffect(() => {
    // 로컬 스토리지에서 accessToken 가져오기
    const token = localStorage.getItem("accessToken"); // TODO: 프로젝트 키에 맞게 수정
    if (!token) return;

    // 모든 API 요청 공통 헤더
    const commonHeaders = {
      Authorization: `Bearer ${token}`,
      Accept: "*/*",
    };

    // --------------------------------------------------
    // 1) 전체 일상 피드 조회 (/post)
    // - 최신 일상 기록 3개
    // - 멤버별 최신 기록 1개씩 최대 3명
    // --------------------------------------------------
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/post`, {
          method: "GET",
          headers: commonHeaders,
        });

        if (!res.ok) {
          throw new Error("failed to fetch /post");
        }

        const data = await res.json(); // [{ id, familyMemberId, mediaUrl, mediaUrls, ... }]

        // -------------------------------
        // 공통 썸네일 변환 작업
        // 각 포스트마다 thumbnailUrl과 alt 텍스트 만들기
        // -------------------------------
        const mapped = data
          .map((post) => {
            const thumbnail =
              post.mediaUrl ||
              (post.mediaUrls && post.mediaUrls[0]) ||
              "/images/fallback-thumbnail.png";

            return {
              thumbnailUrl: thumbnail,
              alt:
                post.description ||
                `${post.writerNickname || "가족"}의 추억 (${formatKoreanDate(
                  post.createdAt
                )})`,
              familyMemberId: post.familyMemberId,
            };
          })
          .filter((item) => !!item.thumbnailUrl);

        // -------------------------------
        // 일상 프리뷰 – 최신 3개
        // -------------------------------
        setDailyPreviews(mapped.slice(0, 3));

        // ------------------------------------------------------
        // 멤버별 프리뷰 – familyMemberId 기준으로 서로 다른 멤버 3명까지
        // ------------------------------------------------------
        const byMember = [];
        const seen = new Set();
        for (const item of mapped) {
          if (!item.familyMemberId) continue;
          if (seen.has(item.familyMemberId)) continue;
          seen.add(item.familyMemberId);
          byMember.push(item);
          if (byMember.length >= 3) break;
        }
        setMemberPreviews(byMember);
      } catch (e) {
        console.error(e);
      }
    };

    // --------------------------------------------------
    // 2) 반려동물 피드 조회 (/post/pet)
    // - 반려동물 기록 최신 3건
    // --------------------------------------------------
    const fetchPetPosts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/post/pet`, {
          method: "GET",
          headers: commonHeaders,
        });

        if (!res.ok) {
          throw new Error("failed to fetch /post/pet");
        }

        const data = await res.json();

        const mapped = data
          .map((post) => {
            const thumbnail =
              post.mediaUrl ||
              (post.mediaUrls && post.mediaUrls[0]) ||
              "/images/fallback-thumbnail.png";

            return {
              thumbnailUrl: thumbnail,
              alt:
                post.description ||
                `반려동물 추억 (${formatKoreanDate(post.createdAt)})`,
            };
          })
          .filter((item) => !!item.thumbnailUrl);

        setPetPreviews(mapped.slice(0, 3));
      } catch (e) {
        console.error(e);
      }
    };

    // 실제 API 호출 실행
    fetchPosts();
    fetchPetPosts();
  }, []);

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <Header variant="plain" title="보관함" />

      <main className="flex-1 bg-yellow-20 px-6 pt-4 pb-10 overflow-y-auto">
        <ArchiveSectionCard
          title="일상 기록 보관함"
          previewItems={dailyPreviews}
          onClick={() => navigate("/archive/daily")}
        />

        <ArchiveSectionCard
          title="멤버별 추억 보관함"
          previewItems={memberPreviews}
          onClick={() => navigate("/archive/members")}
        />

        <ArchiveSectionCard
          title="반려동물과의 추억 보관함"
          previewItems={petPreviews}
          onClick={() => navigate("/archive/pets")}
        />
      </main>

      <BottomNav />
    </div>
  );
}

export default ArchivePage;
