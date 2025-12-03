import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import ProgressBar from "@/components/ProgressBar";
import Button from "@/components/buttons/Button";
import FamilyProfile from "@/components/FamilyProfile";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FamilyConfirmStep() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    email,
    password,
    kakaoId,
    agreedTerms,
    nickname,
    profileImageUrl,
    profileImageFile,
    birthdate,
    calendarType,
    phone,
    familyCode,
  } = location.state || {};

  // -----------------------------
  // 1) useState: 화면에서 계속 바뀔 수 있는 데이터들
  // -----------------------------

  // 가족 이름(별명)
  // - 기본값: 이전 단계에서 이미 조회해온 값이 있으면 그걸 쓰고,
  //   없으면 "우리 가족"으로 초기화
  const [familyName, setFamilyName] = useState(
    location.state?.familyName || "우리 가족"
  );
  // 가족 대표 정보
  // - { id, nickname, profile } 형태로 관리
  const [familyLeader, setFamilyLeader] = useState(
    location.state?.familyLeader // { id, nickname, profile }
  );
  // API 요청 중인지 여부
  const [isLoading, setIsLoading] = useState(false);
  // 에러 메시지 (가족코드 잘못됐을 때 등)
  const [errorMessage, setErrorMessage] = useState("");

  // -----------------------------
  // 2) useEffect: "가족코드가 있을 때, 처음 마운트될 때 한 번 정보 가져오기"
  // -----------------------------
  //
  // - 의존성 배열: [familyCode]
  //   → familyCode 값이 바뀔 때마다 이 effect가 다시 실행됨
  //   → 이 컴포넌트에서는 familyCode는 고정이니, 사실상 "마운트 시 한 번"과 동일
  //
  // - 역할:
  //   1) familyCode가 존재하면
  //   2) /member/family-info API로 GET 요청 보내서
  //   3) 가족 별명 + 가족 대표 정보를 state에 넣는다.
  useEffect(() => {
    // 가족코드가 없으면 API 호출 자체를 하지 않음
    if (!familyCode) return;

    const fetchFamilyInfo = async () => {
      try {
        setIsLoading(true); // 로딩 시작
        setErrorMessage(""); // 이전 에러 초기화

        const res = await fetch(
          `${API_BASE_URL}/member/family-info?inviteCode=${encodeURIComponent(
            familyCode
          )}`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
            },
          }
        );

        if (!res.ok) {
          // HTTP 200대가 아니면 에러로 간주
          throw new Error("가족 정보를 불러오지 못했습니다.");
        }

        // Swagger 예시 구조:
        // { familyName, leaderId, leaderNickname, leaderProfile(리더 프로필 이미지 정보) }
        const data = await res.json();

        // 서버에서 받은 값을 화면 상태에 반영
        setFamilyName(data.familyName || "");
        setFamilyLeader({
          id: data.leaderId,
          nickname: data.leaderNickname,
          profile: data.leaderProfile,
        });
      } catch (error) {
        console.error(error);
        // 에러가 나면 사용자가 이해할 수 있는 문구로 상태 업데이트
        setErrorMessage(
          "가족 정보를 불러오지 못했어요. 가족코드를 다시 확인해주세요."
        );
      } finally {
        // 성공/실패 상관없이 로딩 종료
        setIsLoading(false);
      }
    };

    // 비동기 함수 호출
    fetchFamilyInfo();
  }, [familyCode]); // ← familyCode 가 바뀔 때마다 다시 가족 정보 조회

  const handleConfirm = () => {
    navigate("/welcome", {
      state: {
        email,
        password,
        kakaoId,
        agreedTerms,
        nickname,
        profileImageUrl,
        profileImageFile,
        birthdate,
        calendarType,
        phone,
        familyCode,
        familyName,
        familyLeader,
        // 기존 가족에 합류 → 가족코드 공유 버튼 없음
        showShareButton: false,
      },
    });
  };

  // -----------------------------
  // 3) 화면에 뿌려줄 대표 정보 가공
  // -----------------------------
  // familyLeader 가 없을 수도 있으니 기본값을 넣어서 컴포넌트에 전달
  const leaderProfile = familyLeader
    ? {
        // 가족 대표 정보 있을 경우
        name: familyLeader.nickname || "가족 대표",
        imageSrc: familyLeader.profile || "/images/user.png",
      }
    : {
        name: "가족 대표",
        imageSrc: "/images/user.png",
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
          <ProgressBar currentStep={7} totalSteps={7} className="mb-8" />

          <h1 className="text-xl font-semibold text-text-main leading-snug">
            우리 가족 별명 확인
          </h1>
          <p className="mt-2 text-sm text-gray-60">
            가족 대표가 미리 설정한 가족 별명입니다.
            <br />
            가족 별명은 설정에서 수정할 수 있어요.
          </p>

          {/* useState 값에 따라 로딩 / 에러 상태를 조건부로 렌더링 */}
          {isLoading && (
            <p className="mt-2 text-xs text-gray-40">
              가족 정보를 불러오는 중이에요…
            </p>
          )}
          {errorMessage && (
            <p className="mt-2 text-xs text-red-500">{errorMessage}</p>
          )}
        </section>

        {/* 가족 별명 박스 */}
        <section className="mt-6">
          <div className="w-full h-12 rounded-xl bg-yellow-40 flex items-center justify-center">
            <span className="text-sm font-semibold text-text-main">
              {familyName}
            </span>
          </div>
        </section>

        {/* 가족 대표 확인 영역 */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text-main">
            가족 대표 확인
          </h2>
          <p className="mt-2 text-sm text-gray-60">
            우리 가족 대표가 맞는지 확인해보세요
          </p>

          <div className="mt-6 flex justify-start">
            <FamilyProfile
              variant="vertical"
              name={leaderProfile.name}
              imageSrc={leaderProfile.imageSrc}
            />
          </div>
        </section>

        {/* 하단 버튼 */}
        <div className="mt-auto">
          <Button
            size="large"
            variant="primary"
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || !!errorMessage}
          >
            확인
          </Button>
        </div>
      </main>
    </div>
  );
}

export default FamilyConfirmStep;
