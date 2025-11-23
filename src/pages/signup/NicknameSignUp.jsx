import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import ProgressBar from "@/components/ProgressBar";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

function NicknameSignUp() {
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 단계(이메일/비밀번호)에서 넘겨준 값들
  const { email, password, agreedTerms } = location.state || {};

  const [nickname, setNickname] = useState("");

  const trimmedNickname = nickname.trim();
  const isLengthValid = trimmedNickname.length <= 10;

  const nicknameError =
    trimmedNickname && !isLengthValid ? "별명은 10자 이내로 입력해주세요." : "";

  const canNext = !!trimmedNickname && isLengthValid;
  const nextVariant = canNext ? "primary" : "notFocus";

  const handleNext = () => {
    if (!canNext) return;

    // 다음 단계(프로필 이미지)로 이메일/비밀번호/약관동의 + 별명 전달
    navigate("/signup/profile", {
      state: {
        email,
        password,
        agreedTerms,
        nickname: trimmedNickname,
      },
    });
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      {/* 헤더 (타이틀 없이, 뒤로가기만) */}
      <Header
        bgClassName="bg-bg-app"
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-8 h-8" />
        }
        onLeftClick={() => navigate(-1)}
        leftAriaLabel="뒤로가기"
      />

      {/* 본문 */}
      <main className="flex-1 px-6 pt-4 pb-8 flex flex-col">
        <section>
          {/* 프로그레스 바: 2 / 7 단계라고 가정 */}
          <ProgressBar currentStep={2} totalSteps={7} className="mb-6" />

          <h1 className="text-xl font-semibold text-text-main mb-6">
            별명을 선택해주세요
          </h1>

          <TextInput
            name="nickname"
            placeholder="별명 입력"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            supportingText="최대 10자까지 가능해요."
            errorMessage={nicknameError}
          />
        </section>

        {/* 하단 버튼 */}
        <div className="mt-auto">
          <Button
            size="large"
            variant={nextVariant}
            type="button"
            onClick={handleNext}
          >
            다음
          </Button>
        </div>
      </main>
    </div>
  );
}

export default NicknameSignUp;
