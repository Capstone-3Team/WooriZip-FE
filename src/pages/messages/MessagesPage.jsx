import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import BottomNav from "@/layouts/BottomNav";
import MessageThreadItem from "@/components/messages/MessageThreadItem";
import MessageFilterToastModal from "@/components/messages/MessageFilterToastModal";

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

export default function MessagesPage() {
  const navigate = useNavigate();

  const [threads, setThreads] = useState([]); // 서버에서 받아온 쪽지 목록
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // 필터 state
  const [filter, setFilter] = useState({
    periodType: "3months", // "3months" | "1month" | "custom"
    startDate: "", // "YYYY-MM-DD"
    endDate: "",
    sortOrder: "latest", // "latest" | "oldest"
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 받은 쪽지 + 가족 프로필 한번에 불러오기
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        // 1) 받은 쪽지 목록
        const receivedRes = await fetch(`${API_BASE_URL}/message/received`, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!receivedRes.ok) {
          throw new Error("쪽지함을 불러오지 못했습니다.");
        }

        const receivedData = await receivedRes.json();

        // 2) 가족 프로필 목록 (MessageWritePage에서 쓰던 API 그대로)
        const membersRes = await fetch(
          `${API_BASE_URL}/message/family-members`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!membersRes.ok) {
          throw new Error("가족 프로필을 불러오지 못했습니다.");
        }

        const membersData = await membersRes.json();

        // nickname -> profileImage 매핑
        const memberImageMap = new Map(
          (membersData || []).map((m) => [m.nickname, m.profileImage || null])
        );

        // 3) 쪽지 + 프로필 이미지 합치기
        const normalized = (receivedData || []).map((item) => ({
          id: item.id,
          name: item.senderNickname,
          receivedDate: item.createdAt,
          dateLabel: formatDateLabel(item.createdAt),
          isUnread:
            item.isRead !== undefined
              ? !item.isRead
              : item.read !== undefined
              ? !item.read
              : false,
          content: item.content || "",
          // 🔥 닉네임 기준으로 프로필 이미지 붙이기
          profileImage: memberImageMap.get(item.senderNickname) || null,
        }));

        setThreads(normalized);
      } catch (error) {
        console.error(error);
        setErrorMessage("쪽지함을 불러오지 못했어요.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // 글쓰기 버튼 → 쪽지 보내기 페이지로 이동
  const handleClickWrite = (e) => {
    e.stopPropagation();
    navigate("/messages/new");
  };

  // 카드 클릭 → 읽음 처리(프론트 기준) + 상세 페이지 이동
  const handleClickThread = (thread) => {
    const nextThreads = threads.map((t) =>
      t.id === thread.id ? { ...t, isUnread: false } : t
    );
    setThreads(nextThreads);

    navigate(`/messages/${thread.id}`, {
      state: {
        senderName: thread.name,
        content: thread.content,
        dateLabel: thread.dateLabel,
        // 필요하다면 상세 페이지에서도 프로필 이미지 사용
        // profileImage: thread.profileImage,
      },
    });
  };

  // 필터 라벨 (상단 "3개월 · 최신순" 부분)
  const periodLabel = (() => {
    if (filter.periodType === "3months") return "3개월";
    if (filter.periodType === "1month") return "1개월";
    if (filter.periodType === "custom") {
      if (filter.startDate && filter.endDate) {
        return `${formatDateLabel(filter.startDate)} ~ ${formatDateLabel(
          filter.endDate
        )}`;
      }
      return "직접설정";
    }
    return "";
  })();

  const sortLabel = filter.sortOrder === "latest" ? "최신순" : "과거순";
  const filterLabel = `${periodLabel} · ${sortLabel}`;

  // 필터 + 정렬 적용된 리스트
  const visibleThreads = (() => {
    let list = [...threads];
    const now = new Date();

    if (filter.periodType === "3months" || filter.periodType === "1month") {
      const months = filter.periodType === "3months" ? 3 : 1;
      const to = now;
      const from = new Date(now);
      from.setMonth(from.getMonth() - months);

      list = list.filter((t) => {
        const d = new Date(t.receivedDate);
        return d >= from && d <= to;
      });
    } else if (
      filter.periodType === "custom" &&
      filter.startDate &&
      filter.endDate
    ) {
      const from = new Date(filter.startDate);
      const to = new Date(filter.endDate);
      list = list.filter((t) => {
        const d = new Date(t.receivedDate);
        return d >= from && d <= to;
      });
    }

    list.sort((a, b) => {
      const da = new Date(a.receivedDate);
      const db = new Date(b.receivedDate);
      if (filter.sortOrder === "latest") {
        return db - da; // 최신이 위로
      }
      return da - db; // 과거순
    });

    return list;
  })();

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      {/* 헤더 */}
      <Header variant="plain" title="쪽지함" bgClassName="bg-yellow-20" />

      {/* 본문 */}
      <main className="flex-1 overflow-y-auto pb-32">
        {/* 상단 필터 (3개월 · 최신순) */}
        <div className="px-4 mb-4 mt-4">
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-medium text-text-main"
            onClick={() => setIsFilterOpen(true)}
          >
            <span>{filterLabel}</span>
            <img
              src="/icons/arrow-down.svg"
              alt="필터 열기"
              className="w-4 h-4"
            />
          </button>
        </div>

        {/* 오류 메시지 */}
        {errorMessage && (
          <p className="px-4 text-xs text-red-500 mb-2">{errorMessage}</p>
        )}

        {/* 쪽지 리스트 */}
        <section className="mt-2 px-0">
          {isLoading ? (
            <p className="px-4 text-sm text-gray-60">
              쪽지함을 불러오는 중이에요…
            </p>
          ) : visibleThreads.length === 0 ? (
            <p className="px-4 text-sm text-gray-60">
              받은 쪽지가 아직 없어요.
            </p>
          ) : (
            visibleThreads.map((thread) => (
              <MessageThreadItem
                key={thread.id}
                name={thread.name}
                dateLabel={thread.dateLabel}
                isUnread={thread.isUnread}
                imageSrc={thread.profileImage}
                onClick={() => handleClickThread(thread)}
              />
            ))
          )}
        </section>
      </main>

      {/* 글쓰기 플로팅 버튼 */}
      <div
        className="fixed right-6 bottom-24 z-30"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClickWrite}
          className="flex items-center gap-2 px-4 h-10 rounded-lg bg-yellow-main text-sm font-semibold text-text-main shadow-[0_2px_4px_rgba(0,0,0,0.12)] border border-text-main"
        >
          <img src="/icons/plus.svg" alt="쪽지 쓰기" className="w-4 h-4" />
          글쓰기
        </button>
      </div>

      {/* 하단 네비게이션 */}
      <BottomNav />

      {/* 필터 토스트 모달 */}
      <MessageFilterToastModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filter={filter}
        onChangeFilter={setFilter}
      />
    </div>
  );
}
