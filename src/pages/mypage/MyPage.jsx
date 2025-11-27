import Header from "@/layouts/Header";
import BottomNav from "@/layouts/BottomNav";
import { useNavigate } from "react-router-dom";

function MyPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg-app pb-24">
      {/* 상단 헤더 */}
      <Header variant="plain" title="내 정보" />

      <main className="px-4 pt-4 pb-10 overflow-y-auto">
        {/* 내 정보 카드 */}
        <section className="rounded-xl bg-yellow-20 shadow-[0_2px_6px_rgba(0,0,0,0.08)] p-4">
          {/* 프로필 영역 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 프로필 아이콘 자리 */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-20">
                {/* 나중에 실제 아이콘/이미지로 교체 */}
                <span className="text-2xl text-gray-40">👤</span>
              </div>

              <div className="flex flex-col">
                <span className="text-lg font-semibold text-text-main">
                  귀요미
                </span>
              </div>
            </div>

            {/* 프로필 수정 버튼 */}
            <button
              type="button"
              aria-label="프로필 편집"
              className="p-1"
              onClick={() => navigate("/mypage/profile")}
            >
              {/* 아이콘은 프로젝트에 맞게 교체 */}
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
              우주 최강 가족
            </span>
            <img src="/icons/arrow-right.svg" alt="" className="h-5 w-5" />
          </button>
        </section>

        {/* 기타 설정 */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-text-main">기타 설정</h2>

          <div className="mt-3 overflow-hidden rounded-xl bg-yellow-20">
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

          <div className="mt-3 overflow-hidden rounded-xl bg-yellow-20">
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
