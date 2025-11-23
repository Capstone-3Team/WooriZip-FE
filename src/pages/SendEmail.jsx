import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

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

  const handleSendCode = () => {
    // 이메일이 비어있으면 에러 메시지만 보여주고 종료
    if (!trimmedEmail) {
      setEmailError("이메일을 입력해주세요.");
      return;
    }

    setEmailError("");
    setCodeError("");
    setCodeStatus("idle");

    // TODO: 실제 인증번호 전송 API 연동
    console.log("send code to:", trimmedEmail);

    // 3분 타이머 시작 (또는 재시작)
    setTimeLeft(180);
  };

  const handleVerifyCode = () => {
    if (!trimmedCode) {
      setCodeError("인증번호를 입력해주세요.");
      setCodeStatus("error");
      return;
    }

    // TODO: 실제 서버 검증으로 교체
    // 여기서는 예시로 "123456" 만 맞는 걸로 처리
    if (trimmedCode === "123456") {
      setCodeStatus("success");
      setCodeError("");
    } else {
      setCodeStatus("error");
      setCodeError("인증번호가 일치하지 않습니다.");
    }
  };

  const handleNext = () => {
    if (codeStatus !== "success") return;
    // TODO: 다음 단계(새 비밀번호 설정 페이지)로 이동
    navigate("/reset-password");
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
