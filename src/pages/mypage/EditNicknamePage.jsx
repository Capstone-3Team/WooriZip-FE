import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

export default function EditNicknamePage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");

  const trimmedNickname = nickname.trim();
  const maxLength = 10;

  const isTooLong = trimmedNickname.length > maxLength;
  const errorMessage = isTooLong
    ? "별명은 최대 10자까지 입력할 수 있어요."
    : "";

  const canSubmit = trimmedNickname.length > 0 && !isTooLong;
  const submitVariant = canSubmit ? "primary" : "notFocus";

  const handleBack = () => navigate(-1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    // TODO: 별명 수정 API 호출
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Header
        bgClassName="bg-bg-app"
        variant="solid"
        title="별명 수정"
        leftIcon={<img src="/icons/close.svg" alt="닫기" className="w-8 h-8" />}
        onLeftClick={handleBack}
        leftAriaLabel="뒤로가기"
      />

      <main className="flex-1 px-6 pt-4 pb-8 flex flex-col">
        <form className="flex flex-col flex-1" onSubmit={handleSubmit}>
          <section>
            <h1 className="text-xl font-semibold text-text-main leading-snug">
              별명을 입력해주세요
            </h1>
          </section>

          <section className="mt-6">
            <TextInput
              name="nickname"
              placeholder="별명 입력"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              errorMessage={errorMessage}
              supportingText={!errorMessage ? "최대 10자까지 가능해요" : ""}
              maxLength={maxLength}
            />
          </section>

          <div className="mt-auto">
            <Button size="large" variant={submitVariant} type="submit">
              수정 완료
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
