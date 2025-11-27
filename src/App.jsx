import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 온보딩, 로그인 관련
import FirstLoading from "@/pages/FirstLoading";
import Splash from "@/pages/Splash";
import Login from "@/pages/Login";
import SendEmail from "@/pages/SendEmail";
import ResetPassword from "@/pages/ResetPassword";

// 회원가입 플로우 관련
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

// 주차별 답변 관련
import WeekAnswer from "@/pages/week-answer/WeekAnswer";
import WeeklyRecords from "@/pages/week-answer/WeeklyRecords";
import VideoAnswerDetail from "@/pages/week-answer/VideoAnswerDetail";
import VideoProcessingLoading from "@/pages/week-answer/VideoProcessingLoading";
import AddVideoAnswer from "@/pages/week-answer/AddVideoAnswer";
import EditVideoThumbnail from "@/pages/week-answer/EditVideoThumbnail";

// 일상 기록 관련
import DailyRecords from "./pages/daily/DailyRecords";
import NewDailyPost from "@/pages/daily/NewDailyPost";

// 아카이브 관련
import ArchivePage from "@/pages/archive/ArchivePage";
import MemberArchivePage from "@/pages/archive/MemberArchivePage";
import DailyArchivePage from "@/pages/archive/DailyArchivePage";
import DailyArchiveDetailPage from "@/pages/archive/DailyArchiveDetailPage";
import MemberArchiveGridPage from "@/pages/archive/MemberArchiveGridPage";
import MemberArchiveDetailPage from "@/pages/archive/MemberArchiveDetailPage";
import PetArchiveGridPage from "./pages/archive/PetArchiveGridPage";
import PetArchiveDetailPage from "./pages/archive/PetArchiveDetailPage";

// 쪽지함 관련
import MessagesPage from "@/pages/messages/MessagesPage";
import MessageDetailPage from "@/pages/messages/MessageDetailPage";
import MessageWritePage from "@/pages/messages/MessageWritePage";

// 마이페이지 관련
import MyPage from "@/pages/mypage/MyPage";
import ProfileSettingsPage from "@/pages/mypage/ProfileSettingsPage";
import ChangePasswordCurrent from "@/pages/mypage/ChangePasswordCurrent";
import ChangeResetPassword from "@/pages/mypage/ChangeResetPassword";
import EditEmailPage from "./pages/mypage/EditEmailPage";
import EditPhonePage from "./pages/mypage/EditPhonePage";
import EditNicknamePage from "./pages/mypage/EditNicknamePage";
import FamilyDetailPage from "./pages/mypage/FamilyDetailPage";
import EditFamilyNicknamePage from "./pages/mypage/EditFamilyNicknamePage";
import TextSizeSettingsPage from "./pages/mypage/TextSizeSettingsPage";
import TTSVoiceSettingsPage from "./pages/mypage/TTSVoiceSettingsPage";

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

      {/* 메인 페이지(주차별 답변 목록) */}
      <Route path="/week-answer" element={<WeekAnswer />} />
      <Route path="/weekly-records" element={<WeeklyRecords />} />
      <Route path="/answers/:answerId" element={<VideoAnswerDetail />} />
      <Route path="/answers/new/loading" element={<VideoProcessingLoading />} />
      <Route path="/answers/new" element={<AddVideoAnswer />} />
      <Route path="/edit-video" element={<EditVideoThumbnail />} />

      {/* 일상 기록 페이지 */}
      <Route path="/daily" element={<DailyRecords />} />
      <Route path="/daily/new" element={<NewDailyPost />} />

      {/* 아카이브(전체 보관함) 페이지 */}
      <Route path="/archive" element={<ArchivePage />} />
      <Route path="/archive/members" element={<MemberArchivePage />} />
      <Route path="/archive/daily" element={<DailyArchivePage />} />
      <Route
        path="/archive/daily/detail"
        element={<DailyArchiveDetailPage />}
      />
      <Route
        path="/archive/members/:memberId"
        element={<MemberArchiveGridPage />}
      />
      <Route
        path="/archive/members/:memberId/detail"
        element={<MemberArchiveDetailPage />}
      />
      <Route path="/archive/pets" element={<PetArchiveGridPage />} />
      <Route path="/archive/pets/detail" element={<PetArchiveDetailPage />} />

      {/* 쪽지함 페이지 */}
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/messages/:id" element={<MessageDetailPage />} />
      <Route path="/messages/new" element={<MessageWritePage />} />

      {/* 내 정보 페이지 */}
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/mypage/profile" element={<ProfileSettingsPage />} />
      <Route
        path="/mypage/change-password"
        element={<ChangePasswordCurrent />}
      />
      <Route path="/mypage/reset-password" element={<ChangeResetPassword />} />
      <Route path="/mypage/edit-email" element={<EditEmailPage />} />
      <Route path="/mypage/edit-phone" element={<EditPhonePage />} />
      <Route path="/mypage/edit-nickname" element={<EditNicknamePage />} />
      <Route path="/mypage/family-detail" element={<FamilyDetailPage />} />
      <Route
        path="/mypage/edit-family-name"
        element={<EditFamilyNicknamePage />}
      />
      <Route path="/settings/text-size" element={<TextSizeSettingsPage />} />
      <Route path="/settings/tts" element={<TTSVoiceSettingsPage />} />

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
