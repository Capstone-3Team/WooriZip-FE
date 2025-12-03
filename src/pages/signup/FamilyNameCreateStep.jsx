import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import ProgressBar from "@/components/ProgressBar";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

function FamilyNameCreateStep() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    email,
    password,
    kakaoId,
    agreedTerms,
    nickname,
    profileImageUrl,
    profileImageFile,
    birthdate,
    calendarType,
    phone,
  } = location.state || {};

  const [familyName, setFamilyName] = useState("");

  const trimmedName = familyName.trim();
  const isLengthValid = trimmedName.length <= 10;

  const nameError =
    trimmedName && !isLengthValid
      ? "가족 별명은 10자 이내로 입력해주세요."
      : "";

  const canConfirm = !!trimmedName && isLengthValid;
  const confirmVariant = canConfirm ? "primary" : "notFocus";

  const handleConfirm = () => {
    if (!canConfirm) return;

    navigate("/welcome", {
      state: {
        email,
        password,
        kakaoId,
        agreedTerms,
        nickname,
        profileImageUrl,
        profileImageFile,
        birthdate,
        calendarType,
        phone,
        familyName: trimmedName,
        familyCode: null, // ★ 아직 모르는 값. 나중에 register 응답으로 채움
        isNewFamily: true, // 가족 생성 플로우인지 표시
        showShareButton: true,
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
          <ProgressBar currentStep={7} totalSteps={7} className="mb-8" />

          <h1 className="text-xl font-semibold text-text-main leading-snug">
            가족 별명 생성
          </h1>
          <p className="mt-2 text-sm text-gray-60">
            우리 가족을 표현할 수 있는 별명을 만들어주세요.
            <br />
            설정에서 자유롭게 변경 가능해요.
          </p>
        </section>

        {/* 입력 영역 */}
        <section className="mt-8">
          <TextInput
            name="familyName"
            placeholder="가족 별명 입력"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            supportingText="최대 10자까지 가능해요."
            errorMessage={nameError}
          />
        </section>

        {/* 하단 버튼 */}
        <div className="mt-auto">
          <Button
            size="large"
            variant={confirmVariant}
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

export default FamilyNameCreateStep;
