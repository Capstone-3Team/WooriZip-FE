function FirstLoading() {
  return (
    <div className="min-h-screen bg-yellow-main flex flex-col items-center justify-center">
      {/* 로고 이미지 */}
      <div className="w-40 h-40 bg-gray-20 flex items-center justify-center">
        <span className="text-sm text-gray-80">로고</span>
      </div>

      {/* 우리.zip 타이포 로고 */}
      <div className="mt-8">
        <span className="font-logo text-3xl font-extrabold leading-none text-text-main">
          우리.zip
        </span>
      </div>
    </div>
  );
}

export default FirstLoading;
