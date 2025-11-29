import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import ProgressBar from "@/components/ProgressBar";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

function ProfileImageStep() {
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 단계에서 받은 값들
  const {
    email,
    password,
    kakaoId,
    agreedTerms,
    nickname = "",
  } = location.state || {};

  // 선택한 프로필 이미지 (프론트 미리보기용 URL)
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  // ✅ 2) 컴포넌트 unmount 시 URL 정리 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      if (profileImageUrl) {
        URL.revokeObjectURL(profileImageUrl);
      }
    };
  }, [profileImageUrl]);

  // 프로필 영역 클릭 → 숨겨둔 파일 입력창 열기
  const handleSelectImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 파일 선택 시 호출
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 이전에 만든 object URL 있으면 정리
    if (profileImageUrl) {
      URL.revokeObjectURL(profileImageUrl);
    }

    const imageUrl = URL.createObjectURL(file);
    setProfileImageUrl(imageUrl);
  };

  const handleNext = () => {
    navigate("/signup/birthdate", {
      state: {
        email,
        password,
        kakaoId,
        agreedTerms,
        nickname,
        profileImageUrl, // 선택 안 했으면 null
      },
    });
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      {/* 헤더 */}
      <Header
        bgClassName="bg-bg-app"
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-8 h-8" />
        }
        onLeftClick={() => navigate(-1)}
        leftAriaLabel="뒤로가기"
      />

      {/* 본문 */}
      <main className="flex-1 px-6 pt-4 pb-8 flex flex-col">
        <section>
          {/* 온보딩 3 / 7 단계라고 가정 */}
          <ProgressBar currentStep={3} totalSteps={7} className="mb-8" />

          <h1 className="text-xl font-semibold text-text-main leading-snug">
            프로필 이미지를 선택해주세요
          </h1>
          <p className="mt-2 text-sm text-gray-60">
            활동할 프로필 이미지를 선택하거나 나중에 설정할 수 있어요.
          </p>
        </section>

        {/* 프로필 이미지 선택 영역 */}
        <section className="mt-10 flex flex-col items-center">
          <button
            type="button"
            onClick={handleSelectImage}
            className="w-36 h-36 rounded-full bg-gray-20 flex items-center justify-center overflow-hidden"
            aria-label="프로필 이미지 선택"
          >
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="선택한 프로필 이미지"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src="/icons/user.svg"
                alt="기본 프로필 아이콘"
                className="w-20 h-20 opacity-70"
              />
            )}
          </button>

          {/* 숨겨진 파일 입력 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </section>

        {/* 별명 표시 영역 (읽기 전용) */}
        <section className="mt-10">
          <label
            htmlFor="nickname"
            className="block text-sm font-semibold text-text-main mb-2"
          >
            별명
          </label>

          <TextInput
            name="nickname"
            id="nickname"
            value={nickname}
            placeholder="별명 입력"
            readOnly
          />
        </section>

        {/* 하단 버튼 */}
        <div className="mt-auto">
          <Button
            size="large"
            variant="primary"
            type="button"
            onClick={handleNext}
          >
            다음
          </Button>
        </div>
      </main>
    </div>
  );
}

export default ProfileImageStep;
