import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { shareFamilyInvite } from "@/utils/shareFamilyInvite";
import Button from "@/components/buttons/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Welcome() {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * useRef: "이미 회원가입 요청을 보냈는지" 여부를 기억하는 용도
   *
   * - state가 아닌 ref를 쓰는 이유:
   *    - ref.current 값이 바뀌어도 컴포넌트가 리렌더링되지 않음
   *    - 단순히 플래그(불린 값)를 저장하고 싶을 때 가볍게 사용 가능
   * - 여기서는 useEffect가 두 번 이상 실행되더라도
   *   회원가입 API를 여러 번 호출하지 않게 하는 "잠금 장치" 역할을 함
   */
  const hasRequestedRef = useRef(false);

  const {
    email,
    password,
    nickname,
    profileImageUrl,
    profileImageFile,
    birthdate, // ex. "20001010" 또는 "2000-10-10"
    phone,
    familyName,
    familyCode: initialFamilyCode,
    isNewFamily,
    showShareButton = false,
  } = location.state || {};

  // 화면에 보여줄 가족코드 (백엔드에서 새로 발급해 주면 여기 업데이트)
  const [familyCode, setFamilyCode] = useState(initialFamilyCode || null);
  // 회원가입 요청 중인지 여부
  const [isRegistering, setIsRegistering] = useState(false);
  // 회원가입 실패 시 에러 메시지
  const [registerError, setRegisterError] = useState(null);

  const handleStart = () => {
    navigate("/login");
  };

  // "가족 코드 공유하기" 버튼 → OS 공유/클립보드 유틸 호출
  const handleShareCode = () => {
    shareFamilyInvite(familyCode);
  };

  /**
   * useEffect: "화면에 들어온 시점에 딱 한 번 회원가입 API 호출"
   *
   * - 이 페이지는 '가입이 끝나고' 보여주는 환영 화면처럼 보이지만,
   *   실제로는 여기에서 `/member/register`를 호출해서
   *   최종 회원가입을 진행하고 있음.
   *
   * - 의존성 배열에 여러 값(email, password, ...)이 들어 있지만,
   *   내부에서 hasRequestedRef.current 를 체크하기 때문에
   *   같은 값으로 다시 렌더되더라도 회원가입 API는 한 번만 호출됨.
   *
   * - 흐름:
   *   1) email, password가 없으면 (잘못 들어온 경우) 요청 안 함
   *   2) hasRequestedRef.current가 true면 이미 요청한 것으로 보고 또 안 함
   *   3) 처음 한 번만 registerMember() 비동기 함수 실행
   */
  useEffect(() => {
    if (!email || !password) return;
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true; // 이제부터는 재요청 금지

    const registerMember = async () => {
      try {
        setIsRegistering(true);
        setRegisterError(null);

        // 백엔드에서 기대하는 형태: multipart/form-data
        const formData = new FormData();

        formData.append("email", email);
        formData.append("nickname", nickname);
        formData.append("phone", phone ?? "");
        formData.append("password", password);

        // 프로필 이미지 파일 전송 (있을 때만)
        if (profileImageFile instanceof File) {
          formData.append("profileImage", profileImageFile);
        }

        // birth: 백엔드는 "YYYYMMDD" 8자리 문자열을 기대
        // 이전 단계에서 birthdate가 "2000-10-10" 형식일 수도 있어서
        // 정규식으로 체크 후 "-" 제거해서 8자리로 맞춰줌
        let birthToSend = birthdate ?? "";
        if (/^\d{4}-\d{2}-\d{2}$/.test(birthToSend)) {
          birthToSend = birthToSend.replace(/-/g, "");
        }
        formData.append("birth", birthToSend);

        // familyName: 백엔드에서 required 라서 항상 보냄
        formData.append("familyName", familyName ?? "");

        // 초대코드: 기존 가족 합류 플로우일 때만 전송
        // - isNewFamily === true 이면 새 가족 생성 → inviteCode 안 보냄
        // - isNewFamily === false 이면 기존 familyCode(initialFamilyCode)를 초대코드로 사용
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
          body: formData, // Content-Type은 브라우저가 자동 설정(multipart/form-data)
        });

        const text = await res.text();

        if (!res.ok) {
          throw new Error(text || `회원가입 실패 (status: ${res.status})`);
        }

        // 백엔드가 응답 텍스트 안에 초대코드(대문자+숫자 8글자)를 포함해서
        // 내려주는 케이스를 가정하고 정규식으로 뽑아냄.
        const match = text.match(/([A-Z0-9]{8})/);
        const issuedCode = match ? match[1] : null;

        // 새 가족 생성 플로우(isNewFamily === true)인 경우,
        // 백엔드에서 새로 발급된 가족 코드를 화면에 보여주기 위해 상태 업데이트
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
    profileImageFile,
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
