import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import Button from "@/components/buttons/Button";

export default function TtsVoiceSettingsPage() {
  const navigate = useNavigate();
  const [gender, setGender] = useState("female"); // "female" | "male"

  const handleBack = () => navigate(-1);

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: TTS 음성 성별 설정 저장(API or 전역 상태)
    console.log("선택한 성별:", gender);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <Header
        bgClassName="bg-bg-app"
        variant="solid"
        title="TTS 음성 설정"
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-8 h-8" />
        }
        onLeftClick={handleBack}
        leftAriaLabel="뒤로가기"
      />

      <main className="flex-1 px-6 pt-4 pb-8 flex flex-col">
        <form className="flex flex-col flex-1" onSubmit={handleSubmit}>
          {/* 상단 설명 */}
          <section>
            <h1 className="text-xl font-semibold text-text-main leading-snug">
              기계 음성 성별을 설정해주세요
            </h1>
            <p className="mt-2 text-md text-gray-80">
              듣고 싶은 가족의 목소리라고 생각해볼까요?
            </p>
          </section>

          {/* 성별 선택 */}
          <section className="mt-6">
            <div className="flex gap-3">
              <Button
                size="medium"
                variant={gender === "female" ? "primary" : "notFocus"}
                type="button"
                onClick={() => setGender("female")}
                className="flex-1 gap-2"
              >
                <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                  <span>여성</span>
                  <img
                    src="/icons/speaker.svg"
                    alt="여성 음성 미리듣기"
                    className="w-5 h-5"
                  />
                </span>
              </Button>

              <Button
                size="medium"
                variant={gender === "male" ? "primary" : "notFocus"}
                type="button"
                onClick={() => setGender("male")}
                className="flex-1 gap-2"
              >
                <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                  <span>남성</span>
                  <img
                    src="/icons/speaker.svg"
                    alt="남성 음성 미리듣기"
                    className="w-5 h-5"
                  />
                </span>
              </Button>
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
