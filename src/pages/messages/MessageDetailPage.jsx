import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import Button from "@/components/buttons/Button";

export default function MessageDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 목록/글쓰기 페이지에서 넘어올 때 state로 값 넘겨줄 수 있게 처리
  const {
    senderName = "나동생",
    content = `상세내용 작성입니다.
상대방이 나에게 보낸 쪽지를 읽을 수 있어요.
문자 단위로 줄 바꿈 적용해주세요.`,
    dateLabel = "2025. 11. 27.",
  } = location.state || {};

  const handleBack = () => navigate(-1);
  const handleConfirm = () => navigate(-1);

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      {/* 헤더 – EditNicknamePage와 동일한 레이아웃 */}
      <Header
        bgClassName="bg-bg-app"
        variant="solid"
        title="쪽지함"
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-8 h-8" />
        }
        onLeftClick={handleBack}
        leftAriaLabel="뒤로가기"
      />

      <main className="flex-1 px-6 pt-4 pb-6 flex flex-col">
        {/* 쪽지 카드 */}
        <section className="mt-4 flex-1">
          <div className="relative w-full h-full bg-yellow-20 px-6 pt-8 pb-8">
            {/* 오른쪽 위 접힌 모서리 */}
            <div className="absolute right-0 top-0">
              {/* 바깥은 진한 노랑(접힌 뒷면) */}
              <div className="w-8 h-8 bg-yellow-main relative overflow-hidden">
                {/* 위·오른쪽은 카드 배경색으로 잘라내서
          꼭짓점이 안쪽을 향하는 삼각형처럼 보이게 */}
                <div className="w-full h-full bg-bg-app [clip-path:polygon(100%_0,0_0,100%_100%)]" />
              </div>
            </div>

            {/* 보낸 사람 이름 */}
            <h2 className="text-lg font-semibold text-text-main">
              {senderName}
            </h2>

            {/* 내용 */}
            <p className="mt-6 text-sm leading-relaxed text-text-main whitespace-pre-line">
              {content}
            </p>

            {/* 날짜 */}
            <p className="mt-8 text-xs text-text-main text-right">
              {dateLabel}
            </p>
          </div>
        </section>

        {/* 하단 버튼 – EditNicknamePage의 large 버튼 그대로 사용 */}
        <div className="mt-8">
          <Button
            size="large"
            variant="primary"
            type="button"
            onClick={handleConfirm}
          >
            확인
          </Button>
        </div>
      </main>
    </div>
  );
}
