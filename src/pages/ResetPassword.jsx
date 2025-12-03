import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 단계(이메일 인증)에서 넘겨준 이메일
  // 비정상 접근 시를 대비해 기본값은 빈 문자열
  const email = location.state?.email || "";

  // 비밀번호 입력값 상태
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  // 폼 전체 에러(이메일 없음, 네트워크 에러 등)
  const [formError, setFormError] = useState("");
  // 중복 제출 방지 플래그
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 양 끝 공백 제거한 값
  const trimmedPassword = password.trim(); // 새로운 비밀번호
  const trimmedConfirm = confirm.trim(); // 비밀번호 확인

  // 비밀번호 형식: 8~12자, 영문/숫자/특수문자를 모두 포함해야 함
  //  - 최소 하나의 영문
  //  - 최소 하나의 숫자
  //  - 최소 하나의 특수문자
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};:'",.<>/?`~\\|]).{8,12}$/;

  // 아무 것도 입력 안 했을 땐 에러 표시하지 않고,
  // 입력이 있을 때만 정규식 검증
  const isPasswordValid =
    trimmedPassword.length === 0 || passwordRegex.test(trimmedPassword);

  // 비밀번호 형식 에러 메시지
  const passwordError =
    trimmedPassword && !isPasswordValid
      ? "비밀번호는 8~12자의 영문, 숫자, 특수기호를 모두 포함해야 합니다."
      : "";

  // 비밀번호 확인: 입력이 없으면 검증하지 않고,
  // 둘 다 값이 있고, 비밀번호가 유효한 경우에만 일치 여부 체크
  const isConfirmMatch =
    trimmedConfirm.length === 0 ||
    (trimmedPassword && trimmedPassword === trimmedConfirm);

  // 비밀번호 확인 에러 메시지
  const confirmError =
    trimmedConfirm && !isConfirmMatch ? "비밀번호가 일치하지 않습니다." : "";

  // "비밀번호가 일치합니다" 성공 문구를 보여줄 조건
  const showConfirmSuccessText =
    trimmedPassword && // 새로운 비밀번호 입력
    trimmedConfirm && // 비밀번호 확인
    isPasswordValid && // 정규식 통과
    trimmedPassword === trimmedConfirm &&
    !confirmError;

  // 제출 가능 조건
  const canSubmit =
    trimmedPassword &&
    trimmedConfirm &&
    isPasswordValid &&
    trimmedPassword === trimmedConfirm;

  // 버튼 variant: 조건 만족 시 primary, 아니면 비활성 느낌(notFocus)
  const submitVariant = canSubmit ? "primary" : "notFocus";

  // 비밀번호 변경: POST /auth/password/change { email, newPassword }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    // 이메일 정보 없이 들어온 경우: 플로우 깨짐 → 처음 단계로 돌려보냄
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

      // 백엔드에서 문자열을 줌 -> text()로 받음
      // Response: 비밀번호가 성공적으로 변경되었습니다.
      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || "비밀번호 변경에 실패했습니다.");
      }

      console.log("비밀번호 변경 성공:", text);

      // 성공 시 로그인 페이지로 이동
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
                  // 개별 입력 시 공통 에러 초기화
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
                // 비밀번호가 일치하고 형식도 맞을 때만 성공 문구 표시
                supportingText={
                  showConfirmSuccessText ? "비밀번호가 일치합니다" : undefined
                }
                errorMessage={confirmError}
                showPasswordToggle
              />
            </div>
            {/* 서버/플로우 관련 폼 에러 (이메일 없음, 통신 에러 등) */}
            {formError && (
              <p className="mt-2 text-xs text-red-500">{formError}</p>
            )}
          </section>

          {/* 하단 버튼 영역
              mt-auto로 위쪽 여유 공간을 밀어내서 버튼을 항상 하단에 위치시키고,
              부모(main)의 pb-8 덕분에 살짝 떠 있도록 함 */}
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
