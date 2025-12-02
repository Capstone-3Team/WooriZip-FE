import { useEffect, useState } from "react";
import Header from "@/layouts/Header";
import BottomNav from "@/layouts/BottomNav";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function MyPage() {
  const navigate = useNavigate();

  const [mainData, setMainData] = useState({
    profileImage: null,
    nickname: "",
    familyName: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // 마이페이지 메인 정보 조회 (/mypage/main)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchMyPageMain = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const res = await fetch(`${API_BASE_URL}/mypage/main`, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("마이페이지 정보를 불러오지 못했습니다.");
        }

        const data = await res.json();
        // Swagger 예시: { profileImage, nickname, familyName }
        setMainData({
          profileImage: data.profileImage || null,
          nickname: data.nickname || "",
          familyName: data.familyName || "",
        });
      } catch (error) {
        console.error(error);
        setErrorMessage("마이페이지 정보를 불러오지 못했어요.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPageMain();
  }, [navigate]);

  const displayNickname = isLoading
    ? "불러오는 중..."
    : mainData.nickname || "내 이름";

  const displayFamilyName = mainData.familyName || "우리 가족";

  return (
    <div className="min-h-screen bg-yellow-20 pb-24">
      {/* 상단 헤더 */}
      <Header variant="plain" title="내 정보" />

      <main className="px-4 pt-4 pb-10 overflow-y-auto">
        {/* 내 정보 카드 */}
        <section className="rounded-xl bg-bg-app shadow-[0_2px_6px_rgba(0,0,0,0.08)] p-4">
          {/* 프로필 영역 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 프로필 이미지 */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-20 overflow-hidden">
                {mainData.profileImage ? (
                  <img
                    src={mainData.profileImage}
                    alt="프로필 이미지"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // blob URL 깨지거나 로딩 실패 시 기본 아이콘으로 대체
                      e.currentTarget.src = "/icons/user.svg";
                    }}
                  />
                ) : (
                  <img
                    src="/icons/user.svg"
                    alt="기본 프로필"
                    className="h-8 w-8 opacity-70"
                  />
                )}
              </div>

              <div className="flex flex-col">
                <span className="text-lg font-semibold text-text-main">
                  {displayNickname}
                </span>
                {errorMessage && (
                  <span className="mt-1 text-xs text-red-500">
                    {errorMessage}
                  </span>
                )}
              </div>
            </div>

            {/* 프로필 수정 버튼 */}
            <button
              type="button"
              aria-label="프로필 편집"
              className="p-1"
              onClick={() => navigate("/mypage/profile")}
            >
              <img
                src="/icons/edit-single.svg"
                alt="프로필 편집"
                className="h-5 w-5"
              />
            </button>
          </div>

          {/* 가족 카드 */}
          <button
            type="button"
            className="mt-5 flex w-full items-center justify-between rounded-xl bg-yellow-main px-4 py-3"
            onClick={() => navigate("/mypage/family-detail")}
          >
            <span className="text-sm font-medium text-text-main">
              {displayFamilyName}
            </span>
            <img src="/icons/arrow-right.svg" alt="" className="h-5 w-5" />
          </button>
        </section>

        {/* 기타 설정 */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-text-main">기타 설정</h2>

          <div className="mt-3 overflow-hidden rounded-xl bg-bg-app">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-4"
              onClick={() => navigate("/settings/text-size")}
            >
              <span className="text-sm font-medium text-text-main">
                글자 크기 설정
              </span>
              <img src="/icons/arrow-right.svg" alt="" className="h-5 w-5" />
            </button>

            <div className="h-0.5 bg-white/60" />

            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-4"
              onClick={() => navigate("/settings/tts")}
            >
              <span className="text-sm font-medium text-text-main">
                TTS 음성 설정
              </span>
              <img src="/icons/arrow-right.svg" alt="" className="h-5 w-5" />
            </button>
          </div>
        </section>

        {/* 계정 및 권한 */}
        <section className="mt-8 mb-4">
          <h2 className="text-lg font-semibold text-text-main">계정 및 권한</h2>

          <div className="mt-3 overflow-hidden rounded-xl bg-bg-app">
            {/* 버전 정보 */}
            <div className="flex w-full items-center justify-between px-4 py-4">
              <span className="text-sm font-medium text-text-main">
                1.4.1 버전
              </span>
              <span className="text-xs text-gray-60">최신 버전입니다</span>
            </div>

            <div className="h-px bg-white/60" />

            {/* 개인정보 처리 방침 */}
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-4"
            >
              <span className="text-sm font-medium text-text-main">
                개인 정보 처리 방침
              </span>
              <img src="/icons/arrow-right.svg" alt="" className="h-5 w-5" />
            </button>

            <div className="h-px bg-white/60" />

            {/* 이용 약관 */}
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-4"
            >
              <span className="text-sm font-medium text-text-main">
                이용 약관
              </span>
              <img src="/icons/arrow-right.svg" alt="" className="h-5 w-5" />
            </button>
          </div>
        </section>
      </main>

      {/* 하단 내비게이션 */}
      <BottomNav />
    </div>
  );
}

export default MyPage;
