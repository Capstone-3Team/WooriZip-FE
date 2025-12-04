const STORAGE_KEY = "textSize"; // "default" | "large"

/**
 * 글자 크기 설정 적용
 * - html 태그에 text-size-large 클래스 토글
 * - localStorage에 현재 설정 저장
 */
export function applyTextSize(size) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // 기존 클래스 제거
  root.classList.remove("text-size-large");

  // "large"인 경우만 클래스 추가
  if (size === "large") {
    root.classList.add("text-size-large");
  }

  // 로컬스토리지에 저장
  try {
    localStorage.setItem(STORAGE_KEY, size);
  } catch (e) {
    console.error("failed to save textSize", e);
  }
}

/**
 * 앱 시작 시 저장된 글자 크기 설정을 html에 적용
 * - main.jsx 등에서 한 번 호출
 */
export function loadInitialTextSize() {
  if (typeof window === "undefined") return "default";

  let saved = "default";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "large" || raw === "default") {
      saved = raw;
    }
  } catch (e) {
    console.error("failed to load textSize", e);
  }

  applyTextSize(saved);
  return saved;
}
