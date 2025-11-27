import { useMemo, useState } from "react";

function parseISO(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toISO(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DateRangeCalendar({ startDate, endDate, onChange }) {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  const initialView = start || end || new Date();
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth()); // 0~11

  const monthLabel = useMemo(() => {
    const mm = `${viewMonth + 1}`.padStart(2, "0");
    return `${viewYear}.${mm}`;
  }, [viewYear, viewMonth]);

  // 달력에 뿌릴 날짜 데이터 (null = 앞쪽 비어 있는 칸)
  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const firstWeekday = first.getDay(); // 0(일) ~ 6(토)
    const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();

    const arr = [];
    for (let i = 0; i < firstWeekday; i += 1) arr.push(null);
    for (let d = 1; d <= lastDay; d += 1) {
      arr.push(new Date(viewYear, viewMonth, d));
    }
    return arr;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const handleNextMonth = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const handleClickDay = (date) => {
    // 시작일이 없거나 이미 범위가 잡혀 있으면 → 새로 시작
    if (!start || (start && end)) {
      onChange({
        startDate: toISO(date),
        endDate: null,
      });
      return;
    }

    // 두 번째 클릭: 시작일보다 전이면 다시 시작, 이후면 범위
    if (date.getTime() <= start.getTime()) {
      onChange({
        startDate: toISO(date),
        endDate: null,
      });
    } else {
      onChange({
        startDate: toISO(start),
        endDate: toISO(date),
      });
    }
  };

  return (
    <div className="w-72 rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] p-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3 text-sm">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="px-1 text-gray-40"
        >
          ‹
        </button>
        <span className="font-semibold text-text-main">{monthLabel}</span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="px-1 text-gray-40"
        >
          ›
        </button>
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7 text-[11px] text-gray-40 mb-1">
        {["일", "월", "화", "수", "목", "금", "토"].map((w) => (
          <div
            key={w}
            className="h-7 flex items-center justify-center text-center"
          >
            {w}
          </div>
        ))}
      </div>

      {/* 날짜 */}
      <div className="grid grid-cols-7 text-xs">
        {days.map((date, idx) => {
          if (!date) {
            // 앞쪽 비어 있는 칸
            return <div key={idx} className="h-9" />;
          }

          const time = date.getTime();
          const hasRange = start && end && start.getTime() !== end.getTime();

          // 시작~끝 사이에 포함되면 모두 범위
          const inRange =
            hasRange && time >= start.getTime() && time <= end.getTime();

          const isStart = isSameDay(date, start);
          const isEnd = isSameDay(date, end);
          const isSelected = isStart || isEnd;

          // 같은 행(row) 기준으로 양끝 둥글게 만들기
          const row = Math.floor(idx / 7);
          const prevIdx = idx - 1;
          const nextIdx = idx + 1;

          const prevSameRow = prevIdx >= 0 && Math.floor(prevIdx / 7) === row;
          const nextSameRow =
            nextIdx < days.length && Math.floor(nextIdx / 7) === row;

          const prevDate = prevSameRow ? days[prevIdx] : null;
          const nextDate = nextSameRow ? days[nextIdx] : null;

          const prevInRange =
            prevDate &&
            hasRange &&
            prevDate.getTime() >= start.getTime() &&
            prevDate.getTime() <= end.getTime();

          const nextInRange =
            nextDate &&
            hasRange &&
            nextDate.getTime() >= start.getTime() &&
            nextDate.getTime() <= end.getTime();

          let rangeRadius = "";
          if (inRange) {
            const isSingle = !prevInRange && !nextInRange;
            if (isSingle) {
              rangeRadius = "rounded-full";
            } else {
              if (!prevInRange) rangeRadius += " rounded-l-full";
              if (!nextInRange) rangeRadius += " rounded-r-full";
            }
          }

          return (
            <div
              key={idx}
              className="h-9 flex items-center justify-center relative"
            >
              {/* 연한 노랑 바 (원 높이와 같게, 중간은 끊기지 않게) */}
              {inRange && (
                <div
                  className={`absolute inset-x-0 mx-auto h-7 bg-yellow-20 ${rangeRadius}`}
                />
              )}

              {/* 날짜 동그라미 */}
              <button
                type="button"
                onClick={() => handleClickDay(date)}
                className={[
                  "relative z-10 w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                  isSelected
                    ? "bg-yellow-main text-text-main"
                    : "text-text-main hover:bg-yellow-20",
                ].join(" ")}
              >
                {date.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
