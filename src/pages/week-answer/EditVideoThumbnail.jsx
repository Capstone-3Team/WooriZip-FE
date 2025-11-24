import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import Button from "@/components/buttons/Button";

function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) return "0:00";
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function EditVideoThumbnail() {
  const navigate = useNavigate();
  const location = useLocation();

  // AddVideoAnswer에서 넘겨준 데이터 가정
  const {
    videoFile,
    videoUrl: initialUrl,
    thumbnailUrl: initialThumb,
  } = location.state ?? {};

  const videoRef = useRef(null);

  const [videoUrl, setVideoUrl] = useState(initialUrl || "/videos/sample.mp4"); // public/videos/sample.mp4 넣어두기
  const [thumbnail, setThumbnail] = useState(initialThumb || null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // file → objectURL 생성
  useEffect(() => {
    if (!videoFile) return;
    const objectUrl = URL.createObjectURL(videoFile);
    setVideoUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [videoFile]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration || 0);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime || 0);
  };

  const handleTogglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  // 슬라이더로 시점 이동
  const handleSeek = (e) => {
    const value = Number(e.target.value);
    const v = videoRef.current;
    if (!v || !duration) return;
    const time = (value / 100) * duration;
    v.currentTime = time;
    setCurrentTime(time);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  // 수정 완료 시점에서 현재 프레임을 캡처해서 썸네일로 사용
  const handleSubmit = () => {
    const video = videoRef.current;

    let dataUrl = thumbnail;

    if (video) {
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 360;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        dataUrl = canvas.toDataURL("image/jpeg");
        setThumbnail(dataUrl);
      }
    }

    console.log("최종 썸네일 데이터 URL:", dataUrl);

    // TODO: 실제로는 AddVideoAnswer 쪽으로 썸네일 값을 넘겨주기
    // 예시 (AddVideoAnswer 라우트가 /answers/new 인 경우):
    // navigate("/answers/new", {
    //   replace: true,
    //   state: {
    //     ...restState,
    //     videoFile,
    //     thumbnailUrl: dataUrl,
    //   },
    // });

    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      {/* 헤더 */}
      <Header
        variant="type2"
        title="영상 수정하기"
        leftIcon={<img src="/icons/close.svg" alt="닫기" className="w-6 h-6" />}
        onLeftClick={handleBack}
      />

      <main className="flex-1 px-6 pt-4 pb-10 flex flex-col">
        {/* 상단 큰 미리보기 영역 */}
        <div className="w-full aspect-video rounded-xl bg-gray-20 overflow-hidden mb-6 flex items-center justify-center">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
            />
          ) : (
            <span className="text-xs text-gray-60">영상 미리보기</span>
          )}
        </div>

        {/* 하단 노란 컨트롤 바 (재생 + 슬라이더) */}
        {videoUrl && (
          <div className="bg-bg-app flex items-center gap-3 px-3 py-3">
            {/* 재생 / 일시정지 버튼 */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className="w-11 h-11 rounded-md bg-yellow-main flex items-center justify-center"
            >
              {isPlaying ? (
                <span className="text-lg font-bold text-text-main">||</span>
              ) : (
                <span className="text-lg font-bold text-text-main">▶</span>
              )}
            </button>

            {/* 슬라이더 + 시간 표시 */}
            <div className="flex-1 flex flex-col">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-full accent-yellow-main"
              />
              <div className="mt-1 text-xs text-text-main text-right">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        )}

        {/* 아래 여백 + 수정 완료 버튼 */}
        <div className="mt-auto pt-10">
          <Button
            size="large"
            variant="primary"
            type="button"
            onClick={handleSubmit}
          >
            수정 완료
          </Button>
        </div>
      </main>
    </div>
  );
}
