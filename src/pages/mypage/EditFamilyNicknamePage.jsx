import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

export default function EditFamilyNicknamePage() {
  const navigate = useNavigate();

  const [familyNickname, setFamilyNickname] = useState("");
  // TODO: 실제 데이터에서 마지막 수정자 받아오기
  const lastEditorNickname = "귀요미";

  const trimmed = familyNickname.trim();
  const maxLength = 10;

  const isTooLong = trimmed.length > maxLength;
  const errorMessage = isTooLong
    ? "가족 별명은 최대 10자까지 입력할 수 있어요."
    : "";

  const canSubmit = trimmed.length > 0 && !isTooLong;
  const submitVariant = canSubmit ? "primary" : "notFocus";

  const handleBack = () => navigate(-1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    // TODO: 가족 별명 수정 API 호출
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Header
        bgClassName="bg-bg-app"
        variant="solid"
        title="가족 별명 수정"
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-8 h-8" />
        }
        onLeftClick={handleBack}
        leftAriaLabel="뒤로가기"
      />

      <main className="flex-1 px-6 pt-4 pb-8 flex flex-col">
        <form className="flex flex-col flex-1" onSubmit={handleSubmit}>
          <section>
            <h1 className="text-xl font-semibold text-text-main leading-snug">
              가족 별명을 입력해주세요
            </h1>
          </section>

          <section className="mt-6">
            <TextInput
              name="familyNickname"
              placeholder="가족 별명 입력"
              value={familyNickname}
              onChange={(e) => setFamilyNickname(e.target.value)}
              errorMessage={errorMessage}
              supportingText={!errorMessage ? "최대 10자리까지 가능해요" : ""}
              maxLength={maxLength}
            />
          </section>

          <div className="mt-auto">
            {/* 마지막 수정자 텍스트 (오른쪽 정렬) */}
            <p className="mb-2 text-xs text-text-main text-right">
              마지막 수정 : {lastEditorNickname}
            </p>

            <Button size="large" variant={submitVariant} type="submit">
              저장
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
