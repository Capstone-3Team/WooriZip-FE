import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import SearchInput from "@/components/SearchInput";
import WeeklyFilterToast from "@/components/WeeklyFilterToast";

// 임시 데이터 (테스트용)
const MOCK_QUESTIONS = [
  {
    id: 1,
    year: 2025,
    month: 1,
    week: 1,
    title: "우리 가족의 장점은 무엇인가요?",
  },
  { id: 2, year: 2025, month: 1, week: 2, title: "질문2" },
  { id: 3, year: 2025, month: 1, week: 3, title: "질문3" },
  { id: 4, year: 2025, month: 1, week: 4, title: "질문4" },
  { id: 5, year: 2025, month: 2, week: 1, title: "질문5" },
  { id: 6, year: 2025, month: 2, week: 2, title: "질문6" },
  { id: 7, year: 2025, month: 2, week: 3, title: "질문7" },
  { id: 8, year: 2024, month: 12, week: 4, title: "작년 질문1" },
];

export default function WeeklyRecords() {
  const navigate = useNavigate();

  // 1) 연도 목록 먼저 계산
  const years = useMemo(
    () =>
      Array.from(new Set(MOCK_QUESTIONS.map((q) => q.year))).sort(
        (a, b) => b - a
      ),
    []
  );

  // 2) 상태 정의
  // selectedYear === null 이면 "전체 연도" 모드
  const [selectedYear, setSelectedYear] = useState(years[0] ?? null);
  // 여러 개 월 선택, []면 "월 전체"
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 3) 필터링된 질문 목록
  const filteredQuestions = useMemo(() => {
    const trimmed = searchText.trim();

    return MOCK_QUESTIONS.filter((q) => {
      // 연도 필터
      if (selectedYear !== null && q.year !== selectedYear) return false;

      // 월 필터
      if (selectedMonths.length > 0 && !selectedMonths.includes(q.month)) {
        return false;
      }

      // 검색어 필터
      if (!trimmed) return true;
      return q.title.includes(trimmed);
    });
  }, [selectedYear, selectedMonths, searchText]);

  // 4) 드롭다운 레이블 (필터 결과 개수 기준)
  const dropdownLabel = useMemo(() => {
    const count = filteredQuestions.length;

    if (selectedYear === null) {
      return `전체 (${count})`;
    }
    return `${selectedYear}년 (${count})`;
  }, [filteredQuestions, selectedYear]);

  // 5) 월 선택 토글 / 리셋 핸들러들
  const handleToggleMonth = (month) => {
    setSelectedMonths((prev) => {
      if (prev.includes(month)) {
        return prev.filter((m) => m !== month);
      }
      return [...prev, month];
    });
  };

  const handleClearMonths = () => {
    setSelectedMonths([]);
  };

  const handleResetYearAndMonth = () => {
    // 토스터 왼쪽 상단 "전체보기" → 모든 연도/월 보기
    setSelectedYear(null);
    setSelectedMonths([]);
  };

  // 6) 기타 핸들러
  const handleSelectQuestion = (question) => {
    // 지난 주차: 읽기 전용 모드로 WeekAnswer로 이동
    navigate("/week-answer", {
      state: {
        readOnly: true,
        questionId: question.id,
      },
    });
  };

  const handleClose = () => {
    navigate("/week-answer");
  };

  const handleOpenFilter = () => {
    setIsFilterOpen(true);
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
  };

  return (
    <div className="flex min-h-full flex-col bg-bg-app">
      {/* 헤더 */}
      <Header
        variant="solid"
        title="주차별 기록"
        leftIcon={<img src="/icons/close.svg" alt="닫기" className="w-6 h-6" />}
        onLeftClick={handleClose}
      />

      <main className="relative flex-1 px-6 pt-4 pb-8">
        {/* 토스터 오버레이 */}
        {isFilterOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/20"
              onClick={handleCloseFilter}
            />
            <WeeklyFilterToast
              years={years}
              selectedYear={selectedYear}
              selectedMonths={selectedMonths}
              onSelectYear={setSelectedYear}
              onToggleMonth={handleToggleMonth}
              onResetYearAndMonth={handleResetYearAndMonth}
              onClearMonths={handleClearMonths}
              onClose={handleCloseFilter}
            />
          </>
        )}

        {/* 상단 연도 드롭다운 + 검색 */}
        <section className="mb-6">
          <button
            type="button"
            onClick={handleOpenFilter}
            className="inline-flex items-center gap-1 text-md font-semibold text-text-main"
          >
            <span>{dropdownLabel}</span>
            <span className="text-sm text-text-main">▼</span>
          </button>

          <div className="mt-3">
            <SearchInput
              name="weeklySearch"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="주차별 질문을 검색해보세요"
            />
          </div>
        </section>

        {/* 리스트 */}
        <section className="space-y-6 pb-4">
          {years
            .filter((y) => selectedYear === null || y === selectedYear)
            .map((year) => {
              const questionsOfYear = filteredQuestions.filter(
                (q) => q.year === year
              );
              if (questionsOfYear.length === 0) return null;

              // 월별 그룹
              const monthsInYear = Array.from(
                new Set(questionsOfYear.map((q) => q.month))
              ).sort((a, b) => a - b);

              return (
                <div key={year} className="space-y-6">
                  {monthsInYear.map((month) => {
                    const questionsOfMonth = questionsOfYear.filter(
                      (q) => q.month === month
                    );

                    return (
                      <div key={`${year}-${month}`} className="space-y-3">
                        <h3 className="text-md font-semibold text-text-main">
                          {year}년 {month}월
                        </h3>
                        <div className="space-y-3">
                          {questionsOfMonth.map((question) => (
                            <button
                              key={question.id}
                              type="button"
                              onClick={() => handleSelectQuestion(question)}
                              className="flex w-full items-center justify-between rounded-xl bg-yellow-main px-5 py-4 text-left text-sm font-medium text-text-main shadow-[0_2px_4px_rgba(0,0,0,0.08)]"
                            >
                              <span className="truncate">{question.title}</span>
                              <img
                                src="/icons/arrow-right.svg"
                                alt="상세 보기"
                                className="w-5 h-5"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
        </section>
      </main>
    </div>
  );
}
