import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import SearchInput from "@/components/SearchInput";
import WeeklyFilterToast from "@/components/WeeklyFilterToast";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const TOKEN_STORAGE_KEY = "accessToken"; // 로그인 시 저장한 키에 맞게

export default function WeeklyRecords() {
  const navigate = useNavigate();

  // 서버에서 가져온 질문 목록 (지난 주차들만)
  const [questions, setQuestions] = useState([]);

  // 필터 상태
  const [selectedYear, setSelectedYear] = useState(null); // null = 전체 연도
  const [selectedMonths, setSelectedMonths] = useState([]); // [] = 전체 월
  const [searchText, setSearchText] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 디버그용 상태 표시
  const [currentWeekNumber, setCurrentWeekNumber] = useState(null);

  // ✅ 최초 로딩: 전체 질문 + 현재 주차 질문
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [listRes, currentRes] = await Promise.all([
          fetch(`${API_BASE_URL}/question/list`, { method: "GET", headers }),
          fetch(`${API_BASE_URL}/question/current`, { method: "GET", headers }),
        ]);

        if (!listRes.ok) {
          throw new Error("질문 목록을 불러오지 못했습니다.");
        }

        const listJson = await listRes.json();

        let currentWeekNumber = null;
        if (currentRes.ok) {
          const currentJson = await currentRes.json();
          currentWeekNumber = currentJson?.weekNumber ?? null;
          setCurrentWeekNumber(currentWeekNumber); // ✅ 상태로도 저장
        }

        // 🟡 weekNumber 기준으로 “지난 주차”만 남기기
        const filteredByWeek = (listJson ?? []).filter((q) => {
          if (currentWeekNumber == null) return true; // 현재 주차 정보 없으면 전부
          return q.weekNumber < currentWeekNumber;
        });

        // createdAt에서 연/월만 뽑고,
        // 주차 번호는 DB의 weekNumber 그대로 사용
        const mapped = filteredByWeek.map((q) => {
          const createdAt = q.createdAt ? new Date(q.createdAt) : new Date();
          const year = createdAt.getFullYear();
          const month = createdAt.getMonth() + 1;

          return {
            id: q.id,
            year,
            month,
            week: q.weekNumber, // 👈 요게 1주차, 2주차, 3주차...
            title: q.title,
          };
        });

        // 🔍 디버그 로그
        console.log("=== WeeklyRecords 디버그 ===");
        console.log("currentWeekNumber:", currentWeekNumber);
        console.table(
          (listJson ?? []).map((q) => ({
            id: q.id,
            title: q.title,
            weekNumber: q.weekNumber,
          }))
        );
        console.table(mapped); // 필터 후 실제 화면에 쓰이는 값

        setQuestions(mapped);
      } catch (err) {
        console.error(err);
        setError(err.message || "알 수 없는 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // 연도 목록 (내림차순)
  const years = useMemo(
    () =>
      Array.from(new Set(questions.map((q) => q.year))).sort((a, b) => b - a),
    [questions]
  );

  // 연도 기본값: 가장 최근 연도
  useEffect(() => {
    if (years.length > 0 && selectedYear === null) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  // 필터/검색 적용한 질문 목록
  const filteredQuestions = useMemo(() => {
    const trimmed = searchText.trim();

    return questions.filter((q) => {
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
  }, [questions, selectedYear, selectedMonths, searchText]);

  // 드롭다운 레이블
  const dropdownLabel = useMemo(() => {
    const count = filteredQuestions.length;

    if (selectedYear === null) {
      return `전체 (${count})`;
    }
    return `${selectedYear}년 (${count})`;
  }, [filteredQuestions, selectedYear]);

  const handleToggleMonth = (month) => {
    setSelectedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  };

  const handleClearMonths = () => {
    setSelectedMonths([]);
  };

  const handleResetYearAndMonth = () => {
    setSelectedYear(null);
    setSelectedMonths([]);
  };

  // 지난 주차 질문 선택 → WeekAnswer 읽기 전용 모드로
  const handleSelectQuestion = (question) => {
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

  const handleOpenFilter = () => setIsFilterOpen(true);
  const handleCloseFilter = () => setIsFilterOpen(false);

  return (
    <div className="flex min-h-full flex-col bg-bg-app">
      <Header
        variant="solid"
        title="주차별 기록"
        leftIcon={<img src="/icons/close.svg" alt="닫기" className="w-6 h-6" />}
        onLeftClick={handleClose}
      />

      <main className="relative flex-1 px-6 pt-4 pb-8">
        {/* 필터 토스트 */}
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

          {/* 🔍 dev용 현재 주차 표시 (원하면 나중에 지워도 됨) */}
          {import.meta.env.DEV && (
            <p className="mt-1 text-[11px] text-gray-60">
              현재 주차: {currentWeekNumber ?? "?"} / 질문 {questions.length}개
            </p>
          )}

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
        {isLoading ? (
          <div className="mt-10 text-center text-sm text-gray-80">
            질문을 불러오는 중입니다...
          </div>
        ) : error ? (
          <div className="mt-10 text-center text-sm text-red-500">{error}</div>
        ) : (
          <section className="space-y-6 pb-4">
            {years
              .filter((y) => selectedYear === null || y === selectedYear)
              .map((year) => {
                const questionsOfYear = filteredQuestions.filter(
                  (q) => q.year === year
                );
                if (questionsOfYear.length === 0) return null;

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
                                <span className="truncate">
                                  {/* 필요하면 `${question.week}주차` 를 앞에 붙여도 됨 */}
                                  {question.title}
                                </span>
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
        )}
      </main>
    </div>
  );
}
