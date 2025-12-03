import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function VideoProcessingLoading() {
  const navigate = useNavigate();
  const location = useLocation();

  const { videoFile, questionId } = location.state ?? {};
  const [error, setError] = useState("");
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    if (!videoFile || !questionId) {
      setError("영상 또는 질문 정보가 없어 분석을 진행할 수 없습니다.");
      const t = setTimeout(() => {
        navigate("/week-answer", { replace: true });
      }, 1500);
      return () => clearTimeout(t);
    }

    // React StrictMode에서 useEffect가 두 번 도는 것을 방지
    if (hasRequestedRef.current) {
      return;
    }
    hasRequestedRef.current = true;

    const uploadAndAnalyze = async () => {
      try {
        setError("");

        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("token") ||
          localStorage.getItem("jwt");

        const formData = new FormData();
        // 🔑 백엔드가 기대하는 필드 이름: "video", "questionId"
        formData.append(
          "video",
          videoFile,
          videoFile.name || "recorded-video.webm"
        );
        formData.append("questionId", String(questionId));

        const res = await fetch(`${API_BASE_URL}/video-answer`, {
          method: "POST",
          headers: {
            // ❗ Content-Type 은 넣지 말 것 (boundary 자동 설정)
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`영상 분석에 실패했습니다. (status: ${res.status})`);
        }

        const data = await res.json();
        // data: { id, questionId, familyMemberId, familyId, videoUrl, thumbnailUrl, title, summary, ... }

        navigate("/answers/new", {
          replace: true,
          state: {
            videoFile,
            videoAnswerId: data.id,
            questionId: data.questionId,
            videoUrl: data.videoUrl,
            thumbnailUrl: data.thumbnailUrl,
            autoTitle: data.title,
            autoDescription: data.summary,
          },
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "영상 분석 중 오류가 발생했습니다.");
        setTimeout(() => {
          navigate("/week-answer", { replace: true });
        }, 2000);
      }
    };

    uploadAndAnalyze();
  }, [videoFile, questionId, navigate]);

  return (
    <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-extrabold text-text-main mb-8 text-center">
        잠시만 기다려주세요!
      </h1>

      <div className="w-32 h-32 rounded-lg flex items-center justify-center mb-8">
        <img
          src="/logo/logo.svg"
          alt="우리.zip 로고"
          className="w-35 h-35 mb-2"
        />
      </div>

      <p className="text-lg font-medium text-text-main text-center whitespace-pre-line mb-3">
        AI가 최적 썸네일과{"\n"}영상 내용을 요약하고 있어요
      </p>

      {error && (
        <p className="mt-2 text-sm text-red-500 text-center whitespace-pre-line">
          {error}
        </p>
      )}
    </div>
  );
}
