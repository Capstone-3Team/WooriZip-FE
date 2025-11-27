import Header from "@/layouts/Header";
import Button from "@/components/buttons/Button";

function ArchiveMediaDetail({
  dateLabel,
  mediaType, // "image" | "video"
  src,
  onClose,
  onSave,
}) {
  const handleSave = () => {
    // TODO: 실제 저장(다운로드) 로직으로 교체
    // 기본 예시: 이미지/영상 파일 새 탭으로 열기
    if (onSave) {
      onSave();
      return;
    }

    const link = document.createElement("a");
    link.href = src;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Header
        bgClassName="bg-bg-app"
        variant="solid"
        title={dateLabel}
        leftIcon={<img src="/icons/close.svg" alt="닫기" className="w-6 h-6" />}
        onLeftClick={onClose}
        leftAriaLabel="닫기"
      />

      <main className="flex-1 flex flex-col px-0 pt-0 pb-8">
        {/* 미디어 영역 */}
        <div className="flex-1 bg-gray-10 flex items-center justify-center">
          {mediaType === "video" ? (
            <video
              src={src}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={src}
              alt={dateLabel}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* 하단 저장 버튼 */}
        <div className="px-6 mt-4">
          <Button
            size="large"
            variant="primary"
            type="button"
            onClick={handleSave}
          >
            저장하기
          </Button>
        </div>
      </main>
    </div>
  );
}

export default ArchiveMediaDetail;
