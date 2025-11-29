import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/buttons/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Welcome() {
  const navigate = useNavigate();
  const location = useLocation();

  const hasRequestedRef = useRef(false);

  const {
    email,
    password,
    kakaoId, // 현재 스펙에는 없지만 state로는 받아둠
    agreedTerms,
    nickname,
    profileImageUrl,
    birthdate, // BirthdateStep에서 넘긴 값 (ex. "20001010")
    calendarType,
    phone,
    familyName,
    familyCode: initialFamilyCode, // 기존 가족 합류 플로우라면 코드가 있을 수 있음
    isNewFamily, // 가족 중 처음 플로우인지 여부
    showShareButton = false,
  } = location.state || {};

  const [familyCode, setFamilyCode] = useState(initialFamilyCode || null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState(null);

  const handleStart = () => {
    navigate("/week-answer");
  };

  const handleShareCode = async () => {
    if (!familyCode) {
      alert("가족 코드가 아직 발급되지 않았어요. 잠시 후 다시 시도해 주세요.");
      return;
    }

    try {
      await navigator.clipboard.writeText(familyCode);
      alert(
        "가족 코드가 복사되었어요. 카카오톡 등으로 붙여넣어 가족에게 공유해 주세요."
      );
    } catch (error) {
      console.error(error);
      alert("복사에 실패했어요. 다시 시도해 주세요.");
    }
  };

  // ✅ 이 페이지로 넘어온 값 확인용 (연동 끝나면 삭제해도 됨)
  useEffect(() => {
    console.log("Welcome 받은 state:", {
      email,
      password,
      kakaoId,
      agreedTerms,
      nickname,
      profileImageUrl,
      birthdate,
      calendarType,
      phone,
      familyName,
      initialFamilyCode,
      isNewFamily,
      showShareButton,
    });
  }, [
    email,
    password,
    kakaoId,
    agreedTerms,
    nickname,
    profileImageUrl,
    birthdate,
    calendarType,
    phone,
    familyName,
    initialFamilyCode,
    isNewFamily,
    showShareButton,
  ]);

  useEffect(() => {
    // 필수 값 없으면 요청 안 함
    if (!email || !password) return;

    // ✅ 이미 한 번 요청했으면 더 이상 호출하지 않음
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;

    const registerMember = async () => {
      try {
        setIsRegistering(true);
        setRegisterError(null);

        // /member/register 스펙에 맞춰 payload 구성
        const payload = {
          email,
          nickname,
          birth: birthdate ?? "",
          phone: phone ?? "",
          profileImage: profileImageUrl ?? "",
          password,
        };

        // 가족 중 처음 플로우면 familyName만 보냄
        if (isNewFamily && familyName) {
          payload.familyName = familyName;
        }

        // 기존 가족 합류 플로우면 초대코드만 보냄
        // ⚠️ 여기서는 initialFamilyCode만 사용해서
        //     응답으로 받은 familyCode 때문에 effect가 다시 돌지 않게 함
        const codeToUse = !isNewFamily ? initialFamilyCode : null;
        if (codeToUse) {
          payload.inviteCode = codeToUse;
        }

        const res = await fetch(`${API_BASE_URL}/member/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        // JSON 말고 문자열로 한 번만 읽어오기
        const text = await res.text();

        if (!res.ok) {
          // 에러 응답에도 보통 메시지가 들어올 수 있으니까 같이 사용
          throw new Error(text || `회원가입 실패 (status: ${res.status})`);
        }

        // 응답 구조 확인용 (연동 확인 후 삭제해도 됨)
        console.log("[DEBUG] /member/register response:", text);

        // "회원가입 성공! 가족 코드: D1736E3D" 에서 영문/숫자 8자리만 뽑기
        const match = text.match(/([A-Z0-9]{8})/);
        const issuedCode = match ? match[1] : null;

        if (issuedCode) {
          setFamilyCode(issuedCode);
        }
      } catch (error) {
        console.error(error);
        setRegisterError(error.message);
      } finally {
        setIsRegistering(false);
      }
    };

    registerMember();
  }, [
    email,
    password,
    nickname,
    birthdate,
    phone,
    profileImageUrl,
    familyName,
    initialFamilyCode,
    isNewFamily,
  ]);

  return (
    <div className="min-h-screen bg-bg-app flex flex-col items-center px-6 pb-10">
      {/* 가운데 콘텐츠 */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-text-main mb-8">반가워요!</h1>

        <div className="w-40 h-40 bg-gray-20 flex items-center justify-center">
          <span className="text-base text-text-main">로고</span>
        </div>

        <p className="mt-8 text-center text-xl font-semibold text-text-main leading-relaxed">
          우리.zip에서
          <br />
          가족과의 추억을 저장해보세요!
        </p>

        {registerError && (
          <p className="mt-4 text-sm text-red-500 text-center">
            회원가입 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.
          </p>
        )}

        {isRegistering && (
          <p className="mt-2 text-xs text-gray-60 text-center">
            회원가입을 진행 중이에요...
          </p>
        )}

        {showShareButton && familyCode && (
          <p className="mt-4 text-sm text-text-main text-center">
            가족 코드:{" "}
            <span className="font-mono font-semibold">{familyCode}</span>
          </p>
        )}
      </main>

      {/* 하단 버튼 영역 */}
      <div className="w-full space-y-3">
        {showShareButton && (
          <Button
            size="large"
            variant="accent"
            type="button"
            onClick={handleShareCode}
          >
            가족 코드 공유하기
          </Button>
        )}

        <Button
          size="large"
          variant="primary"
          type="button"
          onClick={handleStart}
        >
          시작하기
        </Button>
      </div>
    </div>
  );
}

export default Welcome;
