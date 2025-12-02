import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import Button from "@/components/buttons/Button";
import TextInput from "@/components/TextInput";
import SlideIndicator from "@/components/SlideIndicator";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function NewDailyPost() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ location.state 꺼내서 재사용
  const locationState = location.state ?? {};

  // ✅ DailyRecords 에서 넘어온 수정 대상
  const editPost = locationState.editPost ?? null;
  const isEditMode = !!editPost;

  // location.state → 한 번만 초기값으로 사용해서 참조 고정
  const [files] = useState(() => locationState.files ?? []);

  // 수정 모드일 때는 기존 게시물의 미디어를 기본값으로 세팅해서 미리보기용으로 쓴다
  const [imageUrls, setImageUrls] = useState(() => {
    if (editPost) {
      if (Array.isArray(editPost.images) && editPost.images.length > 0) {
        return editPost.images;
      }
      if (editPost.thumbnailUrl) {
        return [editPost.thumbnailUrl];
      }
    }
    return [];
  });

  const [videoUrl, setVideoUrl] = useState(() => editPost?.videoUrl ?? null);

  const firstFile = files[0];
  const isVideoFile = !!firstFile && firstFile.type.startsWith("video/");

  const [content, setContent] = useState(() => editPost?.content ?? "");

  const [currentIndex, setCurrentIndex] = useState(0);
  const imageTrackRef = useRef(null);

  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  // 파일 → 미리보기 URL 생성
  useEffect(() => {
    // 파일이 없는 경우(= 수정 모드에서 미디어 안 바꿈)는
    // 이미 세팅된 imageUrls / videoUrl 그대로 둔다.
    if (!files || files.length === 0) {
      return;
    }

    // 영상 게시물
    if (isVideoFile) {
      const videoFile = files[0];
      const url = URL.createObjectURL(videoFile);

      setVideoUrl(url);
      setImageUrls([]);

      return () => {
        URL.revokeObjectURL(url);
      };
    }

    // 사진 게시물 (여러 장)
    const urls = files.map((file) => URL.createObjectURL(file));

    setImageUrls(urls);
    setVideoUrl(null);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files, isVideoFile]);

  // 영상 여부는 URL 존재 여부로만 판별
  const isVideoPost = !!videoUrl;

  const handleImageScroll = (event) => {
    const container = event.currentTarget;
    if (!container) return;

    const newIndex = Math.round(container.scrollLeft / container.clientWidth);
    setCurrentIndex(newIndex);
  };

  const handleIndicatorChange = (index) => {
    if (!imageTrackRef.current) return;
    const container = imageTrackRef.current;
    const offset = index * container.clientWidth;

    container.scrollTo({ left: offset, behavior: "smooth" });
    setCurrentIndex(index);
  };

  // 🔥 새 글 작성 / 기존 글 내용 수정
  const handleSubmit = async () => {
    setSubmitError("");

    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsSubmitting(true);

      // ✅ 수정 모드: description만 변경 (기존 로직 그대로)
      if (isEditMode) {
        const url = `${API_BASE_URL}/post/${
          editPost.id
        }?description=${encodeURIComponent(content ?? "")}`;

        const res = await fetch(url, {
          method: "PUT",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("일상 기록을 수정하지 못했습니다.");
        }

        navigate("/daily", { replace: true });
        return;
      }

      // ✅ 새 글 작성 (multipart + FormData)
      if (!files || files.length === 0) {
        alert("사진 또는 영상을 먼저 선택해주세요.");
        return;
      }

      const formData = new FormData();
      // 내용도 FormData 안에 추가
      formData.append("description", content ?? "");

      // 백엔드에서 MultipartFile[] files 로 받는다고 가정
      files.forEach((file) => {
        formData.append("files", file);
      });

      const url = `${API_BASE_URL}/post`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          // Content-Type 은 넣지 말고, Authorization만 추가
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("일상 기록을 생성하지 못했습니다.");
      }

      navigate("/daily", { replace: true });
    } catch (error) {
      console.error(error);
      setSubmitError("게시물을 저장하지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <Header
        variant="solid"
        title={isEditMode ? "게시물 수정" : "새 게시물"}
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-6 h-6" />
        }
        onLeftClick={handleBack}
      />

      <main className="flex-1 flex flex-col px-6 pt-4 pb-10 gap-8 overflow-y-auto">
        {/* 사진 / 영상 미리보기 영역 */}
        {isVideoPost ? (
          <section>
            <p className="text-base font-semibold text-main mb-2">
              업로드한 영상
            </p>
            <div className="w-full bg-gray-20 rounded-xl overflow-hidden aspect-video">
              <video
                src={videoUrl}
                className="w-full h-full object-cover"
                controls
              />
            </div>
            {/* 🔥 썸네일 수정 버튼/로직 제거 */}
          </section>
        ) : (
          <section>
            <div
              ref={imageTrackRef}
              className="w-full overflow-x-auto flex snap-x snap-mandatory bg-gray-20"
              onScroll={handleImageScroll}
            >
              {imageUrls.map((url) => (
                <div
                  key={url}
                  className="relative min-w-full shrink-0 snap-center rounded-xl bg-gray-20 overflow-hidden"
                  style={{ aspectRatio: "1 / 1" }}
                >
                  <img
                    src={url}
                    alt="업로드한 사진 미리보기"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {imageUrls.length > 1 && (
              <div className="mt-2 flex justify-center">
                <SlideIndicator
                  totalSlides={imageUrls.length}
                  currentIndex={currentIndex}
                  onChangeIndex={handleIndicatorChange}
                />
              </div>
            )}
          </section>
        )}

        {/* 내용 입력 */}
        <section>
          <p className="text-xl font-semibold text-main mb-3">
            내용 추가 (선택)
          </p>
          <TextInput
            multiline
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="사진이나 영상과 함께 남기고 싶은 말을 작성해주세요"
            maxLength={200}
          />
        </section>

        <div className="mt-auto">
          {submitError && (
            <p className="mb-2 text-xs text-red-500">{submitError}</p>
          )}
          <Button type="button" className="w-full" onClick={handleSubmit}>
            {isEditMode
              ? isSubmitting
                ? "수정 중..."
                : "수정 완료"
              : isSubmitting
              ? "작성 중..."
              : "작성 완료"}
          </Button>
        </div>
      </main>
    </div>
  );
}
