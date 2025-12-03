import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import Button from "@/components/buttons/Button";

/**
 * 초 단위 시간을 "m:ss" 문자열로 변환하는 유틸 함수
 * - 예: 5.3초 -> "0:05"
 * - 예: 125초 -> "2:05"
 */
function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) return "0:00";
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/**
 * EditVideoThumbnail
 *
 * - AddVideoAnswer(영상 추가/수정 페이지)에서만 사용하는 "썸네일 편집" 화면.
 * - 백엔드 /video-answer, /video-answer/{id} API는
 *    - 영상은 항상 "videoUrl: string" 형태로만 주고받고
 *    - File 객체는 프론트/백엔드 사이를 직접 오가지 않기 때문에
 *   이 컴포넌트는 오직 "videoUrl(문자열) + 썸네일 data URL"만 다룬다.
 *
 * - 역할:
 *   1) 넘어온 videoUrl로 <video>를 재생하고
 *   2) 사용자가 원하는 시점으로 seek한 다음
 *   3) "수정 완료" 클릭 시 현재 프레임을 캡처해서 썸네일 data URL을 생성
 *   4) AddVideoAnswer 쪽으로 { thumbnailUrl: dataUrl }을 돌려보낸다.
 */
export default function EditVideoThumbnail() {
  const navigate = useNavigate();
  const location = useLocation();

  // AddVideoAnswer에서 넘겨준 state
  const {
    // ✅ 이미 업로드된 영상의 URL (S3 등)
    videoUrl: initialVideoUrl,
    // 현재(또는 이전에 저장된) 썸네일 data URL
    thumbnailUrl: initialThumb,
    // 수정 완료 후 돌아갈 라우트 경로 (예: "/answers/new")
    returnTo,
    // 돌아갈 때 함께 넘길 state (원래 페이지의 state 복원용)
    returnState,
  } = location.state ?? {};

  // 비디오 DOM 요소에 접근하기 위한 ref
  const videoRef = useRef(null);

  // 지금 화면에서 재생에 사용할 영상 URL
  // - 백엔드와는 항상 URL 문자열로만 통신하므로, 여기서도 문자열만 관리
  const [videoUrl] = useState(initialVideoUrl || null);

  // 현재 선택된 썸네일 data URL
  const [thumbnail, setThumbnail] = useState(initialThumb || null);

  // 전체 영상 길이(초)
  const [duration, setDuration] = useState(0);
  // 현재 재생 위치(초)
  const [currentTime, setCurrentTime] = useState(0);
  // 재생 중 여부
  const [isPlaying, setIsPlaying] = useState(false);

  /**
   * 🔹 공통 "돌아가기" 핸들러
   *
   * - returnTo가 존재하면 해당 경로로 replace 이동
   *   → 히스토리 스택에서 이 페이지를 대체해서, 뒤로가기로 다시 안 돌아오도록 함
   * - extraState에는 썸네일 등 새로 반영해야 하는 값을 담는다.
   */
  const goBack = (extraState = {}) => {
    if (returnTo) {
      navigate(returnTo, {
        replace: true,
        state: {
          ...(returnState || {}), // 원래 페이지에서 받아온 state 복원
          ...extraState, // 수정된 썸네일 등 덮어쓰기
        },
      });
    } else {
      // 혹시 returnTo가 없으면 그냥 뒤로가기(호환용)
      navigate(-1);
    }
  };

  // 상단 X 버튼: 썸네일 변경 없이 이전 화면으로 복귀
  const handleBack = () => {
    goBack();
  };

  /**
   * 비디오 메타데이터 로드 완료 시 호출
   * - 전체 재생 길이(duration)를 상태에 저장
   */
  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration || 0);
  };

  /**
   * 재생 위치가 변경될 때마다 호출되는 핸들러
   * - currentTime 상태를 갱신해서 슬라이더/시간 표시를 업데이트
   */
  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime || 0);
  };

  /**
   * 재생 / 일시정지 토글
   * - video.paused 여부에 따라 play() 또는 pause() 호출
   * - isPlaying 상태도 함께 갱신
   */
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

  /**
   * 슬라이더 드래그로 시점 이동
   * - input range의 value (0~100)를 받아서
   *   전체 duration에 대한 비율 → 실제 시간(currentTime)으로 변환
   */
  const handleSeek = (e) => {
    const value = Number(e.target.value); // 0~100
    const v = videoRef.current;
    if (!v || !duration) return;

    const time = (value / 100) * duration;
    v.currentTime = time;
    setCurrentTime(time);
  };

  // 현재 재생 위치 비율(%) → 슬라이더 value로 사용
  const progress = duration ? (currentTime / duration) * 100 : 0;

  /**
   * "수정 완료" 버튼 클릭 시
   *
   * - 현재 videoRef가 가리키는 시점(프레임)을 캡처해서
   *   새로운 썸네일 data URL을 만든 뒤,
   *   AddVideoAnswer로 { thumbnailUrl: dataUrl }을 되돌려준다.
   *
   * - API가 videoFile을 주고받지 않고 videoUrl만 사용하는 구조이므로,
   *   "최초 업로드"와 "수정" 모두 동일하게 이 로직을 탄다.
   */
  const handleSubmit = () => {
    const video = videoRef.current;
    let dataUrl = thumbnail;

    if (video) {
      // 비디오 실제 해상도 사용 (없으면 기본값 640x360)
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 360;

      // 임시 캔버스 생성
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // 현재 프레임을 캔버스에 그리기
        ctx.drawImage(video, 0, 0, width, height);
        // JPEG 형식 data URL 생성
        dataUrl = canvas.toDataURL("image/jpeg");
        setThumbnail(dataUrl);
      }
    }

    console.log("최종 썸네일 데이터 URL:", dataUrl);

    // 🔹 생성된 썸네일 data URL을 AddVideoAnswer 쪽으로 전달
    goBack({ thumbnailUrl: dataUrl });
  };

  // (참고) videoUrl이 변경될 일은 현재 플로우 기준으로 없지만,
  //       만약 location.state로 다른 URL이 들어오면 자동 재생 위치 초기화 등도 고려 가능.
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, [videoUrl]);

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      {/* 상단 헤더 */}
      <Header
        variant="solid"
        title="영상 수정하기"
        leftIcon={<img src="/icons/close.svg" alt="닫기" className="w-6 h-6" />}
        onLeftClick={handleBack}
      />

      <main className="flex-1 px-6 pt-4 pb-10 flex flex-col">
        {/* 상단 큰 미리보기 영역 (16:9 비율, 둥근 모서리) */}
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

        {/* 하단 컨트롤 바 (재생 버튼 + 슬라이더 + 시간 표시) */}
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

            {/* 슬라이더 + 시간 */}
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

        {/* 하단 "수정 완료" 버튼 */}
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
