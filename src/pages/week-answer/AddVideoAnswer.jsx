import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Header from "@/layouts/Header";
import Button from "@/components/buttons/Button";
import TextInput from "@/components/TextInput";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// data URL 이 들어온 경우에도 base64 부분만 뽑아서 저장
const normalizeThumbnailData = (value) => {
  if (!value) return "";
  if (value.startsWith("data:image")) {
    const commaIndex = value.indexOf(",");
    return commaIndex !== -1 ? value.slice(commaIndex + 1) : value;
  }
  return value;
};

export default function AddVideoAnswer() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    videoFile,
    videoAnswerId,
    questionId,
    videoUrl,
    thumbnailUrl: stateThumb,
    autoTitle,
    autoDescription,
    title: stateTitle,
    description: stateDescription,
  } = location.state ?? {};

  // ✅ 내부 state 는 base64 순수 데이터만 들고 있음
  const [thumbnailData, setThumbnailData] = useState(
    normalizeThumbnailData(stateThumb ?? "")
  );
  const [title, setTitle] = useState(stateTitle ?? autoTitle ?? "");
  const [description, setDescription] = useState(
    stateDescription ?? autoDescription ?? ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 화면에 보여줄 때만 data URL로 변환
  const thumbnailPreviewUrl = useMemo(
    () => (thumbnailData ? `data:image/jpeg;base64,${thumbnailData}` : ""),
    [thumbnailData]
  );

  // 썸네일 편집 페이지(EditVideoThumbnail)에서 돌아왔을 때
  useEffect(() => {
    if (location.state?.thumbnailUrl) {
      setThumbnailData(normalizeThumbnailData(location.state.thumbnailUrl));
    }
  }, [location.state]);

  const handleClose = () => {
    navigate(-1);
  };

  // “영상 및 썸네일 수정”
  const handleEditVideo = () => {
    navigate("/edit-video", {
      state: {
        videoFile,
        videoUrl,
        thumbnailUrl: thumbnailPreviewUrl, // 편집 화면은 data URL로 쓰기 편할 것 같아서
        returnTo: "/answers/new",
        returnState: {
          videoFile,
          videoAnswerId,
          questionId,
          videoUrl,
          autoTitle,
          autoDescription,
          title,
          description,
          thumbnailUrl: thumbnailPreviewUrl,
        },
      },
    });
  };

  const handleRetake = () => {
    navigate("/week-answer", { replace: true });
  };

  const handleSubmit = async () => {
    if (!videoAnswerId) {
      alert("영상 정보가 없어 저장할 수 없습니다. 다시 시도해 주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      // ✅ 토큰 여러 키에서 읽기
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwt");

      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // PUT /video-answer/{id} 는 썸네일/제목/요약만 받도록 정리
      const bodyForPut = {
        thumbnailUrl: thumbnailData,
        title,
        summary: description,
      };

      const res = await fetch(`${API_BASE_URL}/video-answer/${videoAnswerId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(bodyForPut),
      });

      if (!res.ok) {
        throw new Error("영상 답변을 저장하지 못했습니다.");
      }

      await res.json();
      navigate("/week-answer", { replace: true });
    } catch (err) {
      console.error(err);
      alert(err.message || "영상 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-app">
      <Header
        variant="solid"
        title="영상 추가"
        leftIcon={<img src="/icons/close.svg" alt="닫기" className="w-6 h-6" />}
        onLeftClick={handleClose}
      />

      <main className="px-6 pt-4 pb-28 space-y-8">
        {/* 1. 썸네일 */}
        <section>
          <h1 className="text-xl font-semibold text-text-main">영상 썸네일</h1>
          <p className="mt-2 text-sm text-gray-60">
            AI가 선정한 최적 썸네일이에요
          </p>

          <div className="mt-4 w-full aspect-video bg-gray-20 flex items-center justify-center overflow-hidden">
            {thumbnailPreviewUrl ? (
              <img
                src={thumbnailPreviewUrl}
                alt="영상 썸네일"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-60">썸네일 미리보기</span>
            )}
          </div>

          <div className="mt-4">
            <Button
              size="large"
              variant="default"
              type="button"
              onClick={handleEditVideo}
            >
              영상 및 썸네일 수정
            </Button>
          </div>
        </section>

        {/* 2. 제목 / 상세내용 */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-xl font-semibold text-text-main">제목</h1>
            <TextInput
              placeholder="글 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              supportingText="최대 15자까지 가능해요"
              name="video-title"
            />
          </div>
          <div className="space-y-3">
            <h1 className="text-xl font-semibold text-text-main">상세 내용</h1>
            <TextInput
              multiline
              rows={5}
              placeholder="영상의 내용을 설명해주세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              name="video-description"
            />
          </div>
        </section>

        {/* 3. 하단 버튼 */}
        <div className="space-y-3">
          <Button
            size="large"
            variant="default"
            type="button"
            onClick={handleRetake}
            disabled={isSubmitting}
          >
            다시 찍기
          </Button>
          <Button
            size="large"
            variant="primary"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "영상 추가 완료"}
          </Button>
        </div>
      </main>
    </div>
  );
}
