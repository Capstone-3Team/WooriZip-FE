import Button from "@/components/buttons/Button";

export default function CommentInputBar({
  value,
  onChange,
  onSubmit,
  placeholder = "댓글을 입력해주세요",
  disabled = false, // 이번 주차 아님 여부 등
}) {
  // disabled일 때는 무조건 비활성 처리
  const isActive = !disabled && value.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isActive) return;
    onSubmit?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed left-0 right-0 bottom-0 z-30 bg-yellow-20 px-4 py-3"
    >
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            if (disabled) return; // ❗ 비활성화면 값 안 바뀌게만 막기
            onChange?.(e.target.value);
          }}
          placeholder={placeholder}
          readOnly={disabled} // ❗ disabled 대신 readOnly → 스타일 안변함
          className="flex-1 h-13 rounded-lg bg-bg-app px-3 text-sm text-text-main placeholder:text-gray-60 border border-yellow-main/40 outline-none"
        />
        <Button
          type="submit"
          size="small"
          variant={isActive ? "primary" : "notFocus"}
        >
          등록
        </Button>
      </div>
    </form>
  );
}
