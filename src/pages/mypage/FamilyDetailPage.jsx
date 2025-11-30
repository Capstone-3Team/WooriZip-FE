import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { shareFamilyInvite } from "@/utils/shareFamilyInvite";
import Header from "@/layouts/Header";
import FamilyProfile from "@/components/FamilyProfile";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FamilyDetailPage() {
  const navigate = useNavigate();

  const [familyName, setFamilyName] = useState("");
  const [familyCode, setFamilyCode] = useState("");
  const [leader, setLeader] = useState(null); // { nickname, profileImage }
  const [members, setMembers] = useState([]); // [{ nickname, profileImage }]
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // 가족 프로필 조회 (/mypage/family-profile)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchFamilyProfile = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const res = await fetch(`${API_BASE_URL}/mypage/family-profile`, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("가족 정보를 불러오지 못했습니다.");
        }

        const data = await res.json();
        setFamilyName(data.familyName || "우리 가족");
        setFamilyCode(data.inviteCode || "");
        setLeader(data.leader || null);
        setMembers(data.members || []);
      } catch (error) {
        console.error(error);
        setErrorMessage("가족 정보를 불러오지 못했어요.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFamilyProfile();
  }, [navigate]);

  const handleBack = () => navigate(-1);

  const handleEditFamilyName = () => {
    navigate("/mypage/edit-family-name");
  };

  const handleCopyCode = () => {
    if (!familyCode) return;
    // 로그인 상태에서 이미 가지고 있는 familyCode를 그대로 사용
    shareFamilyInvite(familyCode);
  };

  const leaderName = leader?.nickname || "누군가";
  const leaderImage = leader?.profileImage || null;

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Header
        variant="solid"
        title={familyName || "우리 가족"}
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-8 h-8" />
        }
        onLeftClick={handleBack}
        leftAriaLabel="뒤로가기"
        rightIcon={
          <img
            src="/icons/edit-single.svg"
            alt="가족 이름 수정"
            className="w-5 h-5"
          />
        }
        onRightClick={handleEditFamilyName}
        rightAriaLabel="가족 이름 수정"
      />

      <main className="flex-1 flex flex-col px-6 pt-6 pb-8 overflow-y-auto">
        {errorMessage && (
          <p className="mb-4 text-xs text-red-500">{errorMessage}</p>
        )}

        {/* 가족 초대코드 영역 */}
        <section>
          <h2 className="text-lg font-semibold text-text-main mb-4">
            가족 초대코드
          </h2>

          <div className="rounded-lg bg-yellow-main px-4 py-3 flex items-center justify-between">
            <span className="text-md font-medium text-text-main">
              {isLoading ? "불러오는 중..." : familyCode || "-"}
            </span>

            <button
              type="button"
              onClick={handleCopyCode}
              disabled={!familyCode}
              className="text-xs font-medium text-text-main underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              복사하기
            </button>
          </div>
        </section>

        {/* 우리 가족 대표 */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-text-main mb-4">
            우리 가족 대표
          </h2>

          <div className="flex items-start">
            <FamilyProfile
              variant="vertical"
              name={leaderName}
              imageSrc={leaderImage}
            />
          </div>
        </section>

        {/* 가족 구성원 */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-text-main mb-4">
            가족 구성원
          </h2>

          {members.length === 0 ? (
            <p className="text-sm text-gray-60">
              아직 등록된 가족 구성원이 없어요.
            </p>
          ) : (
            <div className="flex gap-8">
              {members.map((member, index) => (
                <FamilyProfile
                  key={`${member.nickname || "member"}-${index}`}
                  variant="vertical"
                  name={member.nickname || "누군가"}
                  imageSrc={member.profileImage || null}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default FamilyDetailPage;
