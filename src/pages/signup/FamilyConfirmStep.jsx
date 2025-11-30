import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import ProgressBar from "@/components/ProgressBar";
import Button from "@/components/buttons/Button";
import FamilyProfile from "@/components/FamilyProfile";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FamilyConfirmStep() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    email,
    password,
    kakaoId,
    agreedTerms,
    nickname,
    profileImageUrl,
    birthdate,
    calendarType,
    phone,
    familyCode,
  } = location.state || {};

  // 가족 정보 상태
  const [familyName, setFamilyName] = useState(
    location.state?.familyName || "우리 가족"
  );
  const [familyLeader, setFamilyLeader] = useState(
    location.state?.familyLeader // { id, nickname, profile }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 가족코드로 가족 정보 조회
  useEffect(() => {
    if (!familyCode) return;

    const fetchFamilyInfo = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const res = await fetch(
          `${API_BASE_URL}/member/family-info?inviteCode=${encodeURIComponent(
            familyCode
          )}`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("가족 정보를 불러오지 못했습니다.");
        }

        const data = await res.json();
        // Swagger 예시 구조:
        // { familyName, leaderId, leaderNickname, leaderProfile }
        setFamilyName(data.familyName || "우리 가족");
        setFamilyLeader({
          id: data.leaderId,
          nickname: data.leaderNickname,
          profile: data.leaderProfile,
        });
      } catch (error) {
        console.error(error);
        setErrorMessage(
          "가족 정보를 불러오지 못했어요. 가족코드를 다시 확인해주세요."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFamilyInfo();
  }, [familyCode]);

  const handleConfirm = () => {
    navigate("/welcome", {
      state: {
        email,
        password,
        kakaoId,
        agreedTerms,
        nickname,
        profileImageUrl,
        birthdate,
        calendarType,
        phone,
        familyCode,
        familyName,
        familyLeader,
        // 기존 가족에 합류 → 공유 버튼 없음 (왼쪽 화면)
        showShareButton: false,
      },
    });
  };

  // 대표 정보 기본값
  const leaderProfile = familyLeader
    ? {
        name: familyLeader.nickname || "가족 대표",
        imageSrc: familyLeader.profile || "/images/user.png",
      }
    : {
        name: "가족 대표",
        imageSrc: "/images/user.png",
      };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Header
        bgClassName="bg-bg-app"
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-8 h-8" />
        }
        onLeftClick={() => navigate(-1)}
        leftAriaLabel="뒤로가기"
      />

      <main className="flex-1 px-6 pt-4 pb-8 flex flex-col">
        {/* 진행 바 + 타이틀 */}
        <section>
          <ProgressBar currentStep={7} totalSteps={7} className="mb-8" />

          <h1 className="text-xl font-semibold text-text-main leading-snug">
            우리 가족 별명 확인
          </h1>
          <p className="mt-2 text-sm text-gray-60">
            가족 대표가 미리 설정한 가족 별명입니다.
            <br />
            가족 별명은 설정에서 수정할 수 있어요.
          </p>

          {isLoading && (
            <p className="mt-2 text-xs text-gray-40">
              가족 정보를 불러오는 중이에요…
            </p>
          )}
          {errorMessage && (
            <p className="mt-2 text-xs text-red-500">{errorMessage}</p>
          )}
        </section>

        {/* 가족 별명 박스 */}
        <section className="mt-6">
          <div className="w-full h-12 rounded-xl bg-yellow-40 flex items-center justify-center">
            <span className="text-sm font-semibold text-text-main">
              {familyName}
            </span>
          </div>
        </section>

        {/* 가족 대표 확인 영역 */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text-main">
            가족 대표 확인
          </h2>
          <p className="mt-2 text-sm text-gray-60">
            우리 가족 대표가 맞는지 확인해보세요
          </p>

          <div className="mt-6 flex justify-start">
            <FamilyProfile
              variant="vertical"
              name={leaderProfile.name}
              imageSrc={leaderProfile.imageSrc}
            />
          </div>
        </section>

        {/* 하단 버튼 */}
        <div className="mt-auto">
          <Button
            size="large"
            variant="primary"
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || !!errorMessage}
          >
            확인
          </Button>
        </div>
      </main>
    </div>
  );
}

export default FamilyConfirmStep;
