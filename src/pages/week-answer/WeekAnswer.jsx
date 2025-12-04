import { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { shareFamilyInvite } from "@/utils/shareFamilyInvite";
import Header from "@/layouts/Header";
import BottomNav from "@/layouts/BottomNav";
import Button from "@/components/buttons/Button";
import VideoAnswerCard from "@/components/VideoAnswerCard";

// ==============================
// 1. 공통 상수/환경 변수 설정
// ==============================

// 백엔드 API 기본 URL
// - Vite 환경변수 VITE_API_BASE_URL이 있으면 그걸 사용
// - 없으면 로컬 개발용 "http://localhost:8080" 사용
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
// 로컬스토리지에 저장해둔 액세스 토큰 키 이름
const TOKEN_STORAGE_KEY = "accessToken";

// ==============================
// 2. 날짜/주차 관련 유틸 함수
// ==============================

// 주차 라벨 생성
// - 백엔드에서 question.createdAt, question.weekNumber를 내려준다는 가정
// - "2025년 11월 2주차" 같은 형식을 만들어줌
function createWeekLabel(question) {
  // createdAt이 없으면 현재 날짜 기준으로 생성
  const createdAt = question.createdAt
    ? new Date(question.createdAt)
    : new Date();
  const year = createdAt.getFullYear();
  const month = createdAt.getMonth() + 1; // JS의 month는 0부터 시작하므로 +1
  const weekNumber = question.weekNumber ?? ""; // weekNumber 없을 수도 있으니 안전하게 처리

  return `${year}년 ${month}월 ${weekNumber}주차`;
}

// "2025. 11. 30." 형식으로 날짜 라벨 만들기
// - createdAt(ISO 문자열)을 화면에 보여줄 포맷으로 변환
function formatDateLabel(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 두 자리로 맞추기
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}. ${month}. ${day}.`;
}

// 썸네일이 base64만 오는 경우와 data URL로 오는 경우 모두 대응
// - thumbnailUrl이 "data:image..."로 시작하면 그대로 사용
// - 아니면 "data:image/jpeg;base64,..."를 붙여서 브라우저에서 인식 가능한 data URL로 변경
function buildThumbnailSrc(thumbnailUrl) {
  if (!thumbnailUrl) return undefined;
  if (thumbnailUrl.startsWith("data:image")) return thumbnailUrl;
  return `data:image/jpeg;base64,${thumbnailUrl}`;
}

// ==============================
// 3. WeekAnswer 컴포넌트
// ==============================
function WeekAnswer() {
  const location = useLocation();
  const navigate = useNavigate();

  // 주차별 기록 페이지(WeeklyRecords)에서 넘어오는 경우
  //   navigate("/week-answer", { state: { readOnly: true, questionId: ... } });
  // 이런 형태로 올 수 있다고 가정
  // - readOnly: 과거 주차 조회 모드인지 여부
  const isReadOnly = location.state?.readOnly ?? false;

  // 이번 주(또는 선택한 주차) 질문 정보
  // - { id, label, question } 형태로 저장
  const [weekInfo, setWeekInfo] = useState(null);

  // 현재 주차에 대한 영상 답변 리스트
  const [answers, setAnswers] = useState([]);

  // 가족 프로필은 "가족 멤버 수 / 초대코드" 정도만 필요하면 그대로 둠
  const [familyProfile, setFamilyProfile] = useState(null);

  // 공통 로딩/에러 상태
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔊 TTS 재생 관련 상태/참조
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  // 실제 Audio 객체를 담아두는 ref
  // - 재렌더링과 상관없이 하나의 오디오 인스턴스를 유지하기 위함
  const ttsAudioRef = useRef(null);

  // 🔐 401/403 → 토큰 삭제 + 로그인 페이지로 이동
  const handleAuthError = (status) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem("isLoggedIn");
      window.location.href = "/login";
      return true; // 이미 처리했다는 의미
    }
    return false;
  };

  // 가족 구성원이 나 혼자뿐인지 여부
  // - familyProfile.members가 존재하고 length > 0이면 "나 말고 다른 가족 있음"
  const hasOtherMembers =
    !!familyProfile && (familyProfile.members?.length ?? 0) > 0;
  // 영상 답변이 하나라도 있는지 여부
  const hasAnswers = answers.length > 0;

  // ==============================
  // 3-1. 언마운트 시 오디오 정리
  // ==============================
  useEffect(() => {
    // 컴포넌트가 언마운트 될 때 실행되는 cleanup 함수
    return () => {
      if (ttsAudioRef.current) {
        // 재생 중지
        ttsAudioRef.current.pause();
        // 오디오 src가 blob URL인 경우 메모리 해제
        if (ttsAudioRef.current.src?.startsWith("blob:")) {
          URL.revokeObjectURL(ttsAudioRef.current.src);
        }
      }
    };
  }, []);

  // ==============================
  // 3-2. TTS 재생 핸들러
  // ==============================
  const handlePlayQuestionTTS = async () => {
    // 질문 ID 없거나 이미 로딩 중이면 중복 요청 방지
    if (!weekInfo?.id || isTtsLoading) return;

    try {
      setIsTtsLoading(true);

      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${API_BASE_URL}/question/tts/${weekInfo.id}`, {
        method: "GET",
        headers,
      });

      // 🔐 토큰 만료/권한 문제면 로그인으로 보내고 함수 종료
      if (handleAuthError(res.status)) {
        setIsTtsLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error("TTS 요청에 실패했습니다.");
      }

      // ✅ 항상 JSON: { format: "mp3", audio: "<base64>" }
      const data = await res.json();
      console.log("TTS 응답:", data);

      if (!data.audio) {
        throw new Error("TTS 오디오 데이터가 없습니다.");
      }

      const base64Audio = data.audio;

      // format 값에 따라 mime-type 설정 (기본은 mp3로 가정)
      const mimeType =
        data.format === "wav"
          ? "audio/wav"
          : data.format === "ogg"
          ? "audio/ogg"
          : "audio/mpeg"; // 기본 mp3

      // base64 문자열 → 바이너리로 디코딩
      const byteString = atob(base64Audio);
      const len = byteString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i += 1) {
        bytes[i] = byteString.charCodeAt(i);
      }

      const audioBlob = new Blob([bytes.buffer], { type: mimeType });
      const url = URL.createObjectURL(audioBlob);

      // 기존 오디오 정리
      if (!ttsAudioRef.current) {
        ttsAudioRef.current = new Audio();
      } else {
        ttsAudioRef.current.pause();
        if (ttsAudioRef.current.src?.startsWith("blob:")) {
          URL.revokeObjectURL(ttsAudioRef.current.src);
        }
      }

      ttsAudioRef.current.src = url;

      ttsAudioRef.current.onended = () => {
        setIsTtsLoading(false);
        if (ttsAudioRef.current.src?.startsWith("blob:")) {
          URL.revokeObjectURL(ttsAudioRef.current.src);
        }
      };

      await ttsAudioRef.current.play();
      setIsTtsLoading(false);
    } catch (e) {
      console.error("TTS 에러:", e);
      alert(e.message || "질문 음성을 재생할 수 없습니다.");
      setIsTtsLoading(false);
    }
  };

  // ==============================
  // 3-3. 한 번에 필요한 데이터 로딩
  // ==============================
  useEffect(() => {
    const fetchWeekAnswerData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        // 1) 현재 주차 질문 조회
        const questionRes = await fetch(`${API_BASE_URL}/question/current`, {
          method: "GET",
          headers,
        });

        // 🔐 401/403이면 로그인으로 이동
        if (handleAuthError(questionRes.status)) return;

        if (!questionRes.ok) {
          throw new Error("현재 질문을 불러오지 못했습니다.");
        }

        const questionJson = await questionRes.json();

        const mappedWeekInfo = {
          id: questionJson.id,
          label: createWeekLabel(questionJson),
          question: `Q. ${questionJson.title}`,
        };
        setWeekInfo(mappedWeekInfo);

        // 2) 영상 답변 목록 + (필요하면) 가족 프로필 병렬 요청
        //    - 여기서 더 이상 "프로필 이미지 매핑" 같은 복잡한 처리는 하지 않음
        const [answersRes, familyRes] = await Promise.all([
          fetch(`${API_BASE_URL}/video-answer?questionId=${questionJson.id}`, {
            method: "GET",
            headers,
          }),
          fetch(`${API_BASE_URL}/mypage/family-profile`, {
            method: "GET",
            headers,
          }),
        ]);

        // 🔐 둘 중 하나라도 401/403이면 로그인으로 이동
        if (handleAuthError(answersRes.status)) return;
        if (handleAuthError(familyRes.status)) return;

        if (!answersRes.ok) {
          throw new Error("영상 답변 목록을 불러오지 못했습니다.");
        }

        const answersJson = await answersRes.json();

        // 가족 프로필은 "초대 코드 / 멤버 수" 체크용으로만 사용
        if (familyRes.ok) {
          const familyJson = await familyRes.json();
          setFamilyProfile(familyJson);
        }

        // ✅ /video-answer 응답에서 바로 nickname, profileImageUrl 사용
        const mappedAnswers = (answersJson ?? []).map((item) => ({
          id: item.id,
          authorId: item.familyMemberId,
          authorName: item.nickname || "가족",
          isMine: !!item.owner,
          dateLabel: formatDateLabel(item.createdAt),
          title: item.title,
          description: item.summary,
          thumbnailUrl: buildThumbnailSrc(item.thumbnailUrl),
          // 🔥 API가 직접 내려주는 프로필 이미지 사용
          profileImageUrl: item.profileImageUrl ?? null,
        }));

        setAnswers(mappedAnswers);
      } catch (err) {
        console.error(err);
        setError(err.message || "알 수 없는 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    // 컴포넌트 마운트 시 한 번 실행
    fetchWeekAnswerData();
  }, []);

  // ==============================
  // 3-4. 날짜별 그룹핑: answersByDate
  // ==============================
  // { "2025. 11. 14.": [answer1, answer2...], ... } 형태로 변환
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

  // ==============================
  // 3-5. 각종 핸들러들
  // ==============================

  // 가족코드 공유하기(모임주만 있는 상태에서 가족 초대용)
  const handleShareFamilyCode = () => {
    if (!familyProfile) return;
    // utils의 shareFamilyInvite 함수 사용
    // - 보통 navigator.share 혹은 클립보드 복사 로직이 들어있을 것
    shareFamilyInvite(familyProfile.inviteCode);
  };

  const handleAnswer = () => {
    if (!weekInfo) {
      alert("질문 정보를 불러오는 중입니다. 잠시만 기다려 주세요.");
      return;
    }

    // "답변하기" 버튼 클릭 시
    // - 직접 촬영하는 페이지(/video-capture)로 이동
    navigate("/video-capture", {
      state: { questionId: weekInfo.id, questionTitle: weekInfo.question },
    });
  };

  // 헤더 왼쪽 필터 아이콘 클릭 시
  // - 주차별 기록 페이지로 이동
  const handleFilterClick = () => {
    navigate("/weekly-records");
  };

  // 영상 답변 카드 클릭 시 상세 페이지로 이동
  const handleOpenDetail = (answerId) => {
    navigate(`/answers/${answerId}`);
  };

  // ==============================
  // 3-6. 메인 콘텐츠 상태별 렌더링
  // ==============================
  let mainContent = null;

  if (isLoading) {
    // (1) 로딩 중
    mainContent = (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-gray-80">데이터를 불러오는 중입니다...</p>
      </div>
    );
  } else if (error) {
    // (2) 에러 발생
    mainContent = (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <p className="text-sm text-red-500 mb-2">
          영상 답변을 불러오지 못했어요.
        </p>
        <p className="text-xs text-gray-80">{error}</p>
      </div>
    );
  } else if (!hasOtherMembers) {
    // (3) 가족에 나(모임주)만 있고, 아직 다른 가족이 없는 상태
    mainContent = (
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
    );
  } else if (!hasAnswers) {
    // (4) 가족은 있는데, 해당 주차에 아직 아무도 답변을 안 남긴 상태
    mainContent = (
      <div className="flex-1 flex flex-col items-center justify-start text-center pt-[20vh]">
        <p className="text-lg font-semibold text-text-main">
          첫 번째 답변을 남겨보세요!
        </p>
      </div>
    );
  } else {
    // (5) 답변이 하나 이상 있는 상태
    mainContent = (
      <div className="flex-1 mt-6 space-y-8 overflow-y-auto pb-14">
        {Object.entries(answersByDate).map(([dateLabel, list]) => (
          <section key={dateLabel}>
            {/* 날짜 라벨 */}
            <p className="text-xs text-gray-80 mb-6 text-center">{dateLabel}</p>

            {/* 해당 날짜에 달린 답변 카드 리스트 */}
            <div className="space-y-8">
              {list.map((answer) => (
                <VideoAnswerCard
                  key={answer.id}
                  isMine={answer.isMine} // owner 기반으로 말풍선 정렬 방향 결정
                  title={answer.title}
                  description={answer.description}
                  thumbnailUrl={answer.thumbnailUrl}
                  authorName={answer.authorName} // nickname
                  profileImageUrl={answer.profileImageUrl}
                  onClick={() => handleOpenDetail(answer.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  // ==============================
  // 3-7. 실제 렌더링 구조
  // ==============================
  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      {/* 헤더 */}
      <Header
        variant="solid"
        title={weekInfo?.label ?? "이번 주 질문"}
        leftIcon={
          <img src="/icons/filter.svg" alt="주차 선택" className="w-6 h-6" />
        }
        onLeftClick={handleFilterClick}
        bgClassName="bg-yellow-20"
      />

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 flex flex-col px-6 pt-4 pb-24">
        {/* 질문 바 + TTS 버튼 */}
        <section>
          <button
            type="button"
            className="w-full flex items-center bg-yellow-main rounded-xl px-4 py-3"
            aria-label="이번 주 질문을 음성으로 듣기"
            onClick={handlePlayQuestionTTS}
          >
            {/* 오른쪽 스피커 아이콘 (배경/테두리 없음) */}
            <img src="/icons/speaker.svg" alt="" className="w-6 h-6 shrink-0" />
            {/* 질문 텍스트 */}
            <span className="flex-1 text-md font-semibold text-text-main text-center break-keep">
              {weekInfo?.question ?? "이번 주 질문을 불러오는 중입니다..."}
            </span>
          </button>
        </section>

        {/* 상태별 메인 콘텐츠 (가족 없음 / 답변 없음 / 답변 리스트 등) */}
        {mainContent}
      </main>

      {/* 현재 주차에서만 보이는 고정 버튼 (readonly 모드에서는 숨김) */}
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
