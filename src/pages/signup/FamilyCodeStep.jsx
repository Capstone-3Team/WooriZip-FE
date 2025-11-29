import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import ProgressBar from "@/components/ProgressBar";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FamilyCodeStep() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    email,
    password,
    kakaoId,
    agreedTerms,
    nickname,
    profileImageUrl,
    birthdate,
    calendarType,
    phone,
    inviteCode,
  } = location.state || {};

  const [familyCode, setFamilyCode] = useState(
    (inviteCode || "").toUpperCase()
  );
  const [familyError, setFamilyError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const trimmedCode = familyCode.trim();

  // 영문/숫자 8자리 코드 (D1736E3D 같은 형식)
  const codeRegex = /^[A-Za-z0-9]{8}$/;
  const isCodeValid = codeRegex.test(trimmedCode);

  const nextVariant = isCodeValid ? "primary" : "notFocus";

  // 실제 가족코드 조회 API (/member/family-info)
  const fetchFamilyByCode = async (code) => {
    const res = await fetch(
      `${API_BASE_URL}/member/family-info?inviteCode=${encodeURIComponent(
        code
      )}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      // 존재하지 않는 코드면 404일 가능성이 높음
      if (res.status === 404) {
        return null;
      }
      throw new Error(`가족코드 조회 실패 (status: ${res.status})`);
    }

    const data = await res.json();

    return {
      familyName: data.familyName,
      leader: {
        id: data.leaderId,
        nickname: data.leaderNickname,
        profile: data.leaderProfile,
      },
    };
  };

  const handleSubmitCode = async () => {
    if (!isCodeValid || isChecking) return;

    setIsChecking(true);
    setFamilyError("");

    try {
      const family = await fetchFamilyByCode(trimmedCode);

      if (!family) {
        setFamilyError("존재하지 않는 가족코드입니다.");
        return;
      }

      navigate("/signup/family-confirm", {
        state: {
          email,
          password,
          kakaoId,
          agreedTerms,
          nickname,
          profileImageUrl,
          birthdate,
          calendarType,
          phone,
          familyCode: trimmedCode,
          familyName: family.familyName,
          familyLeader: family.leader,
        },
      });
    } catch (e) {
      console.error(e);
      setFamilyError("가족코드를 확인하는 중 오류가 발생했어요.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleFirstFamily = () => {
    navigate("/signup/family-name", {
      state: {
        email,
        password,
        kakaoId,
        agreedTerms,
        nickname,
        profileImageUrl,
        birthdate,
        calendarType,
        phone,
      },
    });
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Header
        bgClassName="bg-bg-app"
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-8 h-8" />
        }
        onLeftClick={() => navigate(-1)}
        leftAriaLabel="뒤로가기"
      />

      <main className="flex-1 px-6 pt-4 pb-8 flex flex-col">
        {/* 진행 바 + 타이틀 */}
        <section>
          {/* 온보딩 6 / 7 단계라고 가정 */}
          <ProgressBar currentStep={6} totalSteps={7} className="mb-8" />

          <h1 className="text-xl font-semibold text-text-main leading-snug">
            마지막이에요!
            <br />
            가족의 초대를 받고 오셨나요?
          </h1>
          <p className="mt-2 text-sm text-gray-60">
            전달받은 가족코드를 입력해주세요
          </p>
        </section>

        {/* 입력 영역 */}
        <section className="mt-6">
          <TextInput
            name="familyCode"
            type="text"
            placeholder="영문/숫자 8자리로 입력해주세요"
            value={familyCode}
            onChange={(e) => {
              // ✅ 자동으로 대문자로 변환해서 저장
              const value = e.target.value.toUpperCase();
              setFamilyCode(value);
              setFamilyError("");
            }}
            errorMessage={familyError}
          />
        </section>

        {/* 하단 버튼 두 개 */}
        <div className="mt-auto space-y-3">
          <Button
            size="large"
            variant={nextVariant}
            type="button"
            onClick={handleSubmitCode}
          >
            {isChecking ? "확인 중..." : "입력완료"}
          </Button>

          <Button
            size="large"
            variant="focus"
            type="button"
            onClick={handleFirstFamily}
          >
            가족 중 처음이에요
          </Button>
        </div>
      </main>
    </div>
  );
}

export default FamilyCodeStep;
