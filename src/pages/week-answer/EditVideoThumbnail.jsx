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

  // AddVideoAnswer / NewDailyPost에서 넘겨준 데이터
  const {
    videoFile,
    videoUrl: INITIAL_VIDEO_URL,
    thumbnailUrl: initialThumb,
    returnTo,
    returnState,
  } = location.state ?? {};

  const videoRef = useRef(null);

  const [videoUrl, setVideoUrl] = useState(INITIAL_VIDEO_URL || null); // ✅ 전달받은 videoUrl로 초기화하고, 없으면 null
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

  // 🔹 어디로 / 어떤 state로 돌아갈지 공통 함수
  const goBack = (extraState = {}) => {
    if (returnTo) {
      navigate(returnTo, {
        replace: true,
        state: {
          ...(returnState || {}),
          ...extraState,
        },
      });
    } else {
      // 옛 코드 호환용 fallback
      navigate(-1);
    }
  };

  const handleBack = () => {
    // 썸네일 변경 없이 그냥 돌아가기
    goBack();
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

    // ✅ 기존 영상 수정 플로우(파일 없음)는 캔버스 캡처 스킵
    if (!videoFile) {
      // 썸네일을 건드리지 않고 그대로 되돌아가기
      goBack({ thumbnailUrl: thumbnail });
      return;
    }

    let dataUrl = thumbnail;

    // file 기반(최초 업로드 플로우)에서는 기존 로직 그대로 사용
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

    // 🔹 편집 결과(썸네일)까지 부모 페이지 state에 실어서 되돌아가기
    goBack({ thumbnailUrl: dataUrl });
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      {/* 헤더 */}
      <Header
        variant="solid"
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
