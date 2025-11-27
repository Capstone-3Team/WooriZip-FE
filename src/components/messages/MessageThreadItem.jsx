function MessageThreadItem({ name, dateLabel, onClick, isUnread }) {
  return (
    <div className="mb-1 bg-bg-app">
      <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-4 ${
          isUnread ? "bg-yellow-main" : "bg-yellow-20"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* 프로필 아이콘 (플레이스홀더) */}
          <div className="w-12 h-12 rounded-full bg-gray-10 flex items-center justify-center">
            <img
              src="/icons/user.svg"
              alt={`${name} 프로필`}
              className="w-10 h-10"
            />
          </div>

          <div className="flex flex-col items-start">
            <span className="text-base font-semibold text-text-main">
              {name}
            </span>
            <span className="text-xs text-gray-60">{dateLabel}</span>
          </div>
        </div>

        {/* 오른쪽 화살표 아이콘 */}
        <img
          src="/icons/arrow-right.svg"
          alt="쪽지함 상세 보기"
          className="w-6 h-6"
        />
      </button>
    </div>
  );
}

export default MessageThreadItem;
