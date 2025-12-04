import Header from "@/layouts/Header";
import Button from "@/components/buttons/Button";

function ArchiveMediaDetail({
  dateLabel,
  mediaType, // "image" | "video"
  src,
  onClose,
  onSave,
}) {
  const handleSave = async () => {
    console.log("[ArchiveMediaDetail] handleSave called", {
      src,
      mediaType,
      hasOnSave: !!onSave,
    });

    // 부모에서 onSave를 넘겨줬으면 그걸 우선 사용
    if (onSave) {
      await onSave();
      return;
    }

    if (!src) return;

    try {
      // 1) 먼저 S3에서 파일을 받아오기
      const response = await fetch(src);
      if (!response.ok) {
        console.error("download fetch failed", response.status);
        // 혹시라도 실패하면 마지막으로 새 탭으로라도 열어줌
        window.open(src, "_blank");
        return;
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // 2) 파일명 만들기 (날짜 + 확장자)
      const cleanUrl = src.split("?")[0];
      const match = cleanUrl.match(/\.([a-zA-Z0-9]+)$/);
      const ext = match?.[1] || (mediaType === "video" ? "mp4" : "jpg");

      const baseName =
        (dateLabel && dateLabel.replace(/\s+/g, "_")) || "woorizip_media";
      const fileName = `${baseName}.${ext}`;

      // 3) 숨은 a 태그로 다운로드 트리거
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      // 4) blob URL 정리
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("failed to download media", e);
      window.open(src, "_blank");
    }
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
