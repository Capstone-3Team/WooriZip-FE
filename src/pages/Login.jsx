import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // /splash에서 넘어온 초대코드 (state로 전달된 값)
  const { inviteCode } = location.state || {};

  const [idOrEmail, setIdOrEmail] = useState(""); // 아이디/이메일 입력 값
  const [password, setPassword] = useState(""); // 비밀번호 입력 값
  const [idError, setIdError] = useState(""); // 아이디/이메일 관련 에러 메시지
  const [passwordError, setPasswordError] = useState(""); // 비밀번호 관련 에러 메시지
  const [formError, setFormError] = useState(""); // 서버에서 온 에러/기타 오류 메시지
  const [isSubmitting, setIsSubmitting] = useState(false); // 로그인 요청 중 여부

  // 로그인 버튼 클릭 핸들러 (메인 로직)
  const handleLogin = async (e) => {
    e.preventDefault();

    let hasError = false;

    // 이메일 입력 검증 (공백만 입력한 경우 방지)
    if (!idOrEmail.trim()) {
      setIdError("이메일을 입력해주세요.");
      hasError = true;
    } else {
      setIdError("");
    }

    // 비밀번호 입력 검증
    if (!password.trim()) {
      setPasswordError("비밀번호를 입력해주세요.");
      hasError = true;
    } else {
      setPasswordError("");
    }

    // 둘 중 하나라도 비어 있으면 API 호출하지 않고 종료
    if (hasError) return;

    // 여기부터 실제 로그인 API 호출
    try {
      setIsSubmitting(true);
      setFormError("");

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 스웨거 기준: { "email": "string", "password": "string" }
        body: JSON.stringify({
          email: idOrEmail.trim(),
          password: password.trim(),
        }),
      });

      const contentType = response.headers.get("content-type") || "";

      // 응답이 JSON 형식인지 확인 (text 응답 방어)
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "서버 응답 형식이 올바르지 않습니다.");
      }

      // 정상적인 JSON 응답일 때 파싱
      // 기대 형태: { token, message }
      const data = await response.json();

      // HTTP 상태 코드가 200대가 아닌 경우
      if (!response.ok) {
        throw new Error(data.message || "로그인에 실패했습니다.");
      }

      // JWT 토큰 + 로그인 상태 로컬에 저장 (나중에 Authorization 헤더에 사용)
      if (data.token) {
        localStorage.setItem("accessToken", data.token);
      }
      localStorage.setItem("isLoggedIn", "true"); // 간단한 로그인 상태 플래그
      console.log("[DEBUG] /auth/login success:", data);

      navigate("/week-answer");
    } catch (error) {
      console.error("로그인 실패:", error);
      setFormError(error.message || "로그인 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 실제 카카오 로그인 + 서버 API 호출 대신, 지금은 mock 함수로 플로우만 잡아둔 상태
  const mockKakaoLogin = async () => {
    // TODO: 나중에 실제 카카오 SDK + 백엔드 API 연동으로 교체
    // status: "EXISTING" | "NEEDS_SIGNUP" 두 가지 케이스만 가정
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

  // 비밀번호 찾기 페이지로 이동
  const goToResetPassword = () => {
    navigate("/send-email");
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <div className="flex-1 px-6 pt-10 pb-8 flex flex-col">
        {/* 로고 영역 */}
        <div className="mt-20 mb-15 flex flex-col items-center">
          <span className="font-logo text-3xl font-extrabold leading-none text-accent">
            우리.zip
          </span>
        </div>

        {/* 로그인 폼 */}
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          {/* 아이디/이메일 */}
          <TextInput
            name="idOrEmail"
            placeholder="이메일을 입력해주세요"
            value={idOrEmail}
            onChange={(e) => {
              setIdOrEmail(e.target.value);
              // 입력이 바뀌면 해당 필드 에러와 공통 에러는 초기화
              setIdError("");
              setFormError("");
            }}
            errorMessage={idError}
          />

          {/* 비밀번호 */}
          <div className="space-y-2">
            <TextInput
              name="password"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
                setFormError("");
              }}
              showPasswordToggle // TextInput에 넘길 값
              errorMessage={passwordError}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={goToResetPassword}
                className="mr-3 block text-xs text-gray-60"
              >
                비밀번호 찾기
              </button>
            </div>
          </div>

          {/* 서버 에러 메시지 */}
          {formError && (
            <p className="mt-1 text-xs text-red-500">{formError}</p>
          )}

          {/* 로그인 / 카카오 로그인 버튼 */}
          <div className="mt-6 space-y-4">
            <Button
              size="large"
              variant="primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "로그인 중..." : "로그인"}
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
