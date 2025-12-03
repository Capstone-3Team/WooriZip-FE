import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import SearchInput from "@/components/SearchInput";
import WeeklyFilterToast from "@/components/WeeklyFilterToast";

// ==============================
// 1. 공통 상수
// ==============================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const TOKEN_STORAGE_KEY = "accessToken"; // 로그인 시 저장한 키에 맞게

export default function WeeklyRecords() {
  const navigate = useNavigate();

  // ==============================
  // 2. 상태 정의
  // ==============================

  // 서버에서 가져온 "지난 주차 질문 목록"
  // - 원본 /question/list 응답에서 weekNumber < currentWeekNumber 만 필터링해서 넣음
  const [questions, setQuestions] = useState([]);

  // 필터 상태
  const [selectedYear, setSelectedYear] = useState(null); // null = 전체 연도
  const [selectedMonths, setSelectedMonths] = useState([]); // [] = 전체 월
  const [searchText, setSearchText] = useState(""); // 검색어
  const [isFilterOpen, setIsFilterOpen] = useState(false); // 상단 필터 토스트 열림 여부

  // 로딩 / 에러 상태
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 디버그용 상태 표시 : 현재 주차 번호
  const [currentWeekNumber, setCurrentWeekNumber] = useState(null);

  // ==============================
  // 3. 초기 로딩: 질문 목록 + 현재 주차 정보 가져오기
  // ==============================
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 토큰이 있으면 Authorization 헤더에 추가
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1) 전체 질문 목록
        // 2) 현재 주차 질문
        // 을 병렬로 요청
        const [listRes, currentRes] = await Promise.all([
          fetch(`${API_BASE_URL}/question/list`, { method: "GET", headers }),
          fetch(`${API_BASE_URL}/question/current`, { method: "GET", headers }),
        ]);

        if (!listRes.ok) {
          throw new Error("질문 목록을 불러오지 못했습니다.");
        }

        const listJson = await listRes.json();

        // 현재 주차 번호 가져오기 (없으면 null 유지)
        let currentWeekNumber = null;
        if (currentRes.ok) {
          const currentJson = await currentRes.json();
          currentWeekNumber = currentJson?.weekNumber ?? null;
          setCurrentWeekNumber(currentWeekNumber); // ✅ 상태로도 저장
        }

        // 현재 주차 기준으로 “지난 주차”만 남기기
        // - ex) currentWeekNumber = 4이면 weekNumber < 4 인 질문만
        // - currentWeekNumber가 null이면 전체 주차를 다 보여줌
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
            week: q.weekNumber, // 1주차, 2주차 ... (필요하면 UI에서 사용할 수 있음)
            title: q.title,
          };
        });

        // 디버깅: 콘솔에 현재 주차 + 원본/매핑 데이터 찍기
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

  // ==============================
  // 4. 연도 목록 계산 및 기본 연도 설정
  // ==============================

  // 질문 목록에서 연도만 뽑아서, 중복 제거 + 내림차순 정렬
  const years = useMemo(
    () =>
      Array.from(new Set(questions.map((q) => q.year))).sort((a, b) => b - a),
    [questions]
  );

  // 연도 선택이 아직 없고, years가 채워진 경우
  // → 자동으로 가장 최근 연도를 기본값으로 선택
  useEffect(() => {
    if (years.length > 0 && selectedYear === null) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  // ==============================
  // 5. 필터 + 검색 적용된 질문 목록 계산
  // ==============================
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
      // 제목에 검색어가 포함되어 있으면 통과
      return q.title.includes(trimmed);
    });
  }, [questions, selectedYear, selectedMonths, searchText]);

  // 상단 드롭다운에 보여줄 레이블 텍스트
  const dropdownLabel = useMemo(() => {
    const count = filteredQuestions.length;

    if (selectedYear === null) {
      return `전체 (${count})`;
    }
    return `${selectedYear}년 (${count})`;
  }, [filteredQuestions, selectedYear]);

  // ==============================
  // 6. 필터/검색 관련 핸들러
  // ==============================

  // 특정 월 선택/해제 토글
  const handleToggleMonth = (month) => {
    setSelectedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  };

  // 선택한 월 전체 초기화
  const handleClearMonths = () => {
    setSelectedMonths([]);
  };

  // 연도/월 필터 전체 초기화
  const handleResetYearAndMonth = () => {
    setSelectedYear(null);
    setSelectedMonths([]);
  };

  // 지난 주차 질문 선택 → WeekAnswer 읽기 전용 모드로
  const handleSelectQuestion = (question) => {
    navigate("/week-answer", {
      state: {
        readOnly: true, // 지난 주차는 수정/답변 불가
        questionId: question.id,
      },
    });
  };

  // 상단 닫기 버튼 → 현재 주차 답변 페이지로 돌아가기
  const handleClose = () => {
    navigate("/week-answer");
  };

  // 필터 토스트 열기/닫기
  const handleOpenFilter = () => setIsFilterOpen(true);
  const handleCloseFilter = () => setIsFilterOpen(false);

  // ==============================
  // 7. 렌더링
  // ==============================

  return (
    <div className="flex min-h-full flex-col bg-bg-app">
      <Header
        variant="solid"
        title="주차별 기록"
        leftIcon={<img src="/icons/close.svg" alt="닫기" className="w-6 h-6" />}
        onLeftClick={handleClose}
      />

      <main className="relative flex-1 px-6 pt-4 pb-8">
        {/* 필터 토스트 (연도/월 선택) */}
        {isFilterOpen && (
          <>
            {/* 뒷배경 반투명 레이어: 클릭 시 토스트 닫기 */}
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
          {/* 연도/개수 드롭다운 버튼 */}
          <button
            type="button"
            onClick={handleOpenFilter}
            className="inline-flex items-center gap-1 text-md font-semibold text-text-main"
          >
            <span>{dropdownLabel}</span>
            <span className="text-sm text-text-main">▼</span>
          </button>

          {/* 개발 환경에서만 현재 주차/총 질문 수 표시 (디버깅용) */}
          {import.meta.env.DEV && (
            <p className="mt-1 text-[11px] text-gray-60">
              현재 주차: {currentWeekNumber ?? "?"} / 질문 {questions.length}개
            </p>
          )}

          {/* 검색 입력 */}
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
          // 데이터 표시
          <section className="space-y-6 pb-4">
            {years
              // 선택된 연도 필터 적용 (selectedYear=null이면 전체)
              .filter((y) => selectedYear === null || y === selectedYear)
              .map((year) => {
                // 해당 연도에 속한 질문들
                const questionsOfYear = filteredQuestions.filter(
                  (q) => q.year === year
                );
                if (questionsOfYear.length === 0) return null;

                // 그 연도에서 사용된 월 목록 (오름차순 정렬)
                const monthsInYear = Array.from(
                  new Set(questionsOfYear.map((q) => q.month))
                ).sort((a, b) => a - b);

                return (
                  <div key={year} className="space-y-6">
                    {monthsInYear.map((month) => {
                      // 해당 연도 + 해당 월에 속한 질문들
                      const questionsOfMonth = questionsOfYear.filter(
                        (q) => q.month === month
                      );

                      return (
                        <div key={`${year}-${month}`} className="space-y-3">
                          {/* 연/월 헤더 */}
                          <h3 className="text-md font-semibold text-text-main">
                            {year}년 {month}월
                          </h3>

                          {/* 질문 카드 리스트 */}
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
