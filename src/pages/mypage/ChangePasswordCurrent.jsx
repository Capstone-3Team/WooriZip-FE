import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

function ChangePasswordCurrent() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");

  const trimmedPassword = currentPassword.trim();

  // 비밀번호 형식: 8~12자, 영문/숫자/특수문자 포함 (ResetPassword와 동일)
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};:'",.<>/?`~\\|]).{8,12}$/;

  const isPasswordValid =
    trimmedPassword.length === 0 || passwordRegex.test(trimmedPassword);

  const passwordError =
    trimmedPassword && !isPasswordValid
      ? "비밀번호는 8~12자의 영문, 숫자, 특수기호를 모두 포함해야 합니다."
      : "";

  const canSubmit = trimmedPassword && isPasswordValid;
  const submitVariant = canSubmit ? "primary" : "notFocus";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    // 1단계에서는 서버 호출 없이, 기존 비밀번호를 state로 넘겨줌
    navigate("/mypage/reset-password", {
      state: { currentPassword: trimmedPassword },
    });
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      {/* 상단 헤더 */}
      <Header
        title="비밀번호 변경"
        bgClassName="bg-bg-app"
        leftIcon={<img src="/icons/close.svg" alt="닫기" className="w-8 h-8" />}
        onLeftClick={() => navigate(-1)}
        leftAriaLabel="닫기"
      />

      {/* 본문 */}
      <main className="flex-1 flex flex-col px-6 pt-6 pb-8">
        <form className="flex flex-col flex-1" onSubmit={handleSubmit}>
          <section>
            <h1 className="text-xl font-semibold text-text-main mb-6">
              기존 비밀번호를 입력해주세요
            </h1>

            <TextInput
              name="currentPassword"
              type="password"
              placeholder="기존 비밀번호 입력"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              supportingText="비밀번호는 8~12자로 영문 대 소문자, 숫자, 특수기호를 조합해서 사용해주세요."
              errorMessage={passwordError}
              showPasswordToggle
            />
          </section>

          {/* 하단 버튼 (항상 화면 맨 아래에 위치) */}
          <div className="mt-auto">
            <Button size="large" variant={submitVariant} type="submit">
              다음
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ChangePasswordCurrent;
