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
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    // 모든 API 요청 공통 헤더
    const commonHeaders = {
      Authorization: `Bearer ${token}`,
      Accept: "*/*",
    };

    const fetchArchiveAndFamily = async () => {
      try {
        // 🔹 /archive/main + /mypage/family-profile + /post/pet/archive 동시에 호출
        const [archiveRes, familyRes, petArchiveRes] = await Promise.all([
          fetch(`${API_BASE_URL}/archive/main`, {
            method: "GET",
            headers: commonHeaders,
          }),
          fetch(`${API_BASE_URL}/mypage/family-profile`, {
            method: "GET",
            headers: commonHeaders,
          }),
          fetch(`${API_BASE_URL}/post/pet/archive`, {
            method: "GET",
            headers: commonHeaders,
          }),
        ]);

        if (!archiveRes.ok) {
          throw new Error("failed to fetch /archive/main");
        }
        if (!familyRes.ok) {
          throw new Error("failed to fetch /mypage/family-profile");
        }
        if (!petArchiveRes.ok) {
          throw new Error("failed to fetch /post/pet/archive");
        }

        const archive = await archiveRes.json(); // { daily, member, pet }
        const family = await familyRes.json(); // { leader, members, ... }
        const petArchive = await petArchiveRes.json(); // 일상+영상 통합 반려동물 기록 배열

        // ======================
        // 1) 일상 기록 보관함 프리뷰
        // ======================
        // 최대 3개까지만 사용
        const daily = (archive.daily || []).slice(0, 3).map((item) => ({
          // 썸네일이 있으면 그걸 사용, 없으면 fallback
          thumbnailUrl:
            item.thumbnailUrl || item.url || "/images/fallback-thumbnail.png",
          // alt: 닉네임 + 날짜 조합, 없으면 기본 문구
          alt:
            (item.nickname &&
              `${item.nickname}의 추억 (${formatKoreanDate(
                item.createdAt
              )})`) ||
            `가족의 추억 (${formatKoreanDate(item.createdAt)})`,
        }));
        setDailyPreviews(daily);

        // ======================
        // 3) 멤버별 프리뷰
        // ======================
        // 3-1. /archive/main.member 에서
        //      닉네임별 "가장 최신" 기록 하나씩만 뽑아두기
        const archiveMembers = Array.isArray(archive.member)
          ? archive.member
          : [];

        const latestByNickname = {};
        archiveMembers.forEach((item) => {
          const nickname = item.nickname || "";
          if (!nickname) return;

          const existing = latestByNickname[nickname];
          if (
            !existing ||
            new Date(item.createdAt) > new Date(existing.createdAt)
          ) {
            latestByNickname[nickname] = item;
          }
        });

        // 3-2. /mypage/family-profile 기준으로
        //      리더 + 멤버를 "가입 순서"대로 배열 만들기
        const orderedMembers = [];
        if (family.leader) {
          orderedMembers.push(family.leader);
        }
        if (Array.isArray(family.members)) {
          orderedMembers.push(...family.members);
        }

        // 가입일 순이라고 가정하고 앞에서부터 최대 3명만 사용
        const top3 = orderedMembers.slice(0, 3);

        const memberPreviews = top3.map((m) => {
          const nick = m.nickname || "";
          const preview = latestByNickname[nick]; // 이 멤버의 최신 기록(있을 수도, 없을 수도)

          // 썸네일은 항상 "멤버 프로필" 기준
          const thumbnailUrl = m.profileImage || "/images/fallback-profile.png";

          // alt 텍스트는 최신 기록이 있으면 그 정보로, 없으면 기본 문구
          const alt = preview
            ? `${nick}의 추억 (${formatKoreanDate(preview.createdAt)})`
            : `${nick}의 추억을 아직 남기지 않았어요.`;

          return {
            thumbnailUrl,
            alt,
            nickname: nick,
            // type은 혹시 나중에 쓸 일 있을까 봐 남겨두되, 기본은 image
            type: "image",
          };
        });

        setMemberPreviews(memberPreviews);

        // ======================
        // 3) 반려동물과의 추억 보관함 프리뷰
        // /post/pet/archive(일상+영상 통합) 기준으로 최신 3개
        // ======================
        // /post/pet/archive 응답이 { images: [...], shorts: [...] } 형태
        const imageItems = Array.isArray(petArchive.images)
          ? petArchive.images
          : [];
        const shortItems = Array.isArray(petArchive.shorts)
          ? petArchive.shorts
          : [];

        // 일단 둘 다 합쳐서 최신 기준으로 정렬
        const merged = [...imageItems, ...shortItems].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // 상위 3개만 프리뷰
        const pet = merged.slice(0, 3).map((item) => {
          const thumbnailUrl =
            item.mediaUrl ||
            item.thumbnailUrl ||
            "/images/fallback-thumbnail.png";

          const alt = `반려동물과의 추억 (${formatKoreanDate(item.createdAt)})`;

          return { thumbnailUrl, alt };
        });

        setPetPreviews(pet);
      } catch (e) {
        console.error(e);
      }
    };

    fetchArchiveAndFamily();
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
