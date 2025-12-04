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

    // /archive/main 하나만 호출해서
    // daily / member / pet 세 섹션 데이터를 한 번에 가져오기
    const fetchArchiveMain = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/archive/main`, {
          method: "GET",
          headers: commonHeaders,
        });

        if (!res.ok) {
          throw new Error("failed to fetch /archive/main");
        }

        // data: { daily: [...], member: [...], pet: [...] }
        const data = await res.json();

        // ======================
        // 1) 일상 기록 보관함 프리뷰
        // ======================
        // 최대 3개까지만 사용
        const daily = (data.daily || []).slice(0, 3).map((item) => ({
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
        // 2) 멤버별 추억 보관함 프리뷰
        // ======================
        // 요구사항: “멤버를 최대 3명까지 보여주되,
        // 고유 멤버 수가 3명보다 적으면 그 수만큼만 보여주기”
        // → /archive/main 의 member 배열에서 닉네임 기준으로 중복 제거
        const memberRaw = Array.isArray(data.member) ? data.member : [];

        // 닉네임 기준으로 고유 멤버만 추출
        const seenNicknames = new Set();
        const uniqueMembers = [];

        for (const item of memberRaw) {
          const nickname = item.nickname || "";
          if (seenNicknames.has(nickname)) continue;

          seenNicknames.add(nickname);
          uniqueMembers.push(item);

          // 고유 멤버가 3명이 되면 더 이상 추가하지 않음
          if (uniqueMembers.length >= 3) break;
        }

        const member = uniqueMembers.map((item) => ({
          // 멤버 프로필 카드 느낌을 위해 profileImageUrl을 우선 사용
          thumbnailUrl:
            item.profileImageUrl ||
            item.thumbnailUrl ||
            "/images/fallback-profile.png",
          alt: item.nickname || "가족 구성원",
          nickname: item.nickname,
        }));

        setMemberPreviews(member);

        // ======================
        // 3) 반려동물과의 추억 보관함 프리뷰
        // ======================
        const pet = (data.pet || []).slice(0, 3).map((item) => ({
          thumbnailUrl:
            item.thumbnailUrl || item.url || "/images/fallback-thumbnail.png",
          alt:
            (item.nickname &&
              `${item.nickname}와(과) 함께한 추억 (${formatKoreanDate(
                item.createdAt
              )})`) ||
            `반려동물과의 추억 (${formatKoreanDate(item.createdAt)})`,
        }));
        setPetPreviews(pet);
      } catch (e) {
        console.error(e);
      }
    };

    fetchArchiveMain();
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
