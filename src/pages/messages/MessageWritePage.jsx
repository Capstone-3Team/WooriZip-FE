import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import TextInput from "@/components/TextInput";
import FamilyProfile from "@/components/FamilyProfile";
import Button from "@/components/buttons/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function MessageWritePage() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [content, setContent] = useState("");

  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const trimmedContent = content.trim();
  const canSubmit =
    Boolean(selectedMemberId) && trimmedContent.length > 0 && !isSubmitting;
  const submitVariant = canSubmit ? "primary" : "notFocus";

  const handleClose = () => {
    navigate(-1);
  };

  // 가족 구성원 조회 (/message/family-members)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchFamilyMembers = async () => {
      try {
        setIsLoadingMembers(true);
        setLoadError("");

        const res = await fetch(`${API_BASE_URL}/message/family-members`, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("가족 목록을 불러오지 못했습니다.");
        }

        const data = await res.json();
        // 예시: [{ id, nickname, profileImage }]
        const normalized = (data || []).map((m) => ({
          id: m.id,
          name: m.nickname || "누군가",
          imageSrc: m.profileImage || null,
        }));

        setMembers(normalized);
        if (normalized.length > 0) {
          setSelectedMemberId(normalized[0].id);
        }
      } catch (error) {
        console.error(error);
        setLoadError("가족 목록을 불러오지 못했어요.");
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchFamilyMembers();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch(`${API_BASE_URL}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: selectedMemberId,
          content: trimmedContent,
        }),
      });

      if (!res.ok) {
        throw new Error("쪽지를 전송하지 못했습니다.");
      }

      // 성공 시 이전 페이지로
      navigate(-1);
    } catch (error) {
      console.error(error);
      setSubmitError("쪽지를 전송하지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
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

            {loadError && (
              <p className="mb-2 text-xs text-red-500">{loadError}</p>
            )}

            {isLoadingMembers ? (
              <p className="text-sm text-gray-60">
                가족 목록을 불러오는 중이에요…
              </p>
            ) : members.length === 0 ? (
              <p className="text-sm text-gray-60">
                쪽지를 보낼 가족 구성원이 없습니다.
              </p>
            ) : (
              <div className="flex gap-3">
                {members.map((member) => {
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
            )}
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
            {submitError && (
              <p className="mb-2 text-xs text-red-500">{submitError}</p>
            )}
            <Button size="large" variant={submitVariant} type="submit">
              {isSubmitting ? "전송 중..." : "전송하기"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
