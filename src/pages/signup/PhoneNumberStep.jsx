import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";
import ProgressBar from "@/components/ProgressBar";

function PhoneNumberStep() {
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
    calendarType: initialCalendarType = "solar",
  } = location.state || {};

  const [phone, setPhone] = useState("");

  const trimmedPhone = phone.trim();

  // 아주 단순한 휴대폰 번호 검사: 숫자만, 10~11자리
  const phoneRegex = /^\d{10,11}$/;
  const isPhoneValid =
    trimmedPhone.length === 0 || phoneRegex.test(trimmedPhone);

  const phoneError =
    trimmedPhone && !isPhoneValid
      ? "휴대폰 번호를 숫자만 10~11자리로 입력해주세요."
      : "";

  const canNext = phoneRegex.test(trimmedPhone) && !!birthdate;
  const nextVariant = canNext ? "primary" : "notFocus";

  // ✅ 이 단계에 값이 제대로 넘어왔는지 확인용
  //    연동 다 끝나면 이 useEffect 통째로 삭제해도 됨
  useEffect(() => {
    console.log("PhoneNumberStep 받은 값:", {
      email,
      password,
      kakaoId,
      agreedTerms,
      nickname,
      profileImageUrl,
      birthdate,
      calendarType: initialCalendarType,
    });
  }, [
    email,
    password,
    kakaoId,
    agreedTerms,
    nickname,
    profileImageUrl,
    birthdate,
    initialCalendarType,
  ]);

  const handleNext = () => {
    if (!canNext) return;

    navigate("/signup/family-code", {
      state: {
        email,
        password,
        kakaoId,
        agreedTerms,
        nickname,
        profileImageUrl,
        birthdate,
        calendarType: initialCalendarType, // 수정 불가, 그대로 전달
        phone: trimmedPhone,
      },
    });
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
          <ProgressBar currentStep={5} totalSteps={7} className="mb-8" />

          <h1 className="text-xl font-semibold text-text-main leading-snug">
            휴대폰번호를 입력해주세요
          </h1>
        </section>

        {/* 휴대폰 번호 입력 */}
        <section className="mt-6 space-y-10">
          <div className="space-y-3">
            <TextInput
              name="phone"
              type="tel"
              placeholder="ex) 01012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              supportingText="숫자만 입력해주세요."
              errorMessage={phoneError}
            />
          </div>

          {/* 생년월일 + 양력/음력 다시 보여주기 */}
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-text-main mb-6">
              생년월일
            </h1>

            <div className="flex items-center gap-2">
              {/* 생년월일 입력 값은 읽기 전용으로 노란 박스에 표시 */}
              <div className="flex-1">
                <TextInput
                  name="birthdateReadonly"
                  type="text"
                  value={birthdate || ""}
                  readOnly
                />
              </div>

              {/* 선택 상태는 유지, 클릭해도 아무 변화 없음 */}
              <Button
                size="small"
                variant={
                  initialCalendarType === "solar" ? "primary" : "notFocus"
                }
                type="button"
                aria-disabled="true"
                className="cursor-default"
              >
                양력
              </Button>
              <Button
                size="small"
                variant={
                  initialCalendarType === "lunar" ? "primary" : "notFocus"
                }
                type="button"
                aria-disabled="true"
                className="cursor-default"
              >
                음력
              </Button>
            </div>
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

export default PhoneNumberStep;
