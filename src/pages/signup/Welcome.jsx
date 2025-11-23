import { useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/buttons/Button";

function Welcome() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    // 가족코드 공유 버튼을 보여줄지 여부 (가족 생성 플로우일 때 true)
    showShareButton = false,
    familyCode,
  } = location.state || {};

  const handleStart = () => {
    // 메인 페이지로 이동 (이미 WeekAnswer route 만들어둔 거 기준)
    navigate("/week-answer");
  };

  const handleShareCode = async () => {
    if (!familyCode) {
      alert("가족 코드가 아직 발급되지 않았어요. 추후 API 연동 시 연결할게요.");
      return;
    }

    try {
      await navigator.clipboard.writeText(familyCode);
      alert(
        "가족 코드가 복사되었어요. 카카오톡에서 붙여넣어 가족에게 공유해 주세요."
      );
      // TODO: 카카오톡 공유 API 연동
    } catch (error) {
      console.error(error);
      alert("복사에 실패했어요. 다시 시도해 주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col items-center px-6 pb-10">
      {/* 가운데 콘텐츠 */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-text-main mb-8">반가워요!</h1>

        <div className="w-40 h-40 bg-gray-20 flex items-center justify-center">
          <span className="text-base text-text-main">로고</span>
        </div>

        <p className="mt-8 text-center text-xl font-semibold text-text-main leading-relaxed">
          우리.zip에서
          <br />
          가족과의 추억을 저장해보세요!
        </p>
      </main>

      {/* 하단 버튼 영역 */}
      <div className="w-full space-y-3">
        {showShareButton && (
          <Button
            size="large"
            variant="accent"
            type="button"
            onClick={handleShareCode}
          >
            가족 코드 공유하기
          </Button>
        )}

        <Button
          size="large"
          variant="primary"
          type="button"
          onClick={handleStart}
        >
          시작하기
        </Button>
      </div>
    </div>
  );
}

export default Welcome;
