import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function VideoProcessingLoading() {
  const navigate = useNavigate();
  const location = useLocation();
  const { videoFile } = location.state ?? {};

  useEffect(() => {
    if (!videoFile) return;

    // TODO: 여기에 실제 AI 썸네일 + STT API 호출 넣기
    // 지금은 예시로 setTimeout으로 흉내만 냄
    const timer = setTimeout(() => {
      const mockThumbnailUrl = "/images/mock-thumbnail.png";
      const mockTitle = "AI가 뽑은 제목 예시";
      const mockDescription = "AI가 요약한 영상 내용이 여기에 들어가요.";

      navigate("/answers/new", {
        replace: true,
        state: {
          videoFile, // 여기서 넘겨야 AddVideoAnswer에서 받을 수 있음
          thumbnailUrl: mockThumbnailUrl,
          autoTitle: mockTitle,
          autoDescription: mockDescription,
        },
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [videoFile, navigate]);

  return (
    <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-extrabold text-text-main mb-8 text-center">
        잠시만 기다려주세요!
      </h1>

      <div className="w-32 h-32 rounded-lg bg-gray-20 flex items-center justify-center mb-8">
        <span className="text-sm text-gray-60">로고</span>
      </div>

      <p className="text-lg font-medium text-text-main text-center whitespace-pre-line">
        AI가 최적 썸네일과{"\n"}영상 내용을 요약하고 있어요
      </p>
    </div>
  );
}
