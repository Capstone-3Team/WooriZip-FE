import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import ProgressBar from "@/components/ProgressBar";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function EmailPasswordSignUp() {
  const navigate = useNavigate();
  const location = useLocation();

  const { agreedTerms, kakaoId } = location.state || {};

  // 이메일 관련
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailChecked, setEmailChecked] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // 비밀번호 관련
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const trimmedEmail = email.trim();

  // 비밀번호 규칙: 8~12자 + 영문 + 숫자 + 특수문자
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};:'",.<>/?`~\\|]).{8,12}$/;

  const isPasswordValid = passwordRegex.test(password);
  const isConfirmMatch = password.length > 0 && password === confirm;

  const showConfirmSuccessText =
    password.length > 0 &&
    confirm.length > 0 &&
    isPasswordValid &&
    isConfirmMatch &&
    !passwordError &&
    !confirmError;

  // 다음 버튼 활성 조건
  const canNext =
    trimmedEmail &&
    emailChecked &&
    !emailError &&
    isPasswordValid &&
    isConfirmMatch &&
    !passwordError &&
    !confirmError;

  const nextButtonVariant = canNext ? "primary" : "notFocus";

  // --- API: 이메일 중복 확인 (true = 사용 가능) ---
  const checkEmailDuplicate = async (emailToCheck) => {
    const res = await fetch(
      `${API_BASE_URL}/member/check-email?email=${encodeURIComponent(
        emailToCheck
      )}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      throw new Error(`이메일 확인 실패 (status: ${res.status})`);
    }

    const isUsable = await res.json(); // true = 사용 가능

    return { isUsable };
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
      const { isUsable } = await checkEmailDuplicate(trimmedEmail);

      if (!isUsable) {
        setEmailError("이미 가입된 이메일입니다.");
        setEmailChecked(false);
      } else {
        setEmailError("");
        setEmailChecked(true);
      }
    } catch (e) {
      console.error(e);
      setEmailError("이메일 확인 중 오류가 발생했습니다.");
      setEmailChecked(false);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // --- 비밀번호 실시간 검증 ---

  const handlePasswordChange = (value) => {
    setPassword(value);

    // 규칙 검사
    if (!value) {
      setPasswordError("");
    } else if (!passwordRegex.test(value)) {
      setPasswordError(
        "비밀번호는 8~12자의 영문, 숫자, 특수기호를 모두 포함해야 합니다."
      );
    } else {
      setPasswordError("");
    }

    // 확인칸과 일치 여부도 같이 업데이트
    if (confirm.length > 0) {
      if (value !== confirm) {
        setConfirmError("비밀번호가 일치하지 않습니다.");
      } else {
        setConfirmError("");
      }
    }
  };

  const handleConfirmChange = (value) => {
    setConfirm(value);

    if (!value) {
      setConfirmError("");
      return;
    }

    if (value !== password) {
      setConfirmError("비밀번호가 일치하지 않습니다.");
    } else {
      setConfirmError("");
    }
  };

  // --- 다음 버튼 클릭 시: 비어 있는 값만 최종 체크 ---
  const handleNext = () => {
    let valid = true;

    if (!trimmedEmail) {
      setEmailError("이메일을 입력해주세요.");
      valid = false;
    } else if (!emailChecked) {
      setEmailError("이메일 중복확인을 해주세요.");
      valid = false;
    }

    if (!password) {
      setPasswordError("비밀번호를 입력해주세요.");
      valid = false;
    }

    if (!confirm) {
      setConfirmError("비밀번호 확인을 입력해주세요.");
      valid = false;
    }

    // 이미 실시간 검증으로 passwordError / confirmError는 채워져 있으니까
    if (passwordError || confirmError || !isPasswordValid || !isConfirmMatch) {
      valid = false;
    }

    if (!valid) return;

    navigate("/signup/nickname", {
      state: {
        email: trimmedEmail,
        password,
        kakaoId,
        agreedTerms,
      },
    });
  };

  // 중복확인 버튼 상태
  const emailButtonVariant = emailChecked
    ? "focus"
    : trimmedEmail
    ? "primary"
    : "notFocus";
  const emailButtonLabel = emailChecked ? "중복확인 완료" : "중복확인";

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
                setEmailChecked(false);
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

        {/* 비밀번호 */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text-main mb-6">
            비밀번호를 입력해주세요
          </h2>

          <div className="space-y-3">
            <TextInput
              name="password"
              type="password"
              placeholder="새로운 비밀번호 입력"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              supportingText="비밀번호는 8~12자로 영문 대 소문자, 숫자, 특수기호를 조합해서 사용해주세요."
              errorMessage={passwordError}
              showPasswordToggle
            />

            <TextInput
              name="passwordConfirm"
              type="password"
              placeholder="비밀번호 입력 확인"
              value={confirm}
              onChange={(e) => handleConfirmChange(e.target.value)}
              supportingText={
                showConfirmSuccessText ? "비밀번호가 일치합니다" : undefined
              }
              errorMessage={confirmError}
              showPasswordToggle
            />
          </div>
        </section>

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
