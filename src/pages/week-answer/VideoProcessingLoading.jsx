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
  const { videoFile, questionId } = location.state ?? {};

  // 에러 메시지 상태 (빈 문자열이면 에러 없음)
  const [error, setError] = useState("");

  // React StrictMode에서 useEffect가 개발 모드에서 2번 실행되는 것을 막기 위한 ref
  // - hasRequestedRef.current 가 true이면 더 이상 업로드/분석 요청을 보내지 않는다.
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    // 1) 최소 정보 체크 (없으면 week-answer로 되돌리기)
    if (!videoFile || !questionId) {
      setError("영상 또는 질문 정보가 없어 분석을 진행할 수 없습니다.");
      const t = setTimeout(() => {
        navigate("/week-answer", { replace: true });
      }, 1500);
      return () => clearTimeout(t);
    }

    // 중복 호출 방지
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;

    const uploadAndAnalyze = async () => {
      // 로컬에서라도 써먹을 수 있는 blob URL (백엔드 실패 시용)
      const localVideoUrl = URL.createObjectURL(videoFile);

      try {
        setError("");

        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("token") ||
          localStorage.getItem("jwt");

        // 2) FormData로 파일 + questionId 전송
        const formData = new FormData();
        const fileName =
          (videoFile &&
            typeof videoFile === "object" &&
            "name" in videoFile &&
            videoFile.name) ||
          "recorded-video.webm";

        formData.append("video", videoFile, fileName);
        formData.append("questionId", String(questionId));

        const res = await fetch(`${API_BASE_URL}/video-answer`, {
          method: "POST",
          headers: {
            // ❗ Content-Type은 FormData가 알아서 설정하게 둔다
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });

        let data = null;

        if (res.ok) {
          // AI 요약/썸네일까지 성공한 경우
          data = await res.json();
        } else {
          // AI 쪽 4xx/5xx (썸네일 실패 등)
          const text = await res.text().catch(() => "");
          console.error("[/video-answer] 실패:", res.status, text);
          setError(`영상 분석에 실패했습니다. (status: ${res.status})`);
        }

        // 3) 성공이든 실패든 AddVideoAnswer로 이동
        navigate("/answers/new", {
          replace: true,
          state: {
            // 성공 시 백엔드에서 받은 id, 실패 시 null
            videoAnswerId: data?.id ?? null,
            // 백엔드가 questionId 내려주면 그걸, 아니면 기존 값
            questionId: data?.questionId ?? questionId,
            // 성공 시 백엔드 videoUrl, 실패 시 로컬 blob URL
            videoUrl: data?.videoUrl ?? localVideoUrl,
            // 성공 시 자동 썸네일/제목/요약, 실패 시 빈 값
            thumbnailUrl: data?.thumbnailUrl ?? "",
            title: data?.title ?? "",
            description: data?.summary ?? "",
            isEdit: false,
          },
        });
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "영상 분석 중 오류가 발생했습니다."
        );

        // 4) 네트워크 오류 등 진짜 예외여도, 최소한 영상 편집 화면으로는 보내기
        navigate("/answers/new", {
          replace: true,
          state: {
            videoAnswerId: null,
            questionId,
            videoUrl: localVideoUrl,
            thumbnailUrl: "",
            title: "",
            description: "",
            isEdit: false,
          },
        });
      }
    };

    uploadAndAnalyze();
  }, [videoFile, questionId, navigate]);

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
