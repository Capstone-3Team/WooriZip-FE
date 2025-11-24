import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import FirstLoading from "@/pages/FirstLoading";
import Splash from "@/pages/Splash";
import Login from "@/pages/Login";
import SendEmail from "@/pages/SendEmail";
import ResetPassword from "@/pages/ResetPassword";

import TermsConsent from "@/pages/signup/TermsConsent";
import KakaoEmailConfirm from "@/pages/signup/KakaoEmailConfirm";
import EmailPasswordSignUp from "@/pages/signup/EmailPasswordSignUp";
import NicknameSignUp from "@/pages/signup/NicknameSignUp";
import ProfileImageStep from "@/pages/signup/ProfileImageStep";
import BirthdateStep from "@/pages/signup/BirthdateStep";
import PhoneNumberStep from "@/pages/signup/PhoneNumberStep";
import FamilyCodeStep from "@/pages/signup/FamilyCodeStep";
import FamilyConfirmStep from "@/pages/signup/FamilyConfirmStep";
import FamilyNameCreateStep from "@/pages/signup/FamilyNameCreateStep";
import Welcome from "@/pages/signup/Welcome";

import WeekAnswer from "@/pages/week-answer/WeekAnswer";
import WeeklyRecords from "@/pages/week-answer/WeeklyRecords";
import VideoAnswerDetail from "@/pages/week-answer/VideoAnswerDetail";
import VideoProcessingLoading from "@/pages/week-answer/VideoProcessingLoading";
import AddVideoAnswer from "@/pages/week-answer/AddVideoAnswer";
import EditVideoThumbnail from "@/pages/week-answer/EditVideoThumbnail";

// 로그인 여부를 판단하는 함수 (임시 버전)
function checkIsLoggedIn() {
  // 예: 로그인 성공 시 localStorage.setItem("isLoggedIn", "true") 해두고,
  // 여기서 그 값을 읽어와서 판단
  const flag = localStorage.getItem("isLoggedIn");
  return flag === "true";
}

function App() {
  // 최초 로딩(로고 화면) 단계인지 여부
  const [isBooting, setIsBooting] = useState(true);
  // 로그인 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 앱이 처음 켜졌을 때만 실행
    const timer = setTimeout(() => {
      const loggedIn = checkIsLoggedIn();
      setIsLoggedIn(loggedIn);
      setIsBooting(false); // 이제 라우팅 시작
    }, 1200); // 1.2초 정도 로고 보여주기 (원하면 숫자 조절)

    return () => clearTimeout(timer);
  }, []);

  // 1단계: 최초 로딩 화면
  if (isBooting) {
    return <FirstLoading />;
  }

  // 2단계: 라우팅
  return (
    <Routes>
      {/* 루트(/)로 왔을 때: 로그인 여부에 따라 분기 */}
      <Route
        path="/"
        element={
          isLoggedIn ? <Navigate to="/week-answer" replace /> : <Splash />
        }
      />

      {/* 스플래시 후 로그인 진입 경로 */}
      <Route path="/login" element={<Login />} />

      {/* 스플래시를 직접 보고 싶을 때를 위해 경로 하나 더 남겨두기 */}
      <Route path="/splash" element={<Splash />} />

      {/* 메인 페이지(주차별 답변 목록) */}
      <Route path="/week-answer" element={<WeekAnswer />} />
      <Route path="/weekly-records" element={<WeeklyRecords />} />
      <Route path="/answers/:answerId" element={<VideoAnswerDetail />} />
      <Route path="/answers/new/loading" element={<VideoProcessingLoading />} />
      <Route path="/answers/new" element={<AddVideoAnswer />} />
      <Route path="/answers/edit-video" element={<EditVideoThumbnail />} />

      {/* 비밀번호 재설정 - 이메일 전송 페이지 */}
      <Route path="/send-email" element={<SendEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* 회원가입 플로우 */}
      <Route path="/terms-consent" element={<TermsConsent />} />
      <Route path="/kakao-email-confirm" element={<KakaoEmailConfirm />} />
      <Route path="/signup/email-password" element={<EmailPasswordSignUp />} />
      <Route path="/signup/nickname" element={<NicknameSignUp />} />
      <Route path="/signup/profile" element={<ProfileImageStep />} />
      <Route path="/signup/birthdate" element={<BirthdateStep />} />
      <Route path="/signup/phone" element={<PhoneNumberStep />} />
      <Route path="/signup/family-code" element={<FamilyCodeStep />} />
      <Route path="/signup/family-confirm" element={<FamilyConfirmStep />} />
      <Route path="/signup/family-name" element={<FamilyNameCreateStep />} />
      <Route path="/welcome" element={<Welcome />} />

      {/* 그 외 모든 경로 → 로그인 상태에 따라 기본 경로로 리다이렉트 */}
      <Route
        path="*"
        element={
          <Navigate to={isLoggedIn ? "/week-answer" : "/splash"} replace />
        }
      />
    </Routes>
  );
}

export default App;
