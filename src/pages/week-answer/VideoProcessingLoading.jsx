import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// 백엔드 API 기본 URL
// - Vite 환경변수 VITE_API_BASE_URL이 있으면 그 값을 사용
// - 없으면 로컬 개발 환경용 "http://localhost:8080" 사용
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * VideoProcessingLoading
 *
 * - 촬영 / 선택이 끝난 직후, AI가 영상 분석(썸네일 + 요약)을 하는 동안 보여주는 로딩 화면.
 * - 이 컴포넌트에서 하는 일:
 *   1) 이전 페이지에서 전달받은 videoUrl + questionId 를 이용해서
 *      POST /video-answer?questionId=... 를 JSON 바디로 호출한다.
 *        - Request body: { "video": "<영상 URL 또는 경로>" }
 *   2) 응답으로 내려온 videoUrl / thumbnailUrl / title / summary 를
 *      AddVideoAnswer 페이지(/answers/new)로 넘겨서, 사용자가 제목/내용/썸네일을 최종 수정하게 한다.
 *   3) 에러가 발생하면 메시지를 띄우고, 잠시 후 WeekAnswer로 돌려보낸다.
 *
 * - 중요한 점:
 *   - 백엔드와는 **File 객체를 직접 주고받지 않고**, 항상 "videoUrl: string" 형태로만 통신한다.
 *   - 실제 파일 업로드(S3 등)는 다른 단계에서 이미 끝났다고 가정하고,
 *     여기서는 "그 영상이 어디 있는지(URL)" 정보만 전달한다.
 */
export default function VideoProcessingLoading() {
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 페이지(예: 촬영 페이지, 업로드 페이지 등)에서 넘겨준 state
  // - videoUrl  : 이미 업로드된 영상의 URL (또는 서버에서 인식 가능한 경로)
  // - questionId: 어떤 질문에 대한 답변인지 식별하기 위한 ID
  const { videoUrl, questionId } = location.state ?? {};

  // 에러 메시지 상태 (빈 문자열이면 에러 없음)
  const [error, setError] = useState("");

  // React StrictMode에서 useEffect가 개발 모드에서 2번 실행되는 것을 막기 위한 ref
  // - hasRequestedRef.current 가 true이면 더 이상 업로드/분석 요청을 보내지 않는다.
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    // 1) 필수 정보 검증: videoUrl 또는 questionId가 없으면 분석 자체가 불가능
    if (!videoUrl || !questionId) {
      setError("영상 또는 질문 정보가 없어 분석을 진행할 수 없습니다.");

      // 잠시 에러 메시지를 보여준 뒤, WeekAnswer로 돌려보낸다.
      const t = setTimeout(() => {
        navigate("/week-answer", { replace: true });
      }, 1500);

      // cleanup: 타이머 제거
      return () => clearTimeout(t);
    }

    // 2) StrictMode로 인해 useEffect가 두 번 실행되는 것을 방지
    if (hasRequestedRef.current) {
      return;
    }
    hasRequestedRef.current = true;

    /**
     * 업로드 + 분석 요청을 처리하는 비동기 함수
     *
     * - API 스펙:
     *   POST /video-answer?questionId={id}
     *   Content-Type: application/json
     *   Body: { "video": "<영상 URL 문자열>" }
     *
     * - 응답 예시:
     * {
     *   "id": 0,
     *   "questionId": 0,
     *   "familyMemberId": 0,
     *   "familyId": 0,
     *   "videoUrl": "string",
     *   "thumbnailUrl": "string",
     *   "title": "string",
     *   "summary": "string",
     *   "shortsUrl": "string",
     *   "shortsStatus": "string",
     *   "createdAt": "2025-12-03T15:58:43.729Z"
     * }
     */
    const uploadAndAnalyze = async () => {
      try {
        setError("");

        // 로컬스토리지에서 JWT 토큰 가져오기
        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("token") ||
          localStorage.getItem("jwt");

        // JSON 요청 헤더 구성
        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        // questionId는 query param, body에는 video만 담기
        const url = `${API_BASE_URL}/video-answer?questionId=${encodeURIComponent(
          String(questionId)
        )}`;

        // { "video": "<영상 URL>" } 형태로 직렬화
        const body = JSON.stringify({
          video: videoUrl,
        });

        const res = await fetch(url, {
          method: "POST",
          headers,
          body,
        });

        if (!res.ok) {
          throw new Error(`영상 분석에 실패했습니다. (status: ${res.status})`);
        }

        const data = await res.json();

        // 🔁 다음 단계: AddVideoAnswer(영상 추가/수정 페이지)로 이동
        // - 이때부터는 videoUrl / thumbnailUrl / title / summary 같은
        //   "URL + 메타데이터"만 들고 다닌다.
        navigate("/answers/new", {
          replace: true,
          state: {
            // 영상 답변 ID
            videoAnswerId: data.id,
            // 어떤 질문에 대한 답변인지 (백엔드 값 우선, 없으면 기존 questionId 사용)
            questionId: data.questionId ?? questionId,
            // 분석 결과(또는 백엔드가 저장 후 반환한 값들)
            videoUrl: data.videoUrl,
            thumbnailUrl: data.thumbnailUrl,
            autoTitle: data.title,
            autoDescription: data.summary,
          },
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "영상 분석 중 오류가 발생했습니다.");

        // 2초 정도 보여준 뒤 WeekAnswer로 이동
        setTimeout(() => {
          navigate("/week-answer", { replace: true });
        }, 2000);
      }
    };

    uploadAndAnalyze();
  }, [videoUrl, questionId, navigate]);

  return (
    <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center px-6">
      {/* 상단 안내 문구 */}
      <h1 className="text-2xl font-extrabold text-text-main mb-8 text-center">
        잠시만 기다려주세요!
      </h1>

      {/* 가운데 로고 영역 */}
      <div className="w-32 h-32 rounded-lg flex items-center justify-center mb-8">
        <img
          src="/logo/logo.svg"
          alt="우리.zip 로고"
          className="w-35 h-35 mb-2"
        />
      </div>

      {/* AI 분석 중 안내 문구 */}
      <p className="text-lg font-medium text-text-main text-center whitespace-pre-line mb-3">
        AI가 최적 썸네일과{"\n"}영상 내용을 요약하고 있어요
      </p>

      {/* 에러 발생 시에만 표시 */}
      {error && (
        <p className="mt-2 text-sm text-red-500 text-center whitespace-pre-line">
          {error}
        </p>
      )}
    </div>
  );
}
