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

/**
 * 썸네일 데이터 정규화 함수
 *
 * - 화면에서는 보통 "data:image/jpeg;base64,..." 같은 data URL 형태를 사용하지만,
 *   백엔드에는 "순수 base64 문자열"만 보내는 게 일반적이라서 앞부분을 잘라낸다.
 * - 이미 순수 base64 문자열만 들어왔다면 그대로 반환한다.
 */
const normalizeThumbnailData = (value) => {
  if (!value) return "";

  // value가 data URL("data:image/...;base64,...") 형식인 경우
  if (value.startsWith("data:image")) {
    const commaIndex = value.indexOf(",");
    // "data:...," 이후 부분만 잘라서 base64 데이터만 남긴다.
    return commaIndex !== -1 ? value.slice(commaIndex + 1) : value;
  }
  // 이미 base64 문자열만 들어온 경우
  return value;
};

export default function AddVideoAnswer() {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * 이전 페이지(예: 촬영 완료 → AI 분석 → 이 화면으로 이동)에서 넘겨주는 state들
   *
   * - videoAnswerId : 백엔드에서 생성한 영상 답변 ID
   * - questionId    : 어떤 질문에 대한 답변인지
   * - videoUrl      : 실제 영상이 저장된 경로(S3 URL 등)
   * - thumbnailUrl  : 썸네일 (data URL 또는 순수 base64)
   * - autoTitle     : AI가 추천한 제목
   * - autoDescription : AI가 추천한 요약/설명
   * - stateTitle / stateDescription :
   *      사용자가 한 번 수정했다가 다시 돌아온 경우 이미 입력한 값을 복원하기 위한 용도
   *
   * ✅ 여기서 중요한 점:
   *   - “실제 영상 파일(File 객체)”는 이 컴포넌트 기준으로는 주고받지 않는다.
   *   - 백엔드와는 항상 videoUrl(문자열) 기준으로만 통신한다.
   */
  const {
    videoAnswerId,
    questionId,
    videoUrl,
    thumbnailUrl: stateThumb,
    autoTitle,
    autoDescription,
    title: stateTitle,
    description: stateDescription,
    isEdit = false,
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

  /**
   * thumbnailPreviewUrl
   *
   * - 화면에 <img>로 보여줄 땐 data URL 형식이 필요하므로,
   *   내부에 들고 있는 base64(thumbnailData)를 "data:image/jpeg;base64,..."로 감싼다.
   * - thumbnailData가 바뀔 때만 재계산되도록 useMemo 사용.
   */
  const thumbnailPreviewUrl = useMemo(
    () => (thumbnailData ? `data:image/jpeg;base64,${thumbnailData}` : ""),
    [thumbnailData]
  );

  // ==============================
  // 3. 썸네일 편집 페이지에서 돌아왔을 때 처리
  // ==============================

  /**
   * EditVideoThumbnail → AddVideoAnswer 로 다시 돌아올 때,
   * location.state.thumbnailUrl 에 새 썸네일이 실려 올 수 있다.
   * 이때도 normalizeThumbnailData를 통해 내부는 base64만 유지.
   */
  useEffect(() => {
    if (location.state?.thumbnailUrl) {
      setThumbnailData(normalizeThumbnailData(location.state.thumbnailUrl));
    }
  }, [location.state]);

  // ==============================
  // 4. 각종 핸들러
  // ==============================

  // 상단 X 버튼
  const handleClose = () => {
    if (isEdit && videoAnswerId) {
      // 수정 플로우인 경우 → 해당 답변 상세로 이동
      navigate(`/answers/${videoAnswerId}`, { replace: true });
    } else {
      // 새 답변 작성 플로우인 경우 → 주차 질문 목록으로
      navigate("/week-answer", { replace: true });
    }
  };

  /**
   * “영상 및 썸네일 수정” 버튼 클릭 시
   *
   * - /edit-video 페이지로 이동해서 영상/썸네일을 다시 편집할 수 있다.
   * - 이때도 영상은 File 객체가 아니라 videoUrl(문자열)을 넘겨준다.
   * - 편집 완료 후 다시 이 페이지로 돌아올 수 있도록 returnTo / returnState 정보를 함께 전달한다.
   */
  const handleEditVideo = () => {
    navigate("/edit-video", {
      state: {
        // 실제 영상은 URL로만 관리한다.
        videoUrl,
        // 썸네일은 data URL 형식이 편하므로 preview URL을 넘겨줌
        thumbnailUrl: thumbnailPreviewUrl,
        // 편집 이후 돌아올 라우트
        returnTo: "/answers/new",
        // 돌아올 때 복원할 값들
        returnState: {
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

  /**
   * “다시 찍기” 버튼 클릭 시
   *
   * - 이 영상 답변 플로우를 종료하고 다시 WeekAnswer(이번 주 질문 페이지)로 이동한다.
   * - replace: true 를 사용해서, 히스토리 스택에서 이 페이지를 교체한다.
   *   → 사용자가 뒤로가기를 눌렀을 때 다시 AddVideoAnswer로 돌아오지 않도록 하기 위함.
   */
  const handleRetake = () => {
    navigate("/week-answer", { replace: true });
  };

  /**
   * “영상 추가 완료” 버튼 클릭 시
   *
   * - 이미 /video-answer 업로드 API에서 영상 파일은 처리되어 있고,
   *   이 화면에서는 메타데이터(썸네일, 제목, 요약)만 수정한다고 가정한다.
   *
   * - 따라서 PUT /video-answer/{id} 요청 바디에는
   *   thumbnailUrl(순수 base64), title, summary 정도만 보낸다.
   *   (videoUrl은 백엔드가 기존 값을 유지)
   *
   *   예시: /video-answer/{id} 응답 스펙
   *   {
   *     "questionId": 0,
   *     "videoUrl": "string"
   *   }
   *
   *   → 실제 영상 URL 관리와 질문 ID 매핑은 백엔드에서 맡고,
   *     이 페이지는 UI를 위한 부가 정보만 붙여주는 역할에 집중.
   */
  const handleSubmit = async () => {
    if (!videoAnswerId) {
      alert("영상 정보가 없어 저장할 수 없습니다. 다시 시도해 주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 토큰: 프로젝트에 따라 키 이름이 다를 수 있어서 여러 후보를 확인
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwt");

      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // 백엔드에서 정의한 PUT /video-answer/{id} 요청 바디
      // - 이 페이지에서는 썸네일/제목/요약만 수정
      // - thumbnailUrl은 순수 base64 문자열만 전송
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

      // 응답에서 딱히 사용할 값이 없으면 파싱만 해도 되고,
      // 아예 res.json()을 생략해도 무방하다. (여기서는 형식 맞춰 한 번 호출)
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

          {/* 썸네일/영상 수정 버튼 (최초 생성 때만 노출) */}
          {!isEdit && (
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
          )}
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
          {/* 다시 찍기: WeekAnswer로 돌아감 (최초 생성일 때만 노출) */}
          {!isEdit && (
            <Button
              size="large"
              variant="default"
              type="button"
              onClick={handleRetake}
              disabled={isSubmitting}
            >
              다시 찍기
            </Button>
          )}

          {/* 영상 추가 완료: 메타데이터 저장 후 WeekAnswer로 이동 */}
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
