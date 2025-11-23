import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import ProgressBar from "@/components/ProgressBar";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

function ProfileImageStep() {
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 단계에서 받은 값들
  const { email, password, agreedTerms, nickname = "" } = location.state || {};

  const trimmedNickname = nickname.trim();

  const handleSelectImage = () => {
    // TODO: 앨범/카메라 열어서 이미지 선택하는 로직 연결
    console.log("프로필 이미지 선택 클릭");
  };

  const handleNext = () => {
    // 별명은 최신 값(입력창에서 수정됐을 수도 있으니까)으로 넘기기
    navigate("/signup/birthdate", {
      state: {
        email,
        password,
        //kakaoId,          // 카카오 회원가입이면 유지, 아니면 undefined
        agreedTerms,
        nickname: trimmedNickname,
        //profileImageUrl,  // 나중에 실제 이미지 선택 로직 붙이면 같이 넘기면 됨
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
      <main className="flex-1 px-6 pt-4 pb-8 flex flex-col">
        <section>
          {/* 온보딩 3 / 7 단계라고 가정 */}
          <ProgressBar currentStep={3} totalSteps={7} className="mb-8" />

          <h1 className="text-xl font-semibold text-text-main leading-snug">
            프로필 이미지 (선택)
          </h1>
          <p className="mt-2 text-sm text-gray-60">
            활동할 프로필 이미지를 생성할 수 있어요
          </p>
        </section>

        {/* 프로필 이미지 선택 영역 */}
        <section className="mt-10 flex flex-col items-center">
          <button
            type="button"
            onClick={handleSelectImage}
            className="w-36 h-36 rounded-full bg-gray-20 flex items-center justify-center"
            aria-label="프로필 이미지 선택"
          >
            {/* 실제 이미지를 넣기 전까지는 기본 아이콘/placeholder */}
            <img
              src="/icons/user.svg"
              alt=""
              className="w-20 h-20 opacity-70"
            />
          </button>
        </section>

        {/* 별명 표시 영역 */}
        <section className="mt-10">
          <label
            htmlFor="nickname"
            className="block text-sm font-semibold text-text-main mb-2"
          >
            별명
          </label>

          <TextInput
            name="nickname"
            id="nickname"
            value={trimmedNickname}
            placeholder="별명 입력"
            readOnly // 디자인대로 노랑 배경 + 입력 불가
          />
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

export default ProfileImageStep;
