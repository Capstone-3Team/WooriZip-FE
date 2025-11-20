import { Modal } from "./Modal";
import Button from "./buttons/Button";

/**
 * layout:
 *  - "vertical": 버튼 위아래 (계속하기 / 그만두기)
 *  - "inline": 버튼 한 줄 두 개 (취소 / 삭제 등)
 */
function ConfirmModal({
  isOpen,
  onClose,
  title,
  description,
  layout = "vertical", // "vertical" | "inline"
  // primary: 주 행동(삭제, 탈퇴, 그만두기 등)
  primaryLabel,
  onPrimary,
  // secondary: 보조 행동(계속하기, 취소 등)
  secondaryLabel,
  onSecondary,
}) {
  const handlePrimary = () => {
    onPrimary?.();
    onClose?.();
  };

  const handleSecondary = () => {
    onSecondary?.();
    onClose?.();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col">
        {/* 제목 */}
        <h2 className="text-lg font-bold text-text-main">{title}</h2>

        {/* 부가 설명 */}
        {description && (
          <p className="mt-2 text-sm text-gray-80 whitespace-pre-line">
            {description}
          </p>
        )}

        {/* 버튼 영역 */}
        {layout === "vertical" ? (
          // ===== 버튼 위아래 모달 =====
          <div className="mt-6 space-y-3">
            {/* 계속하기 (위, 흰색/외곽선 느낌) */}
            <Button size="large" variant="default" onClick={handleSecondary}>
              {secondaryLabel}
            </Button>

            {/* 그만두기 (아래, 다홍 accent) */}
            <Button size="large" variant="accent" onClick={handlePrimary}>
              {primaryLabel}
            </Button>
          </div>
        ) : (
          // ===== 버튼 한 줄 모달 =====
          <div className="mt-6 flex gap-3">
            {/* 취소 (왼쪽, 회색 테두리) */}
            <Button
              size="medium"
              variant="notFocus"
              className="flex-1"
              onClick={handleSecondary}
            >
              {secondaryLabel}
            </Button>

            {/* 삭제/탈퇴/확인 (오른쪽, accent) */}
            <Button
              size="medium"
              variant="accent"
              className="flex-1"
              onClick={handlePrimary}
            >
              {primaryLabel}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ConfirmModal;
