import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { shareFamilyInvite } from "@/utils/shareFamilyInvite";
import Button from "@/components/buttons/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Welcome() {
  const navigate = useNavigate();
  const location = useLocation();

  const hasRequestedRef = useRef(false);

  const {
    email,
    password,
    nickname,
    profileImageUrl,
    birthdate, // ex. "20001010" 또는 "2000-10-10"
    phone,
    familyName,
    familyCode: initialFamilyCode,
    isNewFamily,
    showShareButton = false,
  } = location.state || {};

  const [familyCode, setFamilyCode] = useState(initialFamilyCode || null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState(null);

  const handleStart = () => {
    navigate("/login");
  };

  const handleShareCode = () => {
    shareFamilyInvite(familyCode);
  };

  useEffect(() => {
    if (!email || !password) return;
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;

    const registerMember = async () => {
      try {
        setIsRegistering(true);
        setRegisterError(null);

        const formData = new FormData();

        formData.append("email", email);
        formData.append("nickname", nickname);
        formData.append("phone", phone ?? "");
        formData.append("password", password);

        // 🔹 birth: 백엔드는 "YYYYMMDD" 8자리 문자열을 기대
        let birthToSend = birthdate ?? "";
        if (/^\d{4}-\d{2}-\d{2}$/.test(birthToSend)) {
          birthToSend = birthToSend.replace(/-/g, "");
        }
        formData.append("birth", birthToSend);

        // 🔹 familyName: 백엔드에서 required 라서 항상 보냄
        formData.append("familyName", familyName ?? "");

        // 🔹 초대코드: 기존 가족 합류 플로우일 때만 전송
        const codeToUse = !isNewFamily ? initialFamilyCode : null;
        if (codeToUse) {
          formData.append("inviteCode", codeToUse);
        }

        // profileImage 는 지금 URL만 있어서 일단 생략
        // if (profileImageFile instanceof File) {
        //   formData.append("profileImage", profileImageFile);
        // }

        const res = await fetch(`${API_BASE_URL}/member/register`, {
          method: "POST",
          body: formData,
        });

        const text = await res.text();

        if (!res.ok) {
          throw new Error(text || `회원가입 실패 (status: ${res.status})`);
        }

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
      <main className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-text-main mb-8">반가워요!</h1>

        <div className="w-40 h-40 flex flex-col items-center justify-center">
          <img
            src="/logo/logo.svg"
            alt="우리.zip 로고"
            className="w-35 h-35 mb-2"
          />
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
