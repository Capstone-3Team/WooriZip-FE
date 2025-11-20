import React from "react";

function CommentInputBar({
  value,
  onChange,
  onSubmit,
  placeholder = "답글을 입력해주세요",
  disabled = false, // 전체 막고 싶을 때
  className = "",
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;

    const text = value?.trim();
    if (!text) return;
    onSubmit?.(text);
  };

  const canSend = !disabled && value?.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className={`fixed bottom-0 left-0 right-0 bg-yellow-main ${className}`}
    >
      <div className="px-4 py-2 flex items-center gap-3">
        {/* 입력창 */}
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 h-11 rounded-xl bg-bg-app border border-yellow-main/40
                     px-3 text-sm text-text-main placeholder:text-gray-40
                     focus:outline-none focus:border-yellow-main"
        />

        {/* 전송 버튼 (가로로 넉넉하게) */}
        <button
          type="submit"
          disabled={!canSend}
          className={`h-11 px-4 rounded-xl border text-sm font-medium
                      transition-colors duration-150
                      ${
                        canSend
                          ? "bg-bg-app border-text-main text-text-main"
                          : "bg-bg-app border-gray-40 text-gray-60 cursor-not-allowed"
                      }`}
        >
          전송
        </button>
      </div>
    </form>
  );
}

export default CommentInputBar;
