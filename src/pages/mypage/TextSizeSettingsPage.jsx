import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import Button from "@/components/buttons/Button";

export default function TextSizeSettingsPage() {
  const navigate = useNavigate();
  const [size, setSize] = useState("default"); // "large" | "default"

  const handleBack = () => navigate(-1);

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: 글자 크기 설정 저장
    console.log("선택한 글자 크기:", size);
    navigate(-1);
  };

  const previewTextClass =
    size === "large" ? "text-xl leading-relaxed" : "text-base leading-relaxed";

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Header
        bgClassName="bg-bg-app"
        variant="solid"
        title="글자 크기 설정"
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-8 h-8" />
        }
        onLeftClick={handleBack}
        leftAriaLabel="뒤로가기"
      />

      <main className="flex-1 px-6 pt-4 pb-8 flex flex-col">
        <form className="flex flex-col flex-1" onSubmit={handleSubmit}>
          {/* 크기 설정 섹션 */}
          <section>
            <h1 className="text-xl font-semibold text-text-main mb-4">
              크기 설정
            </h1>

            <div className="flex gap-3">
              <Button
                size="medium"
                variant={size === "large" ? "primary" : "notFocus"}
                type="button"
                onClick={() => setSize("large")}
                className="flex-1"
              >
                크게
              </Button>

              <Button
                size="medium"
                variant={size === "default" ? "primary" : "notFocus"}
                type="button"
                onClick={() => setSize("default")}
                className="flex-1"
              >
                기본
              </Button>
            </div>
          </section>

          {/* 미리보기 섹션 */}
          <section className="mt-8 flex-1">
            <h2 className="text-xl font-semibold text-text-main mb-4">
              미리보기
            </h2>

            <div className="h-52 rounded-xl bg-gray-10 flex items-center justify-center px-4">
              <p className={previewTextClass}>
                우리.zip에서 가족의 하루를 기록해 보세요.
              </p>
            </div>
          </section>

          {/* 하단 버튼 */}
          <div className="mt-auto">
            <Button size="large" variant="primary" type="submit">
              설정 완료
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
