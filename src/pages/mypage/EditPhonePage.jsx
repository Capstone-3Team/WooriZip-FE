import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

export default function EditPhonePage() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const trimmedPhone = phone.trim();

  const handleClose = () => navigate(-1);

  // 숫자만, 10~11자리 (01012345678 형식 가정)
  const onlyDigits = /^\d+$/;
  const isValidPhone =
    trimmedPhone.length === 0 ||
    (onlyDigits.test(trimmedPhone) &&
      (trimmedPhone.length === 10 || trimmedPhone.length === 11));

  const phoneError =
    trimmedPhone && !isValidPhone ? "숫자만 10~11자리로 입력해주세요." : "";

  const canSubmit = trimmedPhone && isValidPhone;
  const submitVariant = canSubmit ? "primary" : "notFocus";

  const handleChange = (e) => {
    const value = e.target.value.replace(/\s+/g, "");
    // 입력 단계에서도 숫자 + 공백만 허용 (공백은 제거)
    if (value === "" || onlyDigits.test(value)) {
      setPhone(value);
      setError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    // TODO: 휴대폰번호 수정 API 호출
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Header
        bgClassName="bg-bg-app"
        variant="solid"
        title="번호 수정"
        leftIcon={<img src="/icons/close.svg" alt="닫기" className="w-8 h-8" />}
        onLeftClick={handleClose}
        leftAriaLabel="닫기"
      />

      <main className="flex-1 px-6 pt-4 pb-8 flex flex-col">
        <form className="flex flex-col flex-1" onSubmit={handleSubmit}>
          <section>
            <h1 className="text-xl font-semibold text-text-main leading-snug">
              휴대폰번호를 입력해주세요
            </h1>
          </section>

          <section className="mt-6">
            <TextInput
              name="phone"
              type="tel"
              placeholder="ex) 01012345678"
              value={phone}
              onChange={handleChange}
              errorMessage={phoneError || error}
              supportingText={!phoneError ? "숫자만 입력해주세요" : ""}
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
