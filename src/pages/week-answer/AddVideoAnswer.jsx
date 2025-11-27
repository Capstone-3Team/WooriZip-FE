import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/layouts/Header";
import Button from "@/components/buttons/Button";
import TextInput from "@/components/TextInput";

export default function AddVideoAnswer() {
  const navigate = useNavigate();
  const location = useLocation();

  // WeekAnswer → (로딩 + AI 분석) → 여기로 올 때 넘겨줄 값들 가정
  const { videoFile, thumbnailUrl, autoTitle, autoDescription } =
    location.state ?? {};

  // 입력값: AI가 뽑은 값으로 기본 세팅, 사용자가 수정 가능
  const [title, setTitle] = useState(autoTitle ?? "");
  const [description, setDescription] = useState(autoDescription ?? "");

  const handleClose = () => {
    navigate(-1);
  };

  // “영상 및 썸네일 수정” → 다음에 만들 영상 편집 페이지로 이동 (TODO)
  const handleEditVideo = () => {
    navigate("/edit-video", {
      state: {
        videoFile, // WeekAnswer → 로딩 → AddVideoAnswer에서 넘겨받은 그 파일
        thumbnailUrl, // 현재 썸네일
      },
    });
  };

  // “다시 찍기” → 다시 카메라 찍으러 (일단 WeekAnswer로 복귀)
  const handleRetake = () => {
    navigate(-1);
    // 또는 특정 주차 페이지로: navigate("/week-answer");
  };

  // “영상 추가 완료” → 서버에 저장 후 상세 페이지로 이동 (TODO)
  const handleSubmit = () => {
    // TODO: 폼 검증 + 업로드 + API 요청
    console.log("submit video answer", {
      videoFile,
      title,
      description,
      thumbnailUrl,
    });

    // 메인 페이지로 이동
    navigate("/week-answer"); // 메인 페이지에 내 답변 추가
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      {/* 헤더 */}
      <Header
        variant="solid"
        title="영상 추가"
        leftIcon={<img src="/icons/close.svg" alt="닫기" className="w-6 h-6" />}
        onLeftClick={handleClose}
      />

      {/* 내용 */}
      <main className="flex-1 px-6 pt-4 pb-10 space-y-8">
        {/* 1. 영상 썸네일 영역 */}
        <section>
          <h1 className="text-xl font-semibold text-text-main">영상 썸네일</h1>
          <p className="mt-2 text-sm text-gray-60">
            AI가 선정한 최적 썸네일이에요
          </p>

          {/* 썸네일 박스 */}
          <div className="mt-4 w-full aspect-video bg-gray-20 flex items-center justify-center overflow-hidden">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt="영상 썸네일"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-60">썸네일 미리보기</span>
            )}
          </div>

          {/* 영상 및 썸네일 수정 버튼 */}
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

        {/* 2. 제목 + 상세 내용 입력 */}
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

        {/* 하단 버튼 2개 (다시 찍기 / 영상 추가 완료) */}
        <div className="space-y-3">
          <Button
            size="large"
            variant="default"
            type="button"
            onClick={handleRetake}
          >
            다시 찍기
          </Button>
          <Button
            size="large"
            variant="primary"
            type="button"
            onClick={handleSubmit}
          >
            영상 추가 완료
          </Button>
        </div>
      </main>
    </div>
  );
}
