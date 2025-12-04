import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import TextInput from "@/components/TextInput";
import Button from "@/components/buttons/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EditFamilyNicknamePage() {
  const navigate = useNavigate();

  const [familyNickname, setFamilyNickname] = useState("");
  const [lastEditorNickname, setLastEditorNickname] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const trimmed = familyNickname.trim();
  const maxLength = 10;

  const isTooLong = trimmed.length > maxLength;
  const errorMessage = isTooLong
    ? "가족 별명은 최대 10자까지 입력할 수 있어요."
    : "";

  const canSubmit = trimmed.length > 0 && !isTooLong;
  const submitVariant = canSubmit ? "primary" : "notFocus";

  const handleBack = () => navigate("/mypage/family-detail");

  // 현재 가족 이름 + 마지막 수정자 조회
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchFamilyNameInfo = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/mypage/family/name/info`, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("가족 별명 정보를 불러오지 못했습니다.");
        }

        const data = await res.json();
        // Swagger 예시: { familyName, lastModifiedBy }
        setFamilyNickname(data.familyName || "");
        setLastEditorNickname(data.lastModifiedBy || "");
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFamilyNameInfo();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch(`${API_BASE_URL}/mypage/family/name`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ familyName: trimmed }),
      });

      if (!res.ok) {
        throw new Error("가족 별명을 수정하지 못했습니다.");
      }

      // 성공 시 이전 페이지로
      navigate("/mypage/family-detail");
    } catch (error) {
      console.error(error);
      setSubmitError(
        "가족 별명을 수정하지 못했어요. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
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
            {isLoading && (
              <p className="mt-2 text-xs text-gray-60">
                가족 정보를 불러오는 중이에요…
              </p>
            )}
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
            {submitError && (
              <p className="mb-2 text-xs text-red-500">{submitError}</p>
            )}

            {/* 마지막 수정자 텍스트 (오른쪽 정렬) */}
            <p className="mb-2 text-xs text-text-main text-right">
              마지막 수정 : {lastEditorNickname || "없음"}
            </p>

            <Button
              size="large"
              variant={submitVariant}
              type="submit"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
