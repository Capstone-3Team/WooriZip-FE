import React, { useState, useRef } from "react";
import SlideIndicator from "./SlideIndicator";

function ImageCarousel({
  images = [], // [{ src, alt }] 형태 추천
  className = "",
  heightClass = "h-72", // 이미지 영역 높이 (필요하면 props로 커스텀)
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);

  const total = images.length;

  if (!total) {
    return (
      <div
        className={`w-full ${heightClass} bg-gray-20 flex items-center justify-center text-sm text-gray-60`}
      >
        이미지가 없습니다.
      </div>
    );
  }

  const goTo = (index) => {
    if (index < 0) {
      setCurrentIndex(total - 1);
    } else if (index >= total) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(index);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return;

    const diff = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 40; // 얼마나 스와이프해야 넘길지

    if (diff > threshold) {
      // 오른쪽으로 스와이프 → 이전 이미지
      goTo(currentIndex - 1);
    } else if (diff < -threshold) {
      // 왼쪽으로 스와이프 → 다음 이미지
      goTo(currentIndex + 1);
    }

    touchStartX.current = null;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* 이미지 영역 */}
      <div
        className={`relative w-full overflow-hidden bg-gray-20 ${heightClass}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-300"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((img, index) => (
            <div key={index} className="w-full shrink-0 h-full">
              <img
                src={img.src}
                alt={img.alt ?? `slide-${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 인디케이터 */}
      <SlideIndicator
        total={total}
        currentIndex={currentIndex}
        className="py-3"
      />
    </div>
  );
}

export default ImageCarousel;
