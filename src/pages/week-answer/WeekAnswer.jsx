import { useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { shareFamilyInvite } from "@/utils/shareFamilyInvite";
import Header from "@/layouts/Header";
import BottomNav from "@/layouts/BottomNav";
import Button from "@/components/buttons/Button";
import TTSButton from "@/components/buttons/TTSButton";
import VideoAnswerCard from "@/components/VideoAnswerCard";

// === 테스트용 더미 데이터 ===
const MOCK_WEEK_INFO = {
  label: "2025년 11월 1주차",
  question: "Q. 우리 가족의 장점은 무엇인가요?",
};

// TODO: 실제 로그인 유저의 가족코드를 전역 상태(예: store)에서 읽어오도록 교체
const MOCK_FAMILY_CODE = "12345678";

// 현재 로그인한 유저 id (나중에 실제 로그인 정보로 교체)
const CURRENT_USER_ID = "me";

// 가족 멤버 (모임주 포함)
// - state 1 테스트: members.length === 1 (모임주만)
// - state 2/3 테스트: 2명 이상
const MOCK_MEMBERS = [
  { id: "me", name: "나동생", isOwner: true },
  { id: "mom", name: "엄마", isOwner: false },
];

// 답변 리스트
// - state 2 테스트: 배열을 []로 두면 됨
// - state 3 테스트: 한 개 이상 넣기
const MOCK_ANSWERS = [
  {
    id: 1,
    authorId: "mom",
    authorName: "나동생",
    dateLabel: "2025. 11. 14.",
    title: "유쾌한 우리집",
    description: "상세내용입니다. 상세내용입니다. 상세내용입니다.",
    thumbnailUrl: "",
  },
  // 내가 올린 답변 예시
  {
    id: 2,
    authorId: "me",
    authorName: "나",
    dateLabel: "2025. 11. 15.",
    title: "우리집 최고",
    description: "두 번째 답변입니다.",
    thumbnailUrl: "",
  },
];

function WeekAnswer() {
  const location = useLocation();
  const navigate = useNavigate();

  // 숨겨진 비디오 input
  const videoInputRef = useRef(null);

  // 주차별 기록에서 넘어오면 { readOnly: true, questionId: ... } 형태로 온다고 가정
  const isReadOnly = location.state?.readOnly ?? false;

  const hasOtherMembers = MOCK_MEMBERS.length > 1;
  const answers = MOCK_ANSWERS;

  // 날짜별로 그룹핑: { "2025. 11. 14.": [answers...] }
  const answersByDate = useMemo(() => {
    const grouped = {};
    for (const answer of answers) {
      if (!grouped[answer.dateLabel]) {
        grouped[answer.dateLabel] = [];
      }
      grouped[answer.dateLabel].push(answer);
    }
    return grouped;
  }, [answers]);

  const hasAnswers = answers.length > 0;

  const handleShareFamilyCode = async () => {
    // TODO: MOCK_FAMILY_CODE 대신 실제 로그인 상태의 familyCode로 교체
    shareFamilyInvite(MOCK_FAMILY_CODE);
  };

  // 답변하기 버튼 → 숨겨진 비디오 input 클릭
  const handleAnswer = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  // 사용자가 영상을 찍거나 선택했을 때
  const handleVideoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 1) 로딩 화면으로 이동하면서 파일만 먼저 넘겨주기
    navigate("/answers/new/loading", { state: { videoFile: file } });

    // TODO:
    // - 업로드/답변 작성 페이지로 이동하면서 file을 넘기거나
    // - 전역 상태(예: Zustand, Context)에 저장해두고 상세 작성 페이지에서 읽어오기
    //
    // 예시 (state로 넘기는 패턴):
    // navigate("/answers/new", { state: { videoFile: file } });
  };

  const handleFilterClick = () => {
    // 주차별 기록 페이지로 이동
    navigate("/weekly-records");
  };

  const handleOpenDetail = (answerId) => {
    navigate(`/answers/${answerId}`);
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      {/* 숨겨진 비디오 input (카메라/카메라롤 진입용) */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        capture="environment" // 후면 카메라 우선 (기기마다 다를 수 있음)
        className="hidden"
        onChange={handleVideoChange}
      />

      {/* 헤더: 필터 아이콘 + 주차 텍스트 */}
      <Header
        variant="solid"
        title={MOCK_WEEK_INFO.label}
        leftIcon={
          <img src="/icons/filter.svg" alt="주차 선택" className="w-6 h-6" />
        }
        onLeftClick={handleFilterClick}
      />

      <main className="flex-1 flex flex-col px-6 pt-2 pb-24">
        {/* 질문 바 + TTS 버튼 */}
        <section>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-yellow-40 rounded-xl px-4 py-3 flex items-center justify-center">
              <span className="text-md font-semibold text-text-main text-center wrap-break-word">
                {MOCK_WEEK_INFO.question}
              </span>
            </div>
            <TTSButton ariaLabel="질문 읽어주기" />
          </div>
        </section>

        {/* 메인 콘텐츠 영역 */}
        {!hasOtherMembers ? (
          // === 상태 1: 가족에 모임주 말고 아무도 없을 때 ===
          <div className="flex-1 flex flex-col items-center justify-start text-center pt-[20vh]">
            <p className="text-lg font-semibold text-text-main mb-2">
              아직 가족이 초대되지 않았어요!
            </p>
            <button
              type="button"
              onClick={handleShareFamilyCode}
              className="text-md text-accent underline"
            >
              가족코드 공유하기
            </button>
          </div>
        ) : !hasAnswers ? (
          // === 상태 2: 가족은 있는데, 해당 주차 답변이 하나도 없을 때 ===
          <div className="flex-1 flex flex-col items-center justify-start text-center pt-[20vh]">
            <p className="text-lg font-semibold text-text-main">
              첫 번째 답변을 남겨보세요!
            </p>
          </div>
        ) : (
          // === 상태 3: 답변이 하나 이상 있을 때 ===
          <div className="flex-1 mt-6 space-y-8 overflow-y-auto pb-14">
            {Object.entries(answersByDate).map(([dateLabel, list]) => (
              <section key={dateLabel}>
                <p className="text-xs text-gray-80 mb-6 text-center">
                  {dateLabel}
                </p>
                <div className="space-y-8">
                  {list.map((answer) => (
                    <VideoAnswerCard
                      key={answer.id}
                      isMine={answer.authorId === CURRENT_USER_ID}
                      title={answer.title}
                      description={answer.description}
                      thumbnailUrl={answer.thumbnailUrl}
                      authorName={answer.authorName}
                      onClick={() => handleOpenDetail(answer.id)} // 상세 페이지로
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* 현재 주차에서만 보이는 고정 버튼 */}
      {!isReadOnly && (
        <div className="fixed left-0 right-0 bottom-23 px-6 z-20">
          <Button
            size="large"
            variant="primary"
            type="button"
            onClick={handleAnswer}
          >
            답변하기
          </Button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default WeekAnswer;
