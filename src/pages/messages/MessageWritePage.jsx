import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import TextInput from "@/components/TextInput";
import FamilyProfile from "@/components/FamilyProfile";
import Button from "@/components/buttons/Button";

// TODO: 실제 가족 구성원 데이터로 교체
const MOCK_MEMBERS = [
  { id: 1, name: "누군가", imageSrc: null },
  { id: 2, name: "누군가", imageSrc: null },
  { id: 3, name: "누군가", imageSrc: null },
];

export default function MessageWritePage() {
  const navigate = useNavigate();

  const [selectedMemberId, setSelectedMemberId] = useState(
    MOCK_MEMBERS[0]?.id ?? null
  );
  const [content, setContent] = useState("");

  const trimmedContent = content.trim();
  const canSubmit = Boolean(selectedMemberId) && trimmedContent.length > 0;
  const submitVariant = canSubmit ? "primary" : "notFocus";

  const handleClose = () => {
    navigate(-1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    // TODO: 쪽지 보내기 API 호출
    // selectedMemberId, trimmedContent 사용해서 전송
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      {/* 헤더: X 아이콘 + 가운데 제목 */}
      <Header
        bgClassName="bg-bg-app"
        variant="solid"
        title="쪽지 보내기"
        leftIcon={<img src="/icons/close.svg" alt="닫기" className="w-8 h-8" />}
        onLeftClick={handleClose}
        leftAriaLabel="닫기"
      />

      <main className="flex-1 px-6 pt-4 pb-8 flex flex-col">
        <form className="flex flex-col flex-1" onSubmit={handleSubmit}>
          {/* 받는 사람 선택 */}
          <section>
            <h2 className="text-xl font-semibold text-text-main mb-4">
              받는 사람 선택
            </h2>

            <div className="flex gap-3">
              {MOCK_MEMBERS.map((member) => {
                const isSelected = member.id === selectedMemberId;

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`rounded-lg px-3 pt-2 pb-2 transition-colors ${
                      isSelected ? "bg-yellow-20" : "bg-transparent"
                    }`}
                  >
                    <FamilyProfile
                      variant="vertical"
                      name={member.name}
                      imageSrc={member.imageSrc}
                    />
                  </button>
                );
              })}
            </div>
          </section>

          {/* 쪽지 내용 입력 */}
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-text-main mb-4">
              쪽지 내용 입력
            </h2>
            <TextInput
              multiline
              rows={8}
              name="messageContent"
              placeholder="내용을 입력해주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={200} // 글자 수 제한 최대 200자
            />
          </section>

          {/* 전송 버튼 */}
          <div className="mt-auto pt-8">
            <Button size="large" variant={submitVariant} type="submit">
              전송하기
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
