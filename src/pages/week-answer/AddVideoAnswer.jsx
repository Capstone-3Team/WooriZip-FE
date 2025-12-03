import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Header from "@/layouts/Header";
import Button from "@/components/buttons/Button";
import TextInput from "@/components/TextInput";

// ==============================
// 1. 공통 상수 / 유틸 함수
// ==============================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// 썸네일 데이터 정규화 함수
// - 썸네일이 "data:image/jpeg;base64,...." 같은 data URL로 들어오는 경우
//   → 서버에는 순수 base64 데이터만 보내고 싶으니까 "data:...," 앞부분은 제거
// - 이미 순수 base64 문자열만 들어왔다면 그대로 반환
const normalizeThumbnailData = (value) => {
  if (!value) return "";

  // data URL 형식인지 확인
  if (value.startsWith("data:image")) {
    const commaIndex = value.indexOf(",");
    // "data:...," 이후의 부분만 잘라서 반환 (base64 순수 데이터)
    return commaIndex !== -1 ? value.slice(commaIndex + 1) : value;
  }
  // 이미 base64만 들어온 경우
  return value;
};

export default function AddVideoAnswer() {
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 페이지(예: 촬영 페이지, 썸네일 편집 페이지)에서 넘어온 state
  // - videoFile: 실제 영상 파일 객체 (있을 수도, 없을 수도 있음)
  // - videoAnswerId: 백엔드에서 생성된 영상 답변 ID
  // - questionId: 어떤 질문에 대한 답변인지
  // - videoUrl: 재생용 영상 URL (S3 등)
  // - thumbnailUrl: 썸네일 (data URL 또는 base64)
  // - autoTitle / autoDescription: AI가 추천한 제목/내용
  // - stateTitle / stateDescription: 사용자가 이미 한 번 수정한 제목/내용
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

  // 내부 state에는 "순수 base64 데이터"만 들고 있음
  // - 화면에 보여줄 때만 data URL로 다시 감싸 줌
  const [thumbnailData, setThumbnailData] = useState(
    normalizeThumbnailData(stateThumb ?? "")
  );

  // 제목: 이미 수정된 값(stateTitle)이 있으면 우선, 없으면 autoTitle, 둘 다 없으면 빈 문자열
  const [title, setTitle] = useState(stateTitle ?? autoTitle ?? "");
  // 상세 내용: 이미 수정된 값(stateDescription)이 있으면 우선, 없으면 autoDescription
  const [description, setDescription] = useState(
    stateDescription ?? autoDescription ?? ""
  );
  // 저장 버튼 중복 클릭 방지용 로딩 상태
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==============================
  // 2. 썸네일 프리뷰 URL 메모이제이션
  // ==============================

  // 화면에 보여줄 때는 "data:image/jpeg;base64,..." 형태로 필요하므로
  // thumbnailData(순수 base64)를 data URL로 감싸서 사용
  // - thumbnailData가 변경될 때만 다시 계산
  const thumbnailPreviewUrl = useMemo(
    () => (thumbnailData ? `data:image/jpeg;base64,${thumbnailData}` : ""),
    [thumbnailData]
  );

  // ==============================
  // 3. 썸네일 편집 페이지에서 돌아왔을 때 처리
  // ==============================

  // EditVideoThumbnail → AddVideoAnswer로 돌아올 때
  // location.state.thumbnailUrl에 새 썸네일이 담겨 들어올 수 있음
  useEffect(() => {
    if (location.state?.thumbnailUrl) {
      setThumbnailData(normalizeThumbnailData(location.state.thumbnailUrl));
    }
  }, [location.state]);

  // ==============================
  // 4. 각종 핸들러
  // ==============================

  // 상단 X 버튼: 이전 페이지로 단순히 뒤로 가기
  // 이 부분 수정 필요 지금까지 작성한 데이터 다 없애고 main 페이지로 가는 게 맞는 것 같음.
  const handleClose = () => {
    navigate(-1);
  };

  // “영상 및 썸네일 수정” 버튼 클릭 시
  // - /edit-video 페이지로 이동해서 영상/썸네일을 다시 편집
  // - returnTo / returnState를 함께 넘겨서, 편집 완료 후 다시 이 페이지로 돌아올 수 있게 함
  const handleEditVideo = () => {
    navigate("/edit-video", {
      state: {
        videoFile,
        videoUrl,
        // 편집 화면은 data URL로 쓰기 편하므로, preview용 data URL을 그대로 넘김
        thumbnailUrl: thumbnailPreviewUrl,
        // 편집을 마친 뒤 돌아올 라우트
        returnTo: "/answers/new",
        // 돌아올 때 복원해야 할 state들
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

  // “다시 찍기” 버튼 클릭 시
  // - 현재 페이지를 스택에서 교체(replace)하면서 /week-answer로 이동
  //   (뒤로가기 눌렀을 때 다시 AddVideoAnswer로 돌아오지 않도록)
  const handleRetake = () => {
    navigate("/week-answer", { replace: true });
  };

  // “영상 추가 완료” 버튼 클릭 시 → 영상 답변 정보 저장(수정)
  const handleSubmit = async () => {
    // 영상 답변 ID가 없으면 저장 불가 (백엔드에서 아직 ID가 생성되지 않은 경우)
    if (!videoAnswerId) {
      alert("영상 정보가 없어 저장할 수 없습니다. 다시 시도해 주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 토큰을 여러 키 이름에서 찾아봄 (프로젝트 내에서 키 이름이 다를 수 있어서)
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwt");

      // JSON 요청 헤더 구성
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // 백엔드에서 정의한 PUT /video-answer/{id} 요청 바디
      // - 이 페이지에서는 썸네일/제목/요약만 수정
      // - thumbnailUrl에는 "순수 base64 문자열"만 담아서 보냄
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

      // 응답 바디가 필요 없다면 굳이 값을 쓰지 않아도 되지만,
      // 여기서는 형식을 맞춰 한 번 파싱만 해줌
      await res.json();

      // 저장 완료 후 → 이번 주 답변 목록 페이지로 이동
      // replace: true → 현재 페이지를 히스토리에서 교체 (뒤로가기 시 이 페이지로 안 돌아오게)
      navigate("/week-answer", { replace: true });
    } catch (err) {
      console.error(err);
      alert(err.message || "영상 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==============================
  // 5. 렌더링
  // ==============================

  return (
    <div className="min-h-screen bg-bg-app">
      {/* 상단 헤더 */}
      <Header
        variant="solid"
        title="영상 추가"
        leftIcon={<img src="/icons/close.svg" alt="닫기" className="w-6 h-6" />}
        onLeftClick={handleClose}
      />

      {/* 메인 영역: 썸네일 / 제목 / 상세 내용 / 하단 버튼 */}
      <main className="px-6 pt-4 pb-28 space-y-8">
        {/* 1. 썸네일 */}
        <section>
          <h1 className="text-xl font-semibold text-text-main">영상 썸네일</h1>
          <p className="mt-2 text-sm text-gray-60">
            AI가 선정한 최적 썸네일이에요
          </p>

          {/* 썸네일 미리보기 박스 (16:9 비율 유지) */}
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

          {/* 썸네일/영상 수정 버튼 */}
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

        {/* 2. 제목 / 상세내용 입력 섹션 */}
        <section className="space-y-8">
          {/* 제목 입력 */}
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

          {/* 상세 내용 입력 (멀티라인) */}
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

        {/* 3. 하단 버튼 영역 */}
        <div className="space-y-3">
          {/* 다시 찍기: WeekAnswer로 돌아감 */}
          <Button
            size="large"
            variant="default"
            type="button"
            onClick={handleRetake}
            disabled={isSubmitting}
          >
            다시 찍기
          </Button>

          {/* 영상 추가 완료: PUT 호출 후 WeekAnswer로 이동 */}
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
