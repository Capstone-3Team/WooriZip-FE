import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import Button from "@/components/buttons/Button";

const FACE_API_BASE_URL = import.meta.env.VITE_FACE_GUIDE_API_BASE_URL;

export default function VideoCapturePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const questionId = location.state?.questionId;
  const questionTitle =
    location.state?.questionTitle || "이번 주 질문을 불러오지 못했어요.";

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);

  //const [faceState, setFaceState] = useState(null);
  //const [faceMessage, setFaceMessage] = useState("");

  // 오디오 파일 참조
  const comeInAudioRef = useRef(null);
  const moveBackAudioRef = useRef(null);

  // 마지막으로 수신한 face 상태
  const lastFaceStateRef = useRef(null);

  // 오디오 debounce
  const lastAudioStateRef = useRef(null);
  const lastAudioTimeRef = useRef(0);

  const hasRecorded = !!recordedBlob;

  // ============================================================
  // 1) 카메라 초기화
  // ============================================================
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: true,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setIsCameraReady(true);
      } catch (err) {
        console.error("카메라 열기 실패:", err);
        alert("카메라 접근 권한을 확인해주세요.");
        navigate(-1);
      }
    };

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [navigate]);

  // ============================================================
  // 2) 녹화 시작 / 종료
  // ============================================================
  const handleStartRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp8",
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // ============================================================
  // 3) 안정화된 TTS 재생 로직
  //    - perfect / idle 일 때는 재생 X
  //    - 같은 상태는 최소 3초 간격
  // ============================================================
  const playStateAudio = useCallback((state) => {
    if (state === "perfect" || state === "idle") return;

    const now = Date.now();
    const COOLDOWN_MS = 1000; // 서로 다른 상태 간 최소 1초 간격

    // 같은 상태 연속 → 3초 지나면 재생 허용
    if (state === lastAudioStateRef.current) {
      if (now - lastAudioTimeRef.current < 3000) return;
    }

    // 다른 상태로 바뀌었어도 너무 자주 바뀌면 제한
    if (now - lastAudioTimeRef.current < COOLDOWN_MS) return;

    let audioRef;

    if (state === "come_in") {
      if (!comeInAudioRef.current) {
        comeInAudioRef.current = new Audio("/audio/come_in.mp3");
      }
      audioRef = comeInAudioRef.current;
    } else if (state === "move_back") {
      if (!moveBackAudioRef.current) {
        moveBackAudioRef.current = new Audio("/audio/move_back.mp3");
      }
      audioRef = moveBackAudioRef.current;
    } else {
      return;
    }

    audioRef
      .play()
      .then(() => {
        lastAudioStateRef.current = state;
        lastAudioTimeRef.current = now;
        console.log("[AUDIO]", state);
      })
      .catch((err) => {
        console.warn("TTS 재생 실패:", err);
      });
  }, []);

  // ============================================================
  // 4) 얼굴 정렬 API polling loop
  //    - 450ms마다 한 번씩 프레임 캡쳐
  //    - 상태 변화에 따라 자막 & TTS 트리거
  // ============================================================
  useEffect(() => {
    if (!isCameraReady) return;

    let cancelled = false;
    let analyzing = false;

    const loop = async () => {
      if (cancelled) return;

      if (videoRef.current && canvasRef.current && isRecording && !analyzing) {
        analyzing = true;

        try {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");

          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const blob = await new Promise((resolve) =>
            canvas.toBlob((b) => resolve(b), "image/jpeg", 0.8)
          );

          if (blob) {
            const formData = new FormData();
            formData.append("file", blob, "frame.jpg");

            const res = await fetch(`${FACE_API_BASE_URL}/face_arrange`, {
              method: "POST",
              body: formData,
            });

            if (res.ok) {
              const data = await res.json();
              const newState = data.state; // "perfect" | "come_in" | "move_back" | "idle"

              // setFaceState(newState);
              // setFaceMessage(data.message || "");

              const prevState = lastFaceStateRef.current;
              lastFaceStateRef.current = newState;

              // ---- 1) TTS: 상태가 바뀌었고, perfect/idle 이 아닐 때만 1회 재생 ----
              if (
                newState !== "perfect" &&
                newState !== "idle" &&
                newState !== prevState
              ) {
                playStateAudio(newState);
              }
            }
          }
        } catch (err) {
          console.error("얼굴 분석 오류:", err);
        } finally {
          analyzing = false;
        }
      }

      setTimeout(loop, 450); // 반응성 & 서버 부하 균형
    };

    loop();
    return () => {
      cancelled = true;
    };
  }, [isCameraReady, isRecording, playStateAudio]);

  // ============================================================
  // 5) 다음 단계 이동
  // ============================================================
  const handleNext = () => {
    if (!recordedBlob) {
      alert("녹화된 영상이 없습니다. 먼저 녹화를 해주세요.");
      return;
    }
    if (!questionId) {
      alert("질문 정보가 없습니다.");
      navigate("/week-answer", { replace: true });
      return;
    }

    navigate("/answers/new/loading", {
      state: { videoFile: recordedBlob, questionId },
    });
  };

  const handleClose = () => navigate(-1);

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Header
        variant="solid"
        title="영상 촬영"
        leftIcon={<img src="/icons/close.svg" alt="닫기" className="w-6 h-6" />}
        onLeftClick={handleClose}
      />

      <main className="flex-1 px-6 pb-6 flex flex-col gap-4">
        {/* 이번 주 질문 카드 */}
        <section className="mt-3">
          <div className="w-full rounded-2xl bg-yellow-20 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-80 mb-1">이번 주 질문</p>
            <p className="text-sm font-semibold text-text-main whitespace-pre-line">
              {questionTitle}
            </p>
          </div>
        </section>

        {/* 카메라 프리뷰 */}
        <div className="mt-4 w-full aspect-3/4 sm:aspect-video bg-black rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover transform-[scaleX(-1)]"
          />
        </div>

        {/* 녹화 버튼 */}
        <div className="mt-4 flex gap-3">
          {!isRecording ? (
            <Button
              type="button"
              variant={hasRecorded ? "default" : "primary"}
              size="large"
              className="flex-1"
              onClick={handleStartRecording}
              disabled={!isCameraReady}
            >
              녹화 시작
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              size="large"
              className="flex-1"
              onClick={handleStopRecording}
            >
              녹화 종료
            </Button>
          )}

          <Button
            type="button"
            variant={hasRecorded ? "primary" : "default"}
            size="large"
            className="flex-1"
            onClick={handleNext}
          >
            다음
          </Button>
        </div>

        {/* 숨겨진 캔버스 */}
        <canvas ref={canvasRef} className="hidden" />
      </main>
    </div>
  );
}
