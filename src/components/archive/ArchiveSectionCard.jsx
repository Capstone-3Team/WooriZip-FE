// --------------------------------------
// URL 문자열을 보고 이미지/비디오 타입 추론하는 헬퍼
// --------------------------------------
function detectMediaType(url) {
  if (!url) return "image";
  const lowered = url.toLowerCase();

  // data URL이 비디오 타입인 경우
  // (참고) 실제 blob URL은 보통 "blob:https://..." 형태라
  // 아래 코드는 거의 안 쓰일 가능성이 큼.
  if (lowered.startsWith("data:video") || lowered.startsWith("blob:video")) {
    return "video";
  }

  // 확장자로 비디오 타입 판별
  if (
    lowered.endsWith(".mp4") ||
    lowered.endsWith(".mov") ||
    lowered.endsWith(".avi") ||
    lowered.endsWith(".webm")
  ) {
    return "video";
  }

  // 그 외는 기본적으로 이미지 취급
  return "image";
}

// --------------------------------------
// 아카이브 섹션 카드 컴포넌트
// - 제목 + 화살표
// - 최대 3개의 미리보기 이미지/영상
// - 섹션 전체가 클릭 영역 (button)
// --------------------------------------
function ArchiveSectionCard({ title, previewItems = [], onClick = () => {} }) {
  // 미리보기 데이터가 있는지 여부
  const hasPreview = previewItems.length > 0;
  // 최대 3개까지만 보이도록 잘라서 사용
  const visibleItems = hasPreview ? previewItems.slice(0, 3) : [];

  return (
    <section className="py-4">
      {/* 섹션 전체를 클릭 가능한 버튼으로 처리 */}
      <button type="button" onClick={onClick} className="w-full text-left">
        {/* 상단: 제목 + 우측 화살표 아이콘 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold bg-yellow-20 text-text-main">
            {title}
          </h2>
          <img src="/icons/arrow-right.svg" alt="" className="w-5 h-5" />
        </div>

        {/* 미리보기 영역: 데이터가 있을 때만 렌더링 */}
        {hasPreview && (
          <div className="grid grid-cols-3 gap-3">
            {visibleItems.map((item, idx) => {
              const src = item.thumbnailUrl;
              // item.type이 오면 우선 사용, 없으면 URL 기반으로 타입 추론
              const type = item.type || (src ? detectMediaType(src) : "image");

              return (
                <div
                  key={idx}
                  className="flex-1 aspect-square rounded-lg bg-gray-10 overflow-hidden"
                >
                  {/* src가 있는 경우에만 미디어 렌더 */}
                  {src &&
                    (type === "video" ? (
                      // 비디오 미리보기 (자동 재생은 하지 않고 썸네일처럼만 사용)
                      <video
                        src={src}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      // 이미지 미리보기
                      <img
                        src={src}
                        alt={item.alt || `${title} 미리보기`}
                        className="w-full h-full object-cover"
                      />
                    ))}
                </div>
              );
            })}
          </div>
        )}
      </button>
    </section>
  );
}

export default ArchiveSectionCard;
