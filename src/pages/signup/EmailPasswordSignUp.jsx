import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import ProgressBar from "@/components/ProgressBar";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

function EmailPasswordSignUp() {
  const navigate = useNavigate();
  const location = useLocation();

  // 약관 동의 페이지에서 넘어온 값
  const { agreedTerms } = location.state || {};

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailChecked, setEmailChecked] = useState(false); // ✅ 중복확인 완료 여부
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  const trimmedConfirm = confirm.trim();

  // 비밀번호 형식: ResetPassword에서 썼던 규칙 그대로
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};:'",.<>/?`~\\|]).{8,12}$/;

  const isPasswordValid =
    trimmedPassword.length === 0 || passwordRegex.test(trimmedPassword);

  const passwordError =
    trimmedPassword && !isPasswordValid
      ? "비밀번호는 8~12자의 영문, 숫자, 특수기호를 모두 포함해야 합니다."
      : "";

  const isConfirmMatch =
    trimmedConfirm.length === 0 ||
    (trimmedPassword && trimmedPassword === trimmedConfirm);

  const confirmError =
    trimmedConfirm && !isConfirmMatch ? "비밀번호가 일치하지 않습니다." : "";

  const showConfirmSuccessText =
    trimmedPassword &&
    trimmedConfirm &&
    isPasswordValid &&
    trimmedPassword === trimmedConfirm &&
    !confirmError;

  // 다음 버튼 활성 조건: 이메일 + 중복확인 완료 + 비번 2개 OK
  const canNext =
    trimmedEmail &&
    emailChecked &&
    !emailError &&
    trimmedPassword &&
    trimmedConfirm &&
    isPasswordValid &&
    trimmedPassword === trimmedConfirm;

  const nextButtonVariant = canNext ? "primary" : "notFocus";

  // --- 이메일 중복 확인 mock (나중에 실제 API로 교체) ---
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const mockCheckEmail = async (value) => {
    // TODO: 서버 API로 교체
    // 예시: "@dup.com" 으로 끝나는 메일은 이미 가입된 것으로 처리
    await sleep(500);
    const isDuplicate = value.endsWith("@dup.com");
    return { isDuplicate };
  };

  const handleCheckEmail = async () => {
    if (!trimmedEmail) {
      setEmailError("이메일을 입력해주세요.");
      setEmailChecked(false);
      return;
    }

    setIsCheckingEmail(true);
    setEmailError("");
    setEmailChecked(false);

    try {
      const result = await mockCheckEmail(trimmedEmail);

      if (result.isDuplicate) {
        setEmailError("이미 가입된 이메일입니다.");
        setEmailChecked(false);
      } else {
        setEmailError("");
        setEmailChecked(true); // 중복확인 완료
      }
    } catch (e) {
      console.error(e);
      setEmailError("이메일 확인 중 오류가 발생했습니다.");
      setEmailChecked(false);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleNext = () => {
    if (!canNext) return;

    // TODO: 실제 회원가입 흐름에 맞게 별명 입력 페이지 경로 조정
    navigate("/signup/nickname", {
      state: {
        email: trimmedEmail,
        password: trimmedPassword,
        agreedTerms,
      },
    });
  };

  // 중복확인 버튼 스타일 / 텍스트
  const emailButtonVariant = emailChecked
    ? "focus" // 중복확인 완료 상태
    : trimmedEmail
    ? "primary" // 공백 제외하고 뭔가 입력되어 있으면 노랑(primary)
    : "notFocus"; // 아무것도 없으면 회색(notFocus)
  const emailButtonLabel = emailChecked ? "중복확인 완료" : "중복확인";

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
        {/* 상단 프로그레스 바 + 타이틀 */}
        <section>
          <ProgressBar currentStep={1} totalSteps={7} className="mb-8" />

          <h1 className="text-xl font-semibold text-text-main leading-snug">
            이메일을 입력해주세요
          </h1>
        </section>

        {/* 이메일 + 중복확인 */}
        <section className="mt-6">
          <div className="space-y-3">
            <TextInput
              name="email"
              type="email"
              placeholder="이메일을 입력해주세요"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
                setEmailChecked(false); // 이메일 수정하면 다시 중복확인 필요
              }}
              errorMessage={emailError}
            />

            <Button
              size="large"
              variant={emailButtonVariant}
              type="button"
              onClick={handleCheckEmail}
              disabled={isCheckingEmail}
            >
              {isCheckingEmail ? "확인 중..." : emailButtonLabel}
            </Button>
          </div>
        </section>

        {/* 비밀번호 입력 영역 */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text-main mb-6">
            비밀번호를 입력해주세요
          </h2>

          <div className="space-y-3">
            {/* 비밀번호 */}
            <TextInput
              name="password"
              type="password"
              placeholder="새로운 비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              supportingText="비밀번호는 8~12자로 영문 대 소문자, 숫자, 특수기호를 조합해서 사용해주세요."
              errorMessage={passwordError}
              showPasswordToggle
            />

            {/* 비밀번호 확인 */}
            <TextInput
              name="passwordConfirm"
              type="password"
              placeholder="비밀번호 입력 확인"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              supportingText={
                showConfirmSuccessText ? "비밀번호가 일치합니다" : undefined
              }
              errorMessage={confirmError}
              showPasswordToggle
            />
          </div>
        </section>

        {/* 하단 다음 버튼 */}
        <div className="mt-auto">
          <Button
            size="large"
            variant={nextButtonVariant}
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

export default EmailPasswordSignUp;
