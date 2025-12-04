import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css"; // ← 이 줄이 꼭 있어야 함!
import { loadInitialTextSize } from "@/utils/textSize";

// 🔹 카카오 SDK 초기화
if (window.Kakao && !window.Kakao.isInitialized()) {
  window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
  // console.log("Kakao initialized", window.Kakao.isInitialized());
}

loadInitialTextSize(); // 저장된 글자 크기 설정을 html에 먼저 적용

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
