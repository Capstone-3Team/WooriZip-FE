import React, { useEffect } from "react";

export function Modal({ isOpen, onClose, children }) {
  // ESC로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-[calc(100%-3rem)] max-w-sm rounded-2xl bg-bg-app px-6 py-6"
        onClick={(e) => e.stopPropagation()} // 카드 내부 클릭은 닫히지 않게
      >
        {children}
      </div>
    </div>
  );
}
