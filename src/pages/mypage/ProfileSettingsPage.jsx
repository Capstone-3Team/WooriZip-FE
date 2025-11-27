import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "@/layouts/Header";
import ConfirmModal from "@/components/ConfirmModal";

// 프로필 아바타 (variant === "big" 사용)
function ProfileAvatar({ imageUrl, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="프로필 사진 변경"
      className="relative"
    >
      <div className="w-28 h-28 rounded-full bg-gray-20 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <img src="/icons/user.svg" alt="" className="w-16 h-16 opacity-70" />
        )}
      </div>
    </button>
  );
}

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);

  /** 프로필 이미지 (캡쳐로 카메라/앨범 열기) */
  const fileInputRef = useRef(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  const handleProfileClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setProfileImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });

    // TODO: 여기에서 프로필 업로드 API 호출
  };

  useEffect(
    () => () => {
      if (profileImageUrl) URL.revokeObjectURL(profileImageUrl);
    },
    [profileImageUrl]
  );

  /** 더미 데이터 (나중에 실제 유저 정보로 대체) */
  const nickname = "귀요미";
  const email = "1234@naver.com";
  const birth = "2000. 10. 10";
  const phone = "010-1234-5678";

  /** 수정 페이지 이동 */
  const goEditNickname = () => navigate("/mypage/edit-nickname");
  const goEditEmail = () => navigate("/mypage/edit-email");
  const goChangePassword = () => navigate("/mypage/change-password");
  const goEditPhone = () => navigate("/mypage/edit-phone");

  /** 모달 상태 */
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLeaveFamilyOpen, setIsLeaveFamilyOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const handleLogout = () => {
    // TODO: 로그아웃 로직
    setIsLogoutOpen(false);
  };
  const handleLeaveFamily = () => {
    // TODO: 가족 탈퇴 로직
    setIsLeaveFamilyOpen(false);
  };
  const handleWithdraw = () => {
    // TODO: 회원 탈퇴 로직
    setIsWithdrawOpen(false);
  };

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <Header
        variant="solid"
        title="프로필 설정"
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-6 h-6" />
        }
        onLeftClick={handleBack}
        leftAriaLabel="뒤로가기"
      />

      <main className="flex-1 flex flex-col px-6 pt-4 pb-10 gap-8 overflow-y-auto">
        {/* 프로필 + 별명 */}
        <section>
          <div className="flex flex-col items-center gap-4">
            <ProfileAvatar
              imageUrl={profileImageUrl}
              onClick={handleProfileClick}
            />

            {/* 실제 파일 input (모바일에서 앨범/카메라) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handleProfileChange}
            />

            {/* 별명 가운데 정렬 + 아이콘은 오른쪽에 살짝 붙이기 */}
            <div className="w-full text-center">
              <div className="relative inline-block">
                <span className="text-xl font-semibold text-text-main">
                  {nickname}
                </span>

                <button
                  type="button"
                  onClick={goEditNickname}
                  aria-label="별명 수정"
                  className="absolute -right-5 top-1/2 -translate-y-1/2"
                >
                  <img
                    src="/icons/edit-single.svg"
                    alt="수정"
                    className="w-4 h-4"
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 기본정보 카드 */}
        <section className="rounded-xl bg-yellow-20 px-5 py-6 pb-10">
          <h2 className="text-xl font-semibold text-text-main mb-8">
            기본정보
          </h2>

          <div className="flex flex-col gap-5">
            {/* 이메일 */}
            <div className="flex items-center gap-4">
              <span className="w-20 text-md font-medium text-text-main">
                이메일
              </span>
              <span className="flex-1 text-sm text-text-main">{email}</span>
              <button
                type="button"
                onClick={goEditEmail}
                aria-label="이메일 수정"
                className="p-1"
              >
                <img
                  src="/icons/edit-single.svg"
                  alt="수정"
                  className="w-4 h-4"
                />
              </button>
            </div>

            {/* 비밀번호 */}
            <div className="flex items-center gap-4">
              <span className="w-20 text-md font-medium text-text-main">
                비밀번호
              </span>
              <button
                type="button"
                onClick={goChangePassword}
                className="text-sm text-gray-60 underline-offset-2"
              >
                비밀번호 변경하기
              </button>
            </div>

            {/* 생년월일 */}
            <div className="flex items-center gap-4">
              <span className="w-20 text-md font-medium text-text-main">
                생년월일
              </span>
              <span className="flex-1 text-sm text-text-main">{birth}</span>
            </div>

            {/* 휴대폰번호 */}
            <div className="flex items-center gap-4">
              <span className="w-20 text-md font-medium text-text-main">
                휴대폰번호
              </span>
              <span className="flex-1 text-sm text-text-main">{phone}</span>
              <button
                type="button"
                onClick={goEditPhone}
                aria-label="휴대폰번호 수정"
                className="p-1"
              >
                <img
                  src="/icons/edit-single.svg"
                  alt="수정"
                  className="w-4 h-4"
                />
              </button>
            </div>
          </div>
        </section>

        {/* 로그아웃 / 가족탈퇴 / 회원탈퇴 */}
        <section className="flex justify-center gap-4 text-xs text-gray-80">
          <button type="button" onClick={() => setIsLogoutOpen(true)}>
            로그아웃
          </button>
          <span>|</span>
          <button type="button" onClick={() => setIsLeaveFamilyOpen(true)}>
            가족탈퇴
          </button>
          <span>|</span>
          <button type="button" onClick={() => setIsWithdrawOpen(true)}>
            회원탈퇴
          </button>
        </section>
      </main>

      {/* 로그아웃 모달 */}
      <ConfirmModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        layout="inline"
        title="로그아웃"
        description="로그아웃 하시겠어요?"
        primaryLabel="확인"
        secondaryLabel="취소"
        onPrimary={handleLogout}
      />

      {/* 가족 탈퇴 모달 */}
      <ConfirmModal
        isOpen={isLeaveFamilyOpen}
        onClose={() => setIsLeaveFamilyOpen(false)}
        layout="inline"
        title="가족 탈퇴"
        description="정말 우주 최강 가족에서 탈퇴하시겠어요?"
        primaryLabel="탈퇴"
        secondaryLabel="취소"
        onPrimary={handleLeaveFamily}
      />

      {/* 회원 탈퇴 모달 */}
      <ConfirmModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        layout="inline"
        title="회원 탈퇴"
        description="우리.zip 서비스에서 탈퇴하시겠어요?"
        primaryLabel="탈퇴"
        secondaryLabel="취소"
        onPrimary={handleWithdraw}
      />
    </div>
  );
}
