import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import Button from "@/components/buttons/Button";
import TextInput from "@/components/TextInput";
import SlideIndicator from "@/components/SlideIndicator";

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
      // 1) images 배열이 있으면 그대로 사용
      if (Array.isArray(editPost.images) && editPost.images.length > 0) {
        return editPost.images;
      }
      // 2) 이미지 배열은 없고 썸네일만 있는 경우, 썸네일을 단일 이미지로 사용
      if (editPost.thumbnailUrl) {
        return [editPost.thumbnailUrl];
      }
    }
    return [];
  });

  const [videoUrl, setVideoUrl] = useState(() => editPost?.videoUrl ?? null);

  const firstFile = files[0];
  const isVideoFile = !!firstFile && firstFile.type.startsWith("video/");

  const [thumbnailUrl, setThumbnailUrl] = useState(
    () => locationState.thumbnailUrl ?? editPost?.thumbnailUrl ?? null
  );

  const [content, setContent] = useState(() => editPost?.content ?? "");

  const [currentIndex, setCurrentIndex] = useState(0);
  const imageTrackRef = useRef(null);

  const handleBack = () => {
    navigate(-1);
  };

  // 파일 → 미리보기 URL 생성
  useEffect(() => {
    // ✅ 파일이 없는 경우(= 수정 모드에서 미디어 안 바꿈)는
    //    이미 세팅된 imageUrls / videoUrl 그대로 둔다.
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

    // 사진 게시물
    const urls = files.map((file) => URL.createObjectURL(file));

    setImageUrls(urls);
    setVideoUrl(null);
    setThumbnailUrl(urls[0] ?? null); // 기본 썸네일은 첫 번째 사진

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files, isVideoFile]); // files는 useState로 고정되어 있어서 무한 루프 없음

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

  const handleSubmit = () => {
    // ✅ 수정 모드: 내용만 바꿔서 DailyRecords 로 돌려보내기
    if (isEditMode) {
      const updatedPost = {
        ...editPost,
        content, // 내용만 덮어쓰기
      };

      navigate("/daily", { state: { updatedPost } });
      return;
    }

    // 🔁 아래는 기존 "새로 작성" 로직 그대로 사용
    if (!files || files.length === 0) {
      alert("사진 또는 영상을 먼저 선택해주세요.");
      return;
    }

    const now = new Date();
    const dateLabel = `${now.getMonth() + 1}월 ${now.getDate()}일`;

    const newPost = {
      id: Date.now(),
      authorName: "나동생", // TODO: 로그인한 사용자 이름으로 교체
      dateLabel,
      content,
      images: isVideoPost ? [] : imageUrls,
      videoUrl: isVideoPost ? videoUrl : null,
      // 🔹 여기서 편집 후 돌아온 썸네일까지 같이 내려감
      thumbnailUrl,
      commentCount: 0,
    };

    // TODO: API 연동 시 서버에 저장
    navigate("/daily", { state: { newPost } });
  };

  const handleEditVideo = () => {
    if (!firstFile) return;

    navigate("/edit-video", {
      state: {
        videoFile: firstFile,
        thumbnailUrl, // 현재 썸네일(없으면 null)
        // 🔹 어디로, 어떤 state로 돌아갈지 정의
        returnTo: "/daily/new",
        returnState: {
          files,
          thumbnailUrl,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <Header
        variant="solid"
        title="새 게시물"
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-6 h-6" />
        }
        onLeftClick={handleBack}
      />

      <main className="flex-1 flex flex-col px-6 pt-4 pb-10 gap-8 overflow-y-auto">
        {/* ✅ 사진 / 영상 미리보기 영역 */}
        {isVideoPost ? (
          <section>
            <p className="text-base font-semibold text-main mb-2">
              영상 썸네일 등록
            </p>
            <div className="w-full bg-gray-20 rounded-xl overflow-hidden aspect-video">
              <video
                src={videoUrl}
                className="w-full h-full object-cover"
                controls
              />
            </div>

            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleEditVideo}
              >
                영상 및 썸네일 수정
              </Button>
            </div>
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
          <Button type="button" className="w-full" onClick={handleSubmit}>
            작성 완료
          </Button>
        </div>
      </main>
    </div>
  );
}
