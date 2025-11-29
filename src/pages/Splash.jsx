import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "@/components/buttons/Button";
import ImageCarousel from "@/components/ImageCarousel";
import SlideIndicator from "@/components/SlideIndicator";

const slides = [
  { src: "/images/intro1.png", alt: "소개 1" },
  { src: "/images/intro2.png", alt: "소개 2" },
  { src: "/images/intro3.png", alt: "소개 3" },
];

function Splash() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // 초대 코드 읽기용
  const [currentIndex, setCurrentIndex] = useState(0); // 공통 state

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
      {/* 이미지 캐러셀 영역 */}
      <div className="mt-20">
        <ImageCarousel
          images={slides}
          currentIndex={currentIndex} // state 전달
          onChangeIndex={setCurrentIndex} // 바뀔 때 state 갱신
          heightClass="h-100"
        />
      </div>

      {/* 인디케이터 + 버튼 묶음 */}
      <div className="pt-6 pb-6 flex flex-col items-center">
        {/* 이미지와 인디케이터 사이 간격: mt-6 */}
        <SlideIndicator total={slides.length} currentIndex={currentIndex} />

        {/* 인디케이터와 버튼 사이 간격: mt-12 (위 간격의 2배) */}
        <div className="mt-12 w-full px-6">
          <Button size="large" variant="primary" onClick={handleStart}>
            시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Splash;
