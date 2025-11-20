import { useRef } from "react";

function ImageCarousel({
  images = [], // [{ src, alt }]
  currentIndex, // 부모가 관리하는 현재 인덱스
  onChangeIndex, // 인덱스 바뀔 때 호출
  className = "",
  heightClass = "h-100", // 높이는 필요에 따라 조절
}) {
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
    if (!onChangeIndex) return;

    let next = index;
    if (next < 0) next = total - 1;
    if (next >= total) next = 0;

    onChangeIndex(next);
  };

  /* ---- 스와이프 ---- */
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return;

    const diff = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 40;

    if (diff > threshold) {
      // 오른쪽으로 스와이프 → 이전
      goTo(currentIndex - 1);
    } else if (diff < -threshold) {
      // 왼쪽으로 스와이프 → 다음
      goTo(currentIndex + 1);
    }

    touchStartX.current = null;
  };

  /* ---- 클릭 (왼쪽/오른쪽 절반) ---- */
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // 컨테이너 기준 X 좌표

    if (x < rect.width / 2) {
      // 왼쪽 절반 클릭 → 이전
      goTo(currentIndex - 1);
    } else {
      // 오른쪽 절반 클릭 → 다음
      goTo(currentIndex + 1);
    }
  };

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div
        className={`relative w-full ${heightClass} overflow-hidden bg-gray-20 touch-pan-y`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div
          className="flex h-full transition-transform duration-300"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((img, index) => (
            <div key={index} className="w-full h-full shrink-0">
              <img
                src={img.src}
                alt={img.alt ?? `slide-${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ImageCarousel;
