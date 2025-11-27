import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import FamilyProfile from "@/components/FamilyProfile"; // 경로는 프로젝트 구조에 맞게 수정

function FamilyDetailPage() {
  const navigate = useNavigate();

  // TODO: 실제 데이터로 대체
  const [familyName] = useState("우주 최강 가족");
  const [familyCode] = useState("12345678");

  const representative = { id: 1, name: "누군가", imageSrc: null };
  const members = [
    { id: 2, name: "누군가", imageSrc: null },
    { id: 3, name: "누군가", imageSrc: null },
    { id: 4, name: "누군가", imageSrc: null },
  ];

  const handleBack = () => navigate(-1);

  const handleEditFamilyName = () => {
    navigate("/mypage/edit-family-name");
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(familyCode);
      // TODO: 토스트나 안내 문구로 "복사되었습니다" 표시
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Header
        variant="solid"
        title={familyName}
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
        {/* 가족 초대코드 영역 */}
        <section>
          <h2 className="text-lg font-semibold text-text-main mb-4">
            가족 초대코드
          </h2>

          <div className="rounded-lg bg-yellow-main px-4 py-3 flex items-center justify-between">
            <span className="text-md font-medium text-text-main">
              {familyCode}
            </span>

            <button
              type="button"
              onClick={handleCopyCode}
              className="text-xs font-medium text-text-main underline underline-offset-2"
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

          {/* 왼쪽 정렬용 래퍼 추가 */}
          <div className="flex items-start">
            <FamilyProfile
              variant="vertical"
              name={representative.name}
              imageSrc={representative.imageSrc}
            />
          </div>
        </section>

        {/* 가족 구성원 */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-text-main mb-4">
            가족 구성원
          </h2>

          <div className="flex gap-8">
            {members.map((member) => (
              <FamilyProfile
                key={member.id}
                variant="vertical"
                name={member.name}
                imageSrc={member.imageSrc}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default FamilyDetailPage;
