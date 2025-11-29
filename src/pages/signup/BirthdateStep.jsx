import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";
import ProgressBar from "@/components/ProgressBar";

function BirthdateStep() {
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 단계에서 넘어온 값들 (필요하면 더 추가해서 이어 쓰면 됨)
  const {
    email,
    password,
    kakaoId,
    agreedTerms,
    nickname,
    profileImageUrl,
    inviteCode,
  } = location.state || {};

  const [birthdate, setBirthdate] = useState("");
  const [calendarType, setCalendarType] = useState("solar"); // 양력: solar, 음력: lunar

  const trimmedBirthdate = birthdate.trim();

  // 숫자 8자리인지 간단 검사 (예: 20001010)
  const birthdateRegex = /^\d{8}$/;
  const isBirthValid =
    trimmedBirthdate.length === 0 || birthdateRegex.test(trimmedBirthdate);

  const birthError =
    trimmedBirthdate && !isBirthValid
      ? "숫자 8자리의 생년월일을 입력해주세요."
      : "";

  const canNext = birthdateRegex.test(trimmedBirthdate);
  const nextVariant = canNext ? "primary" : "notFocus";

  const handleNext = () => {
    if (!canNext) return;

    navigate("/signup/phone", {
      state: {
        email,
        password,
        kakaoId,
        agreedTerms,
        nickname,
        profileImageUrl,
        birthdate: trimmedBirthdate,
        calendarType,
        inviteCode,
      },
    });
  };

  const handleClickCalendar = (type) => {
    setCalendarType(type);
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      {/* 헤더 */}
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
        {/* 진행 바 + 타이틀 */}
        <section>
          <ProgressBar
            currentStep={4} // 전체 온보딩 단계 수에 맞춰서 숫자만 조정하면 됨
            totalSteps={7}
            className="mb-8"
          />

          <h1 className="text-xl font-semibold text-text-main leading-snug">
            생년월일을 입력해주세요
          </h1>
          <p className="mt-2 text-sm text-gray-60">
            주차별 질문에 활용될 수 있어요
          </p>
        </section>

        {/* 입력 영역 */}
        <section className="mt-6 space-y-4">
          <TextInput
            name="birthdate"
            type="text"
            placeholder="ex) 20001010"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            supportingText="숫자 8자리로 입력해주세요."
            errorMessage={birthError}
          />

          {/* 양력 / 음력 선택 버튼 */}
          <div className="mt-5 flex gap-3">
            <Button
              size="medium"
              variant={calendarType === "solar" ? "primary" : "notFocus"}
              type="button"
              onClick={() => handleClickCalendar("solar")}
              className="flex-1"
            >
              양력
            </Button>
            <Button
              size="medium"
              variant={calendarType === "lunar" ? "primary" : "notFocus"}
              type="button"
              onClick={() => handleClickCalendar("lunar")}
              className="flex-1"
            >
              음력
            </Button>
          </div>
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

export default BirthdateStep;
