function ArchiveSectionCard({ title, previewItems = [], onClick = () => {} }) {
  const hasPreview = previewItems.length > 0;
  const visibleItems = hasPreview ? previewItems.slice(0, 3) : [];

  return (
    <section className="py-4">
      <button type="button" onClick={onClick} className="w-full text-left">
        {/* 제목 + 화살표 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-main">{title}</h2>
          <img src="/icons/arrow-right.svg" alt="" className="w-5 h-5" />
        </div>

        {/* 미리보기: 있을 때만 */}
        {hasPreview && (
          <div className="grid grid-cols-3 gap-3">
            {visibleItems.map((item, idx) => (
              <div
                key={idx}
                className="flex-1 aspect-square rounded-lg bg-gray-10 overflow-hidden"
              >
                {item.thumbnailUrl && (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.alt || `${title} 미리보기`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </button>
    </section>
  );
}

export default ArchiveSectionCard;
