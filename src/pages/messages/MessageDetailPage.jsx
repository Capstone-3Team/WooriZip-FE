import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "@/layouts/Header";
import Button from "@/components/buttons/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function formatDateLabel(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export default function MessageDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // 목록/글쓰기 페이지에서 넘어올 때 state로 값이 있을 수 있음
  const {
    senderName: initSenderName = "",
    content: initContent = "",
    dateLabel: initDateLabel = "",
  } = location.state || {};

  const [senderName, setSenderName] = useState(initSenderName);
  const [content, setContent] = useState(initContent);
  const [dateLabel, setDateLabel] = useState(initDateLabel);
  const [isLoading, setIsLoading] = useState(!initSenderName && !initContent);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchMessageDetail = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const res = await fetch(`${API_BASE_URL}/message/${id}`, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("쪽지 내용을 불러오지 못했습니다.");
        }

        const data = await res.json();
        // 예시: { id, senderNickname, content, createdAt }
        setSenderName(data.senderNickname || "알 수 없는 사용자");
        setContent(data.content || "");
        setDateLabel(formatDateLabel(data.createdAt));
      } catch (error) {
        console.error(error);
        setErrorMessage("쪽지 내용을 불러오지 못했어요.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessageDetail();
  }, [id, navigate]);

  const handleBack = () => navigate(-1);
  const handleConfirm = () => navigate(-1);

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      {/* 헤더 */}
      <Header
        bgClassName="bg-bg-app"
        variant="solid"
        title="쪽지함"
        leftIcon={
          <img src="/icons/back.svg" alt="뒤로가기" className="w-8 h-8" />
        }
        onLeftClick={handleBack}
        leftAriaLabel="뒤로가기"
      />

      <main className="flex-1 px-6 pt-4 pb-6 flex flex-col">
        {errorMessage && (
          <p className="mb-2 text-xs text-red-500">{errorMessage}</p>
        )}

        {/* 쪽지 카드 */}
        <section className="mt-4 flex-1">
          <div className="relative w-full h-full bg-yellow-20 px-6 pt-8 pb-8">
            {/* 오른쪽 위 접힌 모서리 */}
            <div className="absolute right-0 top-0">
              <div className="w-8 h-8 bg-yellow-main relative overflow-hidden">
                <div className="w-full h-full bg-bg-app [clip-path:polygon(100%_0,0_0,100%_100%)]" />
              </div>
            </div>

            {/* 보낸 사람 이름 */}
            <h2 className="text-lg font-semibold text-text-main">
              {isLoading ? "불러오는 중..." : senderName || "알 수 없는 사용자"}
            </h2>

            {/* 내용 */}
            <p className="mt-6 text-sm leading-relaxed text-text-main whitespace-pre-line">
              {isLoading ? "쪽지 내용을 불러오는 중입니다…" : content}
            </p>

            {/* 날짜 */}
            <p className="mt-8 text-xs text-text-main text-right">
              {dateLabel}
            </p>
          </div>
        </section>

        {/* 하단 버튼 */}
        <div className="mt-8">
          <Button
            size="large"
            variant="primary"
            type="button"
            onClick={handleConfirm}
          >
            확인
          </Button>
        </div>
      </main>
    </div>
  );
}
