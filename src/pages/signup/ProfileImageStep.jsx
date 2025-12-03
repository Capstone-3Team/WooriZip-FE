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
  // - location.state 안에 객체 형태로 담겨 있음
  const {
    email,
    password,
    kakaoId,
    agreedTerms,
    nickname = "",
    inviteCode,
  } = location.state || {};

  // -----------------------------
  // 1) useState: 화면에 보여줄 이미지 URL
  // -----------------------------

  const [profileImageFile, setProfileImageFile] = useState(null); // 실제 File 객체
  const [profileImageUrl, setProfileImageUrl] = useState(null); // 미리보기용 URL

  // -----------------------------
  // 2) useRef: 숨겨진 <input type="file"> DOM에 직접 접근하기
  // -----------------------------
  // - ref는 "DOM 요소나 값에 대한 변경 가능한 상자" 느낌
  // - ref.current 에 실제 input 엘리먼트가 들어감
  // - state와 달리 ref 값이 바뀌어도 리렌더링이 일어나지 않음
  // 여기서는 "버튼을 클릭했을 때, 실제로는 숨겨진 input을 클릭"하기 위해 사용.
  const fileInputRef = useRef(null);

  // -----------------------------
  // 3) useEffect: 프로필 이미지 URL 정리(정리(cleanup) 로직)
  // -----------------------------
  // - URL.createObjectURL(file) 로 만든 URL은 브라우저 메모리를 차지하기 때문에
  //   더 이상 쓰지 않을 때 URL.revokeObjectURL로 해제해줘야 함.
  // - 이 effect는 profileImageUrl 이 바뀌거나, 컴포넌트가 unmount 될 때 실행.
  useEffect(() => {
    // effect의 반환값으로 함수를 주면 "cleanup 함수"가 됨
    // → 다음 번 effect 실행 직전에 한 번,
    //   그리고 컴포넌트가 화면에서 사라질 때 한 번 호출됨.
    return () => {
      if (profileImageUrl) {
        URL.revokeObjectURL(profileImageUrl);
      }
    };
    // dependency 배열에 profileImageUrl을 넣었기 때문에
    // profileImageUrl 이 바뀔 때마다 이 effect가 다시 등록됨.
    // (그리고 바뀌기 직전에 위 cleanup 함수가 먼저 호출됨)
  }, [profileImageUrl]);

  // 프로필 영역 클릭 → 숨겨둔 파일 입력창 열기
  const handleSelectImage = () => {
    // ref.current에 실제 <input> DOM 노드가 들어 있음.
    // 존재할 때만 .click() 호출해서 파일 선택창 오픈.
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 파일 선택 시 호출
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 이전에 만든 object URL 있으면 먼저 정리
    if (profileImageUrl) {
      URL.revokeObjectURL(profileImageUrl);
    }

    // 실제 파일 저장
    setProfileImageFile(file);

    // 새로 선택한 파일 기준으로 미리보기 URL 생성 후 상태에 저장
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
        profileImageUrl, // 미리보기용
        profileImageFile, // 실제 업로드할 File
        inviteCode,
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
            {/*사용자가 선택한 이미지가 있을 때: 그 이미지를 동그란 영역에 꽉 차게 표시*/}
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="선택한 프로필 이미지"
                className="w-full h-full object-cover"
              />
            ) : (
              // 아직 선택하지 않았을 때: 기본 유저 아이콘 표시
              <img
                src="/icons/user.svg"
                alt="기본 프로필 아이콘"
                className="w-20 h-20 opacity-70"
              />
            )}
          </button>

          {/* 실제 파일 선택 input (화면에서는 숨겨두고 ref로만 접근) */}
          <input
            ref={fileInputRef} // 이 ref 덕분에 JS 코드에서 .click() 호출 가능
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
