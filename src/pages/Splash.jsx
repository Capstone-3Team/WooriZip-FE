// import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "@/components/buttons/Button";
// import ImageCarousel from "@/components/ImageCarousel";
// import SlideIndicator from "@/components/SlideIndicator";

// const slides = [
//   { src: "/images/intro1.png", alt: "소개 1" },
//   { src: "/images/intro2.png", alt: "소개 2" },
//   { src: "/images/intro3.png", alt: "소개 3" },
// ];

function Splash() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // 초대 코드 읽기용
  // const [currentIndex, setCurrentIndex] = useState(0); // 공통 state

  // /splash?code=XXXX 로 들어온 경우, 초대코드 추출
  const inviteCode = searchParams.get("code") || null;

  const handleStart = () => {
    // 초대코드가 있으면 state로 넘겨주기
    navigate("/login", {
      state: inviteCode ? { inviteCode } : undefined,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-app">
      {/* 상단 1/3 지점 로고/텍스트 영역 */}
      <div className="flex-1 flex flex-col items-center mt-[33vh] px-6">
        {/* 우리.zip (리아산스 폰트) */}
        <p className="font-logo text-3xl font-extrabold text-text-main">
          우리.zip
        </p>

        {/* 로고 이미지 */}
        <img
          src="/logo/imageLogo.svg"
          alt="우리.zip 로고"
          className="mt-4 w-24 h-24"
        />

        {/* 우리 가족의 이야기 */}
        <p className="mt-4 text-lg font-bold text-text-main">
          우리 가족의 이야기
        </p>

        {/* 떨어져 있어도 함께 있는 듯한 따뜻한 기록 */}
        <p className="mt-2 text-md text-gray-80 text-center leading-relaxed">
          떨어져 있어도 함께 있는 듯한 따뜻한 기록
        </p>
      </div>

      {/* 인디케이터 + 버튼 묶음 
      <div className="pt-6 pb-6 flex flex-col items-center">
        {/* 이미지와 인디케이터 사이 간격: mt-6 */}
      {/*<SlideIndicator total={slides.length} currentIndex={currentIndex} /> */}

      {/* 인디케이터와 버튼 사이 간격: mt-12 (위 간격의 2배) */}
      {/*<div className="mt-12 w-full px-6">*/}
      {/* 시작하기 버튼 (하단 고정 느낌으로 여백) */}
      <div className="pb-10 px-6">
        <Button size="large" variant="primary" onClick={handleStart}>
          시작하기
        </Button>
      </div>
    </div>
  );
}

export default Splash;
