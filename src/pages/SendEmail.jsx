import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function SendEmail() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeStatus, setCodeStatus] = useState("idle"); // 인증번호 검증 결과

  const [timeLeft, setTimeLeft] = useState(0); // 남은 시간(초)

  // 남은 시간 타이머
  useEffect(() => {
    if (timeLeft <= 0) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(id);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const trimmedEmail = email.trim();
  const trimmedCode = code.trim();

  const hasTimeLeft = timeLeft > 0;

  // 버튼 색 결정 로직
  const sendButtonVariant = trimmedEmail ? "primary" : "notFocus";
  const verifyButtonVariant = trimmedCode ? "primary" : "notFocus";
  const nextButtonVariant = codeStatus === "success" ? "primary" : "notFocus";

  // 1) 인증번호 이메일 전송: POST /auth/password/email { email }
  const handleSendCode = async () => {
    if (!trimmedEmail) {
      setEmailError("이메일을 입력해주세요.");
      return;
    }

    try {
      setEmailError("");
      setCodeError("");
      setCodeStatus("idle");

      const response = await fetch(`${API_BASE_URL}/auth/password/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || "인증번호 전송에 실패했습니다.");
      }

      console.log("인증번호 전송 성공:", text);

      // 3분 타이머 시작 (또는 재시작)
      setTimeLeft(180);
    } catch (error) {
      console.error("인증번호 전송 실패:", error);
      setEmailError(error.message || "인증번호 전송 중 오류가 발생했습니다.");
      setTimeLeft(0);
    }
  };

  // 2) 인증번호 검증: POST /auth/password/verify { email, code }
  const handleVerifyCode = async () => {
    if (!trimmedEmail) {
      setEmailError("이메일을 먼저 입력하고 인증번호를 받아주세요.");
      return;
    }

    if (!trimmedCode) {
      setCodeError("인증번호를 입력해주세요.");
      setCodeStatus("error");
      return;
    }

    try {
      setCodeError("");
      const response = await fetch(`${API_BASE_URL}/auth/password/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          code: trimmedCode,
        }),
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || "인증번호가 일치하지 않습니다.");
      }

      console.log("인증번호 검증 성공:", text);
      setCodeStatus("success");
      setCodeError("");
    } catch (error) {
      console.error("인증번호 검증 실패:", error);
      setCodeStatus("error");
      setCodeError(error.message || "인증번호가 일치하지 않습니다.");
    }
  };

  // 3) 다음 단계로: 인증 성공시 /reset-password 로 이동, 이메일 같이 넘김
  const handleNext = () => {
    if (codeStatus !== "success") return;

    navigate("/reset-password", {
      state: { email: trimmedEmail },
    });
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      {/* 상단 헤더 */}
      <Header
        title="비밀번호 찾기"
        bgClassName="bg-bg-app"
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-8 h-8" />
        }
        onLeftClick={() => navigate(-1)}
        leftAriaLabel="뒤로가기"
      />

      {/* 본문 */}
      <main className="flex-1 px-6 pt-6 pb-8">
        {/* 이메일 인증 섹션 */}
        <section>
          <h2 className="text-xl font-semibold text-text-main mb-6">
            이메일을 인증해주세요
          </h2>

          <div className="space-y-5">
            <TextInput
              name="email"
              type="email"
              placeholder="이메일을 입력해주세요"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              errorMessage={emailError}
              supportingText={
                hasTimeLeft ? `남은 시간 ${formatTime(timeLeft)}` : undefined
              }
            />

            {/* 인증번호 전송 버튼: 기본 notFocus, 이메일 입력되면 primary */}
            <Button
              size="large"
              variant={sendButtonVariant}
              type="button"
              onClick={handleSendCode}
            >
              {hasTimeLeft ? "인증번호 재전송" : "인증번호 전송"}
            </Button>
          </div>
        </section>

        {/* 인증번호 입력 섹션 */}
        <section className="mt-14">
          <h2 className="text-xl font-semibold text-text-main mb-6">
            인증번호 입력
          </h2>

          <div className="flex items-start gap-3">
            <div className="flex-1">
              <TextInput
                name="code"
                type="text"
                placeholder="인증번호 입력"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setCodeError("");
                  setCodeStatus("idle");
                }}
                errorMessage={codeError}
              />
            </div>

            {/* 인증번호 확인 버튼: 코드 입력되면 primary, 아니면 notFocus */}
            <Button
              size="small"
              variant={verifyButtonVariant}
              type="button"
              onClick={handleVerifyCode}
            >
              확인
            </Button>
          </div>
        </section>

        {/* 다음 버튼: 기본 notFocus, 코드 검증 성공하면 primary */}
        <div className="mt-5">
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

export default SendEmail;
