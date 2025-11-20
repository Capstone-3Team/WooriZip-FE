import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

function Login() {
  const navigate = useNavigate();

  const [idOrEmail, setIdOrEmail] = useState(""); // 아이디/이메일 입력 값
  const [password, setPassword] = useState(""); // 비밀번호 입력 값
  const [idError, setIdError] = useState(""); // 아이디/이메일 관련 에러 메시지
  const [passwordError, setPasswordError] = useState(""); // 비밀번호 관련 에러 메시지
  // 에러가 있으면 TextInput에 errorMessage로 내려보내서 input 아래 빨간 글자로 표시

  // 로그인 버튼 클릭 핸들러 (메인 로직)
  const handleLogin = (e) => {
    e.preventDefault();

    let hasError = false;

    if (!idOrEmail.trim()) {
      // 공백을 제거한 문자열이 빈 문자열이면 입력안한 것으로 판단
      setIdError("아이디 또는 이메일을 입력해주세요.");
      hasError = true;
    } else {
      setIdError("");
    }

    if (!password.trim()) {
      setPasswordError("비밀번호를 입력해주세요.");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (hasError) return;

    // TODO: API 호출 + 검증 후, 성공했다고 가정하면:
    localStorage.setItem("isLoggedIn", "true");

    navigate("/week-answer");
  };

  const handleKakaoLogin = () => {
    // TODO: 카카오 로그인 연동
    console.log("카카오 로그인 클릭");
  };

  // onClick에서 사용하는 간단한 wrapper 함수들
  const goToSignUp = () => {
    navigate("/sign-up");
  };

  const goToResetPassword = () => {
    navigate("/send-email");
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <div className="flex-1 px-6 pt-10 pb-8 flex flex-col">
        {/* 로고 영역 */}
        <div className="mt-20 mb-15 flex flex-col items-center">
          <span className="font-logo text-3xl font-extrabold leading-none text-text-main">
            우리.zip
          </span>
        </div>

        {/* 로그인 폼 */}
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          {/* 아이디/이메일 */}
          <TextInput
            name="idOrEmail"
            placeholder="아이디나 이메일을 입력해주세요"
            value={idOrEmail}
            onChange={(e) => setIdOrEmail(e.target.value)}
            errorMessage={idError}
          />

          {/* 비밀번호 */}
          <div className="space-y-2">
            <TextInput
              name="password"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPasswordToggle
              errorMessage={passwordError}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={goToResetPassword}
                className="mr-3 block text-xs text-gray-60"
              >
                비밀번호 재설정
              </button>
            </div>
          </div>

          {/* 로그인 / 카카오 로그인 버튼 */}
          <div className="mt-6 space-y-4">
            <Button size="large" variant="primary" type="submit">
              로그인
            </Button>

            <Button
              size="large"
              variant="primary"
              type="button"
              onClick={handleKakaoLogin}
            >
              카카오톡으로 로그인
            </Button>
          </div>
        </form>

        {/* 구분선 + 회원가입 */}
        <div className="mt-10">
          <div className="flex items-center gap-3 text-xs text-gray-60">
            <div className="flex-1 h-px bg-gray-20" />
            <span>아직 회원이 아니신가요?</span>
            <div className="flex-1 h-px bg-gray-20" />
          </div>

          <div className="mt-8">
            <Button size="large" variant="default" onClick={goToSignUp}>
              회원가입
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
