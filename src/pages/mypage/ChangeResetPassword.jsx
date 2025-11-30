import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ChangeResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1단계에서 넘겨준 기존 비밀번호
  const currentPassword = location.state?.currentPassword || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitError, setSubmitError] = useState("");
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
    trimmedPassword === trimmedConfirm &&
    !!currentPassword;

  const submitVariant = canSubmit ? "primary" : "notFocus";

  // currentPassword 없이 직접 주소로 들어온 경우 1단계로 돌려보내기
  useEffect(() => {
    if (!currentPassword) {
      navigate("/mypage/change-password", { replace: true });
    }
  }, [currentPassword, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch(`${API_BASE_URL}/mypage/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword: trimmedPassword,
        }),
      });

      if (!res.ok) {
        // 서버에서 400 등으로 기존 비밀번호 불일치/검증 실패를 내려줄 수 있음
        throw new Error("비밀번호를 변경하지 못했습니다.");
      }

      // 성공 시 프로필 페이지나 이전 화면으로 이동
      navigate("/mypage/profile", { replace: true });
    } catch (error) {
      console.error(error);
      setSubmitError(
        "비밀번호를 변경하지 못했어요. 기존 비밀번호가 맞는지 다시 한 번 확인해주세요."
      );
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
                onChange={(e) => setPassword(e.target.value)}
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
                onChange={(e) => setConfirm(e.target.value)}
                supportingText={
                  showConfirmSuccessText ? "비밀번호가 일치합니다" : undefined
                }
                errorMessage={confirmError}
                showPasswordToggle
              />
            </div>
          </section>

          {/* 하단 버튼 + 에러 메시지 */}
          <div className="mt-auto">
            {submitError && (
              <p className="mb-2 text-xs text-red-500">{submitError}</p>
            )}
            <Button size="large" variant={submitVariant} type="submit">
              {isSubmitting ? "변경 중..." : "변경 완료"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ChangeResetPassword;
