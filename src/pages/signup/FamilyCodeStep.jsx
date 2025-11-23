import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import ProgressBar from "@/components/ProgressBar";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

function FamilyCodeStep() {
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
  } = location.state || {};

  const [familyCode, setFamilyCode] = useState("");

  const trimmedCode = familyCode.trim();
  const codeRegex = /^\d{8}$/; // 숫자 8자리
  const isCodeValid = codeRegex.test(trimmedCode);

  const nextVariant = isCodeValid ? "primary" : "notFocus";

  // 실제로는 여기서 서버에 가족코드 조회 API 호출
  const mockFetchFamilyByCode = async (code) => {
    console.log("가족코드 조회:", code);
    // 예시로 더미 데이터 리턴
    return {
      familyName: "우주 최강 가족",
      leader: {
        name: "누군가",
        role: "가족 대표",
        avatarSrc: "/images/user.png",
      },
    };
  };

  const handleSubmitCode = async () => {
    if (!isCodeValid) return;

    const family = await mockFetchFamilyByCode(trimmedCode);

    navigate("/signup/family-confirm", {
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
        familyCode: trimmedCode,
        familyName: family.familyName,
        familyLeader: family.leader,
      },
    });
  };

  const handleFirstFamily = () => {
    navigate("/signup/family-name", {
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
      },
    });
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
          {/* 온보딩 6 / 7 단계라고 가정 */}
          <ProgressBar currentStep={6} totalSteps={7} className="mb-8" />

          <h1 className="text-xl font-semibold text-text-main leading-snug">
            마지막이에요!
            <br />
            가족의 초대를 받고 오셨나요?
          </h1>
          <p className="mt-2 text-sm text-gray-60">
            전달받은 가족코드를 입력해주세요
          </p>
        </section>

        {/* 입력 영역 */}
        <section className="mt-6">
          <TextInput
            name="familyCode"
            type="text"
            placeholder="숫자 8자리로 입력해주세요"
            value={familyCode}
            onChange={(e) => setFamilyCode(e.target.value)}
          />
        </section>

        {/* 하단 버튼 두 개 */}
        <div className="mt-auto space-y-3">
          <Button
            size="large"
            variant={nextVariant}
            type="button"
            onClick={handleSubmitCode}
          >
            입력완료
          </Button>

          <Button
            size="large"
            variant="focus" // 노랑 테두리 + 투명 배경
            type="button"
            onClick={handleFirstFamily}
          >
            가족 중 처음이에요
          </Button>
        </div>
      </main>
    </div>
  );
}

export default FamilyCodeStep;
