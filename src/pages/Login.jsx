import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // /splash에서 넘어온 초대코드 (없으면 undefined)
  const { inviteCode } = location.state || {};

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

  // 실제 카카오 로그인 + 서버 API 호출 대신, 지금은 mock 함수로 플로우만 잡아둔 상태
  const mockKakaoLogin = async () => {
    // TODO: 나중에 실제 카카오 SDK + 백엔드 API 연동으로 교체
    // status: "EXISTING" | "NEEDS_SIGNUP"
    return {
      status: "NEEDS_SIGNUP",
      kakaoUser: {
        id: "kakao-123",
        email: "woorizip@naver.com",
      },
    };
  };

  const handleKakaoLogin = async () => {
    try {
      const result = await mockKakaoLogin();

      if (result.status === "EXISTING") {
        // 이미 가입한 회원인 경우 → 바로 로그인 처리 후 메인으로
        localStorage.setItem("isLoggedIn", "true");
        navigate("/week-answer");
        return;
      }

      if (result.status === "NEEDS_SIGNUP") {
        // 가입 이력이 없는 카카오 계정 → 약관동의 페이지로 이동
        navigate("/terms-consent", {
          state: {
            kakaoId: result.kakaoUser.id,
            email: result.kakaoUser.email,
            inviteCode, // /splash에서 넘어온 초대코드도 함께 전달
          },
        });
      }
    } catch (error) {
      console.error("카카오 로그인 실패:", error);
    }
  };

  // 일반 회원가입 버튼은 kakao 정보 없이 약관 페이지로 이동
  const goToSignUp = () => {
    navigate("/terms-consent", {
      state: inviteCode ? { inviteCode } : undefined,
    });
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
              variant="kakao"
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
            <div className="flex-1 h-px bg-gray-40" />
            <span>아직 회원이 아니신가요?</span>
            <div className="flex-1 h-px bg-gray-40" />
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
