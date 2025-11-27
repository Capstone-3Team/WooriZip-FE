import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

export default function EditEmailPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailChecked, setEmailChecked] = useState(false); // 중복확인 완료 여부
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const trimmedEmail = email.trim();

  const handleClose = () => navigate(-1);

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

  // 수정 완료 버튼 활성 조건: 이메일 + 중복확인 완료 + 에러 없음
  const canSubmit = trimmedEmail && emailChecked && !emailError;
  const submitButtonVariant = canSubmit ? "primary" : "notFocus";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    // TODO: 이메일 수정 API 호출
    navigate(-1);
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
      <Header
        bgClassName="bg-bg-app"
        variant="solid"
        title="이메일 수정"
        leftIcon={<img src="/icons/close.svg" alt="닫기" className="w-8 h-8" />}
        onLeftClick={handleClose}
        leftAriaLabel="닫기"
      />

      <main className="flex-1 px-6 pt-4 pb-8 flex flex-col">
        <form className="flex flex-col flex-1" onSubmit={handleSubmit}>
          <section>
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

          {/* 하단 수정 완료 버튼 */}
          <div className="mt-auto">
            <Button size="large" variant={submitButtonVariant} type="submit">
              수정 완료
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
