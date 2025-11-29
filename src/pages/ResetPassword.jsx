import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || ""; // 인증 완료된 이메일

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedPassword = password.trim();
  const trimmedConfirm = confirm.trim();

  // 비밀번호 형식: 8~12자, 영문/숫자/특수문자 포함 (간단 버전)
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

  const canSubmit =
    trimmedPassword &&
    trimmedConfirm &&
    isPasswordValid &&
    trimmedPassword === trimmedConfirm;

  const submitVariant = canSubmit ? "primary" : "notFocus";

  // 비밀번호 변경: POST /auth/password/change { email, newPassword }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (!email) {
      setFormError("이메일 정보가 없습니다. 처음부터 다시 진행해주세요.");
      navigate("/send-email");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      const response = await fetch(`${API_BASE_URL}/auth/password/change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          newPassword: trimmedPassword,
        }),
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || "비밀번호 변경에 실패했습니다.");
      }

      console.log("비밀번호 변경 성공:", text);

      // 변경 완료 후 로그인 페이지로 이동
      navigate("/login");
    } catch (error) {
      console.error("비밀번호 변경 실패:", error);
      setFormError(error.message || "비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      {/* 상단 헤더 */}
      <Header
        title="비밀번호 재설정"
        bgClassName="bg-bg-app"
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-8 h-8" />
        }
        onLeftClick={() => navigate(-1)}
        leftAriaLabel="뒤로가기"
      />

      {/* 본문 */}
      <main className="flex-1 flex flex-col px-6 pt-6 pb-8">
        <form className="flex flex-col flex-1" onSubmit={handleSubmit}>
          <section>
            <h1 className="text-xl font-semibold text-text-main mb-6">
              신규 비밀번호를 입력해주세요
            </h1>

            <div className="space-y-3">
              {/* 새로운 비밀번호 */}
              <TextInput
                name="newPassword"
                type="password"
                placeholder="새로운 비밀번호 입력"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFormError("");
                }}
                supportingText="비밀번호는 8~12자로 영문 대 소문자, 숫자, 특수기호를 조합해서 사용해주세요."
                errorMessage={passwordError}
                showPasswordToggle
              />

              {/* 비밀번호 확인 */}
              <TextInput
                name="confirmPassword"
                type="password"
                placeholder="비밀번호 입력 확인"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setFormError("");
                }}
                supportingText={
                  showConfirmSuccessText ? "비밀번호가 일치합니다" : undefined
                }
                errorMessage={confirmError}
                showPasswordToggle
              />
            </div>
            {formError && (
              <p className="mt-2 text-xs text-red-500">{formError}</p>
            )}
          </section>

          {/* 하단 버튼 */}
          {/* 버튼을 감싼 div에 mt-auto 
          → 남는 공간을 전부 위로 밀어서 버튼이 항상 아래 + pb-8만큼 위에 위치 */}
          <div className="mt-auto">
            <Button size="large" variant={submitVariant} type="submit">
              {isSubmitting ? "변경 중..." : "변경 완료"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ResetPassword;
