import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import Button from "@/components/buttons/Button";
import ProgressBar from "@/components/ProgressBar";

function KakaoEmailConfirm() {
  const navigate = useNavigate();
  const location = useLocation();

  const { kakaoId, email, agreedTerms } = location.state || {};

  const handleNext = () => {
    // TODO: 다음 회원가입 단계(닉네임/프로필 설정 등)으로 이동
    navigate("/signup/profile", {
      state: {
        kakaoId,
        email,
        agreedTerms,
      },
    });
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      {/* 헤더 */}
      <Header
        bgClassName="bg-bg-app"
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-8 h-8" />
        }
        onLeftClick={() => navigate(-1)}
        leftAriaLabel="뒤로가기"
      />

      {/* 본문 */}
      <main className="flex-1 px-6 pt-3 pb-8 flex flex-col">
        {/* 상단 프로그레스 바 + 타이틀 */}
        <section>
          <ProgressBar
            currentStep={1} // 온보딩 전체 단계 수에 맞게 조정
            totalSteps={7}
            className="mb-8"
          />

          <h1 className="text-xl font-semibold text-text-main leading-snug">
            카카오계정
            <br />
            이메일을 확인해주세요
          </h1>
        </section>

        {/* 이메일 박스 */}
        <section className="mt-10">
          <div className="w-full h-14 rounded-xl bg-yellow-40 flex items-center justify-center">
            <span className="text-md font-semibold text-text-main">
              {email || "이메일 정보를 불러올 수 없습니다."}
            </span>
          </div>
        </section>

        {/* 하단 버튼 */}
        <div className="mt-auto">
          <Button
            size="large"
            variant="primary"
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

export default KakaoEmailConfirm;
