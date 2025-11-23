import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/layouts/Header";
import Button from "@/components/buttons/Button";

const REQUIRED_TERMS = [
  { id: "service", label: "[필수] 서비스 이용약관" },
  { id: "privacy", label: "[필수] 개인정보 수집 및 이용 동의" },
  { id: "thirdParty", label: "[필수] 개인정보 제3자 정보제공 동의" },
];

function TermsConsent() {
  const navigate = useNavigate();
  const location = useLocation();

  // 카카오 로그인에서 넘어온 값 (일반 회원가입이면 undefined)
  const { kakaoId, email } = location.state || {};

  const [checked, setChecked] = useState({
    service: false,
    privacy: false,
    thirdParty: false,
  });

  const allRequiredChecked = Object.values(checked).every(Boolean);

  const handleToggleAll = () => {
    const next = !allRequiredChecked;
    setChecked({
      service: next,
      privacy: next,
      thirdParty: next,
    });
  };

  const handleToggleOne = (id) => {
    setChecked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpenDetail = (id) => {
    // TODO: 약관 상세 페이지로 이동하고 싶으면 여기서 navigate 사용
    // 예: navigate(`/terms/${id}`);
    console.log("open terms detail:", id);
  };

  const handleAgree = () => {
    if (!allRequiredChecked) return;
    if (kakaoId) {
      // 카카오 신규 회원 플로우: 이메일 확인 페이지로
      navigate("/kakao-email-confirm", {
        state: {
          kakaoId,
          email,
          agreedTerms: checked,
        },
      });
    } else {
      // 일반 회원가입 플로우: 이메일 및 비밀번호 설정 페이지로
      navigate("/signup/email-password", { state: { agreedTerms: checked } });
    }
  };

  const agreeButtonVariant = allRequiredChecked ? "primary" : "notFocus";

  const renderCheckIcon = (active) => (
    <span
      className={
        active
          ? "inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-main text-bg-app text-xs"
          : "inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-40 text-gray-40 text-xs"
      }
    >
      ✓
    </span>
  );

  const renderArrowIcon = () => (
    <img
      src="/icons/arrow-right.svg" // 아이콘 파일 경로
      alt=""
      className="w-6 h-6 text-gray-60"
    />
  );

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
      <main className="flex-1 mt-4 px-6 pt-6 pb-8 flex flex-col">
        {/* 인사 텍스트 */}
        <section>
          <p className="text-2xl font-bold leading-snug">
            <span className="font-logo font-extrabold text-yellow-main">
              우리.zip
            </span>
            <span className="text-text-main">에</span>
            <br />
            <span className="text-text-main">오신 것을 환영합니다!</span>
          </p>
          <p className="mt-3 text-md text-gray-80">
            서비스 이용을 위해 아래 내용에 동의해주세요.
          </p>
        </section>

        {/* 약관 리스트 */}
        <section className="mt-8 mx-2 space-y-3">
          {/* 전체 동의 */}
          <button
            type="button"
            onClick={handleToggleAll}
            className="w-full flex items-center justify-between py-3"
          >
            <div className="flex items-center gap-3">
              {renderCheckIcon(allRequiredChecked)}
              <span className="text-lg font-semibold text-text-main">
                전체 동의
              </span>
            </div>
          </button>

          {/* <div className="h-px bg-gray-20" /> */}

          {/* 개별 약관 */}
          <ul className="space-y-2">
            {REQUIRED_TERMS.map((item) => (
              <li key={item.id}>
                <div className="flex items-center justify-between py-2">
                  {/* 왼쪽: 체크 토글 버튼 */}
                  <button
                    type="button"
                    className="flex items-center gap-3 flex-1 text-left"
                    onClick={() => handleToggleOne(item.id)}
                    aria-label={`${item.label} 동의하기`}
                  >
                    {renderCheckIcon(checked[item.id])}
                    <span className="text-md text-text-main">{item.label}</span>
                  </button>

                  {/* 오른쪽 전체 영역: 상세보기 이동 */}
                  <button
                    type="button"
                    className="pl-2"
                    onClick={() => handleOpenDetail(item.id)}
                    aria-label="약관 상세 보기"
                  >
                    {renderArrowIcon()}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 하단 동의 버튼 */}
        <div className="mt-auto">
          <Button
            size="large"
            variant={agreeButtonVariant}
            type="button"
            onClick={handleAgree}
          >
            동의하기
          </Button>
        </div>
      </main>
    </div>
  );
}

export default TermsConsent;
