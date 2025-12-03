import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function KakaoCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      // 사용자가 카카오 로그인 화면에서 취소한 경우 등
      navigate("/login", { replace: true });
      return;
    }

    if (!code) {
      // code가 없으면 그냥 로그인 페이지로
      navigate("/login", { replace: true });
      return;
    }

    // ✅ 나중에 백엔드랑 연동할 부분
    // 1. 여기서 백엔드에 code 보내기 (POST /auth/kakao/login)
    // 2. 백엔드 응답 예시:
    //    { isNewUser: true/false, user: {...}, accessToken: "...", refreshToken: "..." }
    // 3. 토큰 저장 + 분기:
    //    - isNewUser === false → navigate("/week-answer")
    //    - isNewUser === true  → navigate("/terms-consent", { state: { kakaoId, email } })

    console.log("Kakao auth code (나중에 백엔드로 보낼 값):", code);

    // 지금은 백엔드 없으니까 일단 로그인 페이지로만 돌려보내기
    navigate("/login", { replace: true });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-app">
      <p className="text-text-main text-md">카카오 로그인 처리 중...</p>
    </div>
  );
}

export default KakaoCallbackPage;
