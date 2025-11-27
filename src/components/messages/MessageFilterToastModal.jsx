import { useState } from "react";
import DateRangeCalendar from "@/components/messages/DateRangeCalendar";

function formatDateLabel(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1)
    .toString()
    .padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export default function MessageFilterToastModal({
  isOpen,
  onClose,
  filter,
  onChangeFilter,
}) {
  const { periodType, startDate, endDate, sortOrder } = filter;
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  if (!isOpen) return null;

  const handleSelectPeriod = (type) => {
    onChangeFilter((prev) => ({
      ...prev,
      periodType: type,
    }));

    if (type === "custom") {
      setIsCalendarOpen(true);
    } else {
      setIsCalendarOpen(false);
    }
  };

  const handleSelectSort = (order) => {
    onChangeFilter((prev) => ({
      ...prev,
      sortOrder: order,
    }));
  };

  const handleRangeChange = ({ startDate: s, endDate: e }) => {
    onChangeFilter((prev) => ({
      ...prev,
      periodType: "custom",
      startDate: s,
      endDate: e,
    }));
  };

  const renderPeriodButton = (type, label) => {
    const isActive = periodType === type;
    const activeClass = "bg-yellow-main text-text-main";
    const inactiveClass = "bg-yellow-20 text-text-main";

    return (
      <button
        type="button"
        onClick={() => handleSelectPeriod(type)}
        className={`flex-1 h-10 rounded-md text-sm font-medium ${
          isActive ? activeClass : inactiveClass
        }`}
      >
        {label}
      </button>
    );
  };

  const renderSortButton = (order, label) => {
    const isActive = sortOrder === order;
    const activeClass = "bg-yellow-main text-text-main";
    const inactiveClass = "bg-yellow-20 text-text-main";

    return (
      <button
        type="button"
        onClick={() => handleSelectSort(order)}
        className={`flex-1 h-10 rounded-md text-sm font-medium ${
          isActive ? activeClass : inactiveClass
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      {/* 어두운 배경 */}
      <button
        type="button"
        aria-label="필터 닫기"
        className="absolute inset-0 bg-black/50"
        onClick={() => {
          setIsCalendarOpen(false);
          onClose();
        }}
      />

      {/* 토스트 모달 */}
      <div className="relative w-full max-w-md rounded-t-3xl bg-bg-app px-6 pt-4 pb-8">
        {/* 상단 핸들바 */}
        <div className="flex justify-center mb-4">
          <div className="h-2 w-12 rounded-full bg-text-main" />
        </div>

        {/* 조회 기간 */}
        <section>
          <h2 className="text-lg font-semibold text-text-main mb-4">
            조회 기간
          </h2>

          <div className="flex gap-2">
            {renderPeriodButton("3months", "3개월")}
            {renderPeriodButton("1month", "1개월")}
            {renderPeriodButton("custom", "직접설정")}
          </div>

          {/* 직접설정일 때만 날짜/캘린더 노출 */}
          {periodType === "custom" && (
            <>
              {/* 날짜 텍스트 행 */}
              <button
                type="button"
                onClick={() => setIsCalendarOpen((prev) => !prev)}
                className="mt-4 w-full rounded-md bg-yellow-20 px-3 py-2 flex items-center justify-between text-sm text-text-main"
              >
                <span className="flex items-center gap-2">
                  <img
                    src="/icons/calendar.svg"
                    alt="기간 선택"
                    className="w-4 h-4"
                  />
                  <span>
                    {startDate
                      ? `${formatDateLabel(startDate)}`
                      : "시작일 선택"}
                    {"  ~  "}
                    {endDate ? `${formatDateLabel(endDate)}` : "종료일 선택"}
                  </span>
                </span>

                <span className="text-xs text-gray-60">변경</span>
              </button>

              {/* 날짜 텍스트 바로 아래에 뜨는 캘린더 */}
              {isCalendarOpen && (
                <div className="mt-2 flex justify-center">
                  <DateRangeCalendar
                    startDate={startDate}
                    endDate={endDate}
                    onChange={handleRangeChange}
                  />
                </div>
              )}
            </>
          )}
        </section>

        {/* 정렬 */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold text-text-main mb-4">정렬</h2>
          <div className="flex gap-2">
            {renderSortButton("latest", "최신순")}
            {renderSortButton("oldest", "과거순")}
          </div>
        </section>
      </div>
    </div>
  );
}
