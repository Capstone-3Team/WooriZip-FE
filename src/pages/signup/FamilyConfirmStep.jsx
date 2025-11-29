import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import ProgressBar from "@/components/ProgressBar";
import Button from "@/components/buttons/Button";
import FamilyProfile from "@/components/FamilyProfile";

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
    familyName = "우리 가족",
    familyLeader, // { id, nickname, profile }
  } = location.state || {};

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
        showShareButton: false, // 기존 가족에 합류 → 공유 버튼 없음 (왼쪽 화면)
      },
    });
  };

  // 대표 정보 기본값
  // familyLeader: { id, nickname, profile }
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
          >
            확인
          </Button>
        </div>
      </main>
    </div>
  );
}

export default FamilyConfirmStep;
