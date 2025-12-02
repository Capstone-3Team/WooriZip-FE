function FirstLoading() {
  return (
    <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center">
      {/* 로고 이미지 */}
      <div className="w-40 h-40 flex items-center justify-center">
        <img
          src="/logo/logo.svg" // 👉 실제 로고 경로로 바꿔줘
          alt="우리zip 로고"
          className="w-32 h-32 object-contain"
        />
      </div>
    </div>
  );
}

export default FirstLoading;
