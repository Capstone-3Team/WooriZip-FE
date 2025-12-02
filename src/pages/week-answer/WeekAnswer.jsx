import { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { shareFamilyInvite } from "@/utils/shareFamilyInvite";
import Header from "@/layouts/Header";
import BottomNav from "@/layouts/BottomNav";
import Button from "@/components/buttons/Button";
import VideoAnswerCard from "@/components/VideoAnswerCard";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const TOKEN_STORAGE_KEY = "accessToken";

// 주차 라벨 생성 (백에서 createdAt, weekNumber 내려준다는 가정)
function createWeekLabel(question) {
  const createdAt = question.createdAt
    ? new Date(question.createdAt)
    : new Date();
  const year = createdAt.getFullYear();
  const month = createdAt.getMonth() + 1;
  const weekNumber = question.weekNumber ?? "";
  return `${year}년 ${month}월 ${weekNumber}주차`;
}

// "2025. 11. 30." 형식으로 날짜 라벨 만들기
function formatDateLabel(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}. ${month}. ${day}.`;
}

// 썸네일이 base64만 오는 경우와 data URL로 오는 경우 모두 대응
function buildThumbnailSrc(thumbnailUrl) {
  if (!thumbnailUrl) return undefined;
  if (thumbnailUrl.startsWith("data:image")) return thumbnailUrl;
  return `data:image/jpeg;base64,${thumbnailUrl}`;
}

function WeekAnswer() {
  const location = useLocation();
  const navigate = useNavigate();

  // 주차별 기록에서 넘어오면 { readOnly: true, questionId: ... } 형태로 온다고 가정
  const isReadOnly = location.state?.readOnly ?? false;

  const [weekInfo, setWeekInfo] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [familyProfile, setFamilyProfile] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔊 TTS 재생 관련
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const ttsAudioRef = useRef(null);

  // 가족 구성원이 나 혼자뿐인지 여부
  const hasOtherMembers =
    !!familyProfile && (familyProfile.members?.length ?? 0) > 0;
  const hasAnswers = answers.length > 0;

  // 언마운트 시 오디오 정리
  useEffect(() => {
    return () => {
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        // blob URL만 revoke
        if (ttsAudioRef.current.src?.startsWith("blob:")) {
          URL.revokeObjectURL(ttsAudioRef.current.src);
        }
      }
    };
  }, []);

  // ==========================
  //  TTS 재생 핸들러
  // ==========================
  const handlePlayQuestionTTS = async () => {
    if (!weekInfo?.id || isTtsLoading) return;

    try {
      setIsTtsLoading(true);

      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${API_BASE_URL}/question/tts/${weekInfo.id}`, {
        method: "GET",
        headers,
      });

      if (!res.ok) {
        throw new Error("TTS 요청에 실패했습니다.");
      }

      const contentType = res.headers.get("content-type") || "";
      let audioBlob;

      if (contentType.includes("application/json")) {
        // 🔍 JSON 응답인 경우 ({"audio": {...}, "format": {...}} 같은 형태)
        const data = await res.json();
        console.log("TTS 응답:", data);

        let base64Audio = null;

        if (data.audio) {
          if (typeof data.audio === "string") {
            // ✅ {"audio": "<base64...>"} 인 경우
            base64Audio = data.audio;
          } else {
            // ✅ {"audio": {data / audioContent / bytes...}} 인 경우
            base64Audio =
              data.audio.data ||
              data.audio.audioContent ||
              data.audio.bytes ||
              null;
          }
        }

        if (!base64Audio) {
          throw new Error("TTS 오디오 데이터가 없습니다.");
        }

        // base64 → Blob
        const byteString = atob(base64Audio);
        const len = byteString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i += 1) {
          bytes[i] = byteString.charCodeAt(i);
        }
        audioBlob = new Blob([bytes.buffer], { type: "audio/mpeg" });
      } else if (contentType.startsWith("audio/")) {
        // 🔉 서버가 바로 mp3/wav 바이너리로 주는 경우
        audioBlob = await res.blob();
      } else {
        // 혹시 모를 예외 케이스 대비
        audioBlob = await res.blob();
      }

      const url = URL.createObjectURL(audioBlob);

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

  // 데이터 한 번에 로딩
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

        // 1) 이번 주 질문
        const questionRes = await fetch(`${API_BASE_URL}/question/current`, {
          method: "GET",
          headers,
        });

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

        // 2) 영상 답변 목록 + 가족 프로필을 병렬로 요청
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

        if (!answersRes.ok) {
          throw new Error("영상 답변 목록을 불러오지 못했습니다.");
        }

        const answersJson = await answersRes.json();

        let familyJson = null;
        if (familyRes.ok) {
          familyJson = await familyRes.json();
          setFamilyProfile(familyJson);
        }

        // 🔥 가족장(leader) + members 모두를 이미지 맵에 넣기
        const memberImageMap = new Map();

        if (familyJson?.leader) {
          const leader = familyJson.leader;
          const leaderId =
            leader.familyMemberId ?? leader.memberId ?? leader.id;
          const leaderImg =
            leader.profileImageUrl ?? leader.profileImage ?? null;

          if (leaderId != null && leaderImg) {
            memberImageMap.set(`id:${leaderId}`, leaderImg);
          }
          if (leader.nickname && leaderImg) {
            memberImageMap.set(`name:${leader.nickname}`, leaderImg);
          }
        }

        if (Array.isArray(familyJson?.members)) {
          familyJson.members.forEach((m) => {
            const idKey = m.familyMemberId ?? m.memberId ?? m.id;
            const img = m.profileImageUrl ?? m.profileImage ?? null;

            if (idKey != null && img) {
              memberImageMap.set(`id:${idKey}`, img);
            }
            if (m.nickname && img) {
              memberImageMap.set(`name:${m.nickname}`, img);
            }
          });
        }

        // ✅ /video-answer 응답 + 프로필 이미지 합치기
        const mappedAnswers = (answersJson ?? []).map((item) => {
          const profileImageUrl =
            memberImageMap.get(`id:${item.familyMemberId}`) ??
            memberImageMap.get(`id:${item.memberId}`) ??
            memberImageMap.get(`name:${item.nickname}`) ??
            null;

          console.log(
            "[answer]",
            item.id,
            item.nickname,
            item.familyMemberId,
            "→ profileImageUrl:",
            profileImageUrl
          );

          return {
            id: item.id,
            authorId: item.familyMemberId,
            authorName: item.nickname || "가족", // 별명
            isMine: !!item.owner, // 내가 올린 답변이면 true
            dateLabel: formatDateLabel(item.createdAt),
            title: item.title,
            description: item.summary,
            thumbnailUrl: buildThumbnailSrc(item.thumbnailUrl),
            profileImageUrl, // 🔥 추가
          };
        });

        setAnswers(mappedAnswers);
      } catch (err) {
        console.error(err);
        setError(err.message || "알 수 없는 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeekAnswerData();
  }, []);

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

  const handleShareFamilyCode = () => {
    if (!familyProfile) return;
    shareFamilyInvite(familyProfile.inviteCode);
  };

  const handleAnswer = () => {
    if (!weekInfo) {
      alert("질문 정보를 불러오는 중입니다. 잠시만 기다려 주세요.");
      return;
    }

    // ✅ 파일 선택 말고, 우리가 만든 촬영 페이지로 이동
    navigate("/video-capture", {
      state: { questionId: weekInfo.id, questionTitle: weekInfo.question },
    });
  };

  const handleFilterClick = () => {
    // 주차별 기록 페이지로 이동
    navigate("/weekly-records");
  };

  const handleOpenDetail = (answerId) => {
    navigate(`/answers/${answerId}`);
  };

  // 메인 콘텐츠 상태별 렌더
  let mainContent = null;

  if (isLoading) {
    mainContent = (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-gray-80">데이터를 불러오는 중입니다...</p>
      </div>
    );
  } else if (error) {
    mainContent = (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <p className="text-sm text-red-500 mb-2">
          영상 답변을 불러오지 못했어요.
        </p>
        <p className="text-xs text-gray-80">{error}</p>
      </div>
    );
  } else if (!hasOtherMembers) {
    // 상태 1: 가족에 모임주 말고 아무도 없을 때
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
    // 상태 2: 가족은 있는데, 해당 주차 답변이 하나도 없을 때
    mainContent = (
      <div className="flex-1 flex flex-col items-center justify-start text-center pt-[20vh]">
        <p className="text-lg font-semibold text-text-main">
          첫 번째 답변을 남겨보세요!
        </p>
      </div>
    );
  } else {
    // 상태 3: 답변이 하나 이상 있을 때
    mainContent = (
      <div className="flex-1 mt-6 space-y-8 overflow-y-auto pb-14">
        {Object.entries(answersByDate).map(([dateLabel, list]) => (
          <section key={dateLabel}>
            <p className="text-xs text-gray-80 mb-6 text-center">{dateLabel}</p>
            <div className="space-y-8">
              {list.map((answer) => (
                <VideoAnswerCard
                  key={answer.id}
                  isMine={answer.isMine} // ✅ owner 기반으로 방향 결정
                  title={answer.title}
                  description={answer.description}
                  thumbnailUrl={answer.thumbnailUrl}
                  authorName={answer.authorName} // ✅ nickname
                  profileImageUrl={answer.profileImageUrl} // 🔥 추가
                  onClick={() => handleOpenDetail(answer.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

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
            <span className="flex-1 text-md font-semibold text-text-main text-center break-keep">
              {weekInfo?.question ?? "이번 주 질문을 불러오는 중입니다..."}
            </span>
          </button>
        </section>

        {/* 메인 콘텐츠 */}
        {mainContent}
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
