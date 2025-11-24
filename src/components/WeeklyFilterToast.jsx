import React from "react";

function WeeklyFilterToast({
  years,
  selectedYear,
  selectedMonths, // ✅ 여러 달 선택
  onSelectYear,
  onToggleMonth, // ✅ 월 토글
  onResetYearAndMonth, // 상단 전체보기
  onClearMonths, // 월 전체보기 (월 쪽)
  onClose,
}) {
  const isAllMonthsSelected = !selectedMonths || selectedMonths.length === 0;

  return (
    <div className="fixed left-1/2 top-16 z-40 w-[80%] max-w-sm -translate-x-1/2 rounded-lg bg-white shadow-lg border border-gray-40">
      {/* 상단 액션 */}
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <button
          type="button"
          onClick={onResetYearAndMonth}
          className="text-accent font-medium"
        >
          전체보기
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-accent font-medium"
        >
          완료
        </button>
      </div>

      <div className="border-t border-gray-20" />

      {/* 레이블 */}
      <div className="flex px-4 py-2 text-xs text-gray-80">
        <span className="flex-1">연도</span>
        <span className="flex-1 text-right">월</span>
      </div>

      {/* 연도 / 월 목록 */}
      <div className="flex px-4 pb-4 gap-4">
        {/* 연도 리스트 (이미 records가 있는 연도만 props로 들어옴) */}
        <div className="flex-1 space-y-1">
          {years.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => onSelectYear(year)}
              className={`w-full text-left px-2 py-1 rounded text-sm ${
                year === selectedYear
                  ? "bg-yellow-40 font-semibold text-text-main"
                  : "text-gray-80"
              }`}
            >
              {year}년
            </button>
          ))}
        </div>

        {/* 월 리스트 + 전체보기 */}
        <div className="flex-1 space-y-1 text-right">
          {/* ✅ 월 전체보기 */}
          <button
            type="button"
            onClick={onClearMonths}
            className={`w-full px-2 py-1 rounded text-sm ${
              isAllMonthsSelected
                ? "bg-yellow-40 font-semibold text-text-main"
                : "text-gray-80"
            }`}
          >
            전체보기
          </button>

          {/* 개별 월 (여러 개 선택 가능 / 토글) */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
            const isSelected = selectedMonths?.includes(month);
            return (
              <button
                key={month}
                type="button"
                onClick={() => onToggleMonth(month)}
                className={`w-full px-2 py-1 rounded text-sm ${
                  isSelected
                    ? "bg-yellow-40 font-semibold text-text-main"
                    : "text-gray-80"
                }`}
              >
                {month}월
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WeeklyFilterToast;
