import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "@/layouts/Header";
import ConfirmModal from "@/components/ConfirmModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/icons/user.svg";
            }}
          />
        ) : (
          <img src="/icons/user.svg" alt="" className="w-16 h-16 opacity-70" />
        )}
      </div>
    </button>
  );
}

function formatBirth(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${y}. ${m}. ${d}`;
}

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);

  /** 프로필 이미지 (캡쳐로 카메라/앨범 열기) */
  const fileInputRef = useRef(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  const [profile, setProfile] = useState({
    nickname: "",
    email: "",
    birth: "",
    phone: "",
  });

  const [isLoading, setIsLoading] = useState(true);

  // 프로필 이미지 업로드 상태
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // 프로필 조회
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/mypage/profile`, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("프로필 정보를 불러오지 못했습니다.");
        }

        const data = await res.json();
        setProfile({
          nickname: data.nickname || "",
          email: data.email || "",
          birth: formatBirth(data.birth),
          phone: data.phone || "",
        });
        setProfileImageUrl(data.profileImage || null);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleProfileClick = () => {
    fileInputRef.current?.click();
  };

  // 프로필 이미지 변경 (파일 선택)
  const handleProfileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 화면 미리보기용 URL 갱신
    const previewUrl = URL.createObjectURL(file);
    setProfileImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return previewUrl;
    });

    // 실제 이미지 변경 API 호출 (/mypage/profile-image?image=<파일이름>)
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsUploadingImage(true);
    setUploadError("");

    try {
      const formData = new FormData();
      // ⚠️ key 이름을 백엔드 @RequestPart/@RequestParam 이름이랑 맞춰야 함
      // 예: @RequestPart("image") MultipartFile image 이런 식이면 "image"
      formData.append("image", file);

      const res = await fetch(`${API_BASE_URL}/mypage/profile-image`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type 은 넣지 말기! (브라우저가 boundary 포함해서 자동 설정)
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("프로필 이미지를 변경하지 못했습니다.");
      }

      // 필요하면 여기서 /mypage/profile 다시 호출해서 최신 데이터로 동기화
    } catch (error) {
      console.error(error);
      setUploadError("프로필 이미지를 변경하지 못했어요.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // unmount 시 미리보기 URL 정리
  useEffect(
    () => () => {
      if (profileImageUrl) URL.revokeObjectURL(profileImageUrl);
    },
    [profileImageUrl]
  );

  /** 수정 페이지 이동 */
  const goEditNickname = () => navigate("/mypage/edit-nickname");
  const goChangePassword = () => navigate("/mypage/change-password");
  const goEditPhone = () => navigate("/mypage/edit-phone");

  /** 모달 상태 */
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        await fetch(`${API_BASE_URL}/mypage/logout`, {
          method: "POST",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem("accessToken");
      setIsLogoutOpen(false);
      navigate("/login");
    }
  };

  const handleWithdraw = () => {
    // TODO: 회원 탈퇴 API 연동
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

            {isUploadingImage && (
              <p className="mt-1 text-xs text-gray-60">
                프로필 이미지를 변경하는 중이에요…
              </p>
            )}
            {uploadError && (
              <p className="mt-1 text-xs text-red-500">{uploadError}</p>
            )}

            {/* 별명 가운데 정렬 + 아이콘은 오른쪽에 살짝 붙이기 */}
            <div className="w-full text-center">
              <div className="relative inline-block">
                <span className="text-xl font-semibold text-text-main">
                  {isLoading ? "불러오는 중..." : profile.nickname}
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
            {/* 이메일 (읽기 전용, 수정 아이콘 제거) */}
            <div className="flex items-center gap-4">
              <span className="w-20 text-md font-medium text-text-main">
                이메일
              </span>
              <span className="flex-1 text-sm text-text-main">
                {profile.email}
              </span>
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
              <span className="flex-1 text-sm text-text-main">
                {profile.birth}
              </span>
            </div>

            {/* 휴대폰번호 */}
            <div className="flex items-center gap-4">
              <span className="w-20 text-md font-medium text-text-main">
                휴대폰번호
              </span>
              <span className="flex-1 text-sm text-text-main">
                {profile.phone}
              </span>
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

        {/* 로그아웃 / 회원탈퇴 (가운데 정렬, 가족탈퇴 제거) */}
        <section className="flex justify-center items-center gap-4 text-xs text-gray-80">
          <button type="button" onClick={() => setIsLogoutOpen(true)}>
            로그아웃
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

      {/* 회원 탈퇴 모달 (가족 탈퇴 모달 제거됨) */}
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
