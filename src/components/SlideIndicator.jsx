function SlideIndicator({ total, currentIndex = 0, className = "" }) {
  if (!total || total <= 1) return null; // 0장 or 1장일 땐 인디케이터 안 보여줘도 됨

  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === currentIndex;

        return (
          <span
            key={index}
            className={
              "h-1.5 rounded-full transition-all duration-150 " +
              (isActive
                ? "w-6 bg-yellow-main" // 활성: 길고 노랑
                : "w-1.5 bg-gray-20") // 비활성: 짧고 연한 회색
            }
          />
        );
      })}
    </div>
  );
}

export default SlideIndicator;
