import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/layouts/Header";
import BottomNav from "@/layouts/BottomNav";
import MessageThreadItem from "@/components/messages/MessageThreadItem";
import MessageFilterToastModal from "@/components/messages/MessageFilterToastModal";

const INITIAL_THREADS = [
  {
    id: 1,
    name: "나동생",
    dateLabel: "11월 27일",
    receivedDate: "2025-11-27", // 필터/정렬용
    isUnread: true,
    content:
      "상세내용 작성입니다.\n상대방이 나에게 보낸 쪽지를 읽을 수 있어요.\n문자 단위로 줄 바꿈 적용해주세요.",
  },
  {
    id: 2,
    name: "엄마",
    dateLabel: "11월 20일",
    receivedDate: "2025-11-20",
    isUnread: false,
    content: "엄마가 보낸 다른 쪽지 내용입니다.",
  },
];

// ✅ 페이지 언마운트 되어도 유지되게 모듈 레벨에 저장
let THREADS_STATE = INITIAL_THREADS;

function formatDateLabel(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1)
    .toString()
    .padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export default function MessagesPage() {
  const navigate = useNavigate();

  // 처음 마운트할 때는 THREADS_STATE를 기준으로
  const [threads, setThreads] = useState(() => THREADS_STATE);

  // 필터 state
  const [filter, setFilter] = useState({
    periodType: "3months", // "3months" | "1month" | "custom"
    startDate: "", // "YYYY-MM-DD"
    endDate: "",
    sortOrder: "latest", // "latest" | "oldest"
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 글쓰기 버튼 → 쪽지 보내기 페이지로 이동
  const handleClickWrite = (e) => {
    e.stopPropagation();
    navigate("/messages/new");
  };

  // 카드 클릭 → 읽음 처리 + 상세 페이지 이동
  const handleClickThread = (thread) => {
    // 1) 읽음 처리
    const nextThreads = threads.map((t) =>
      t.id === thread.id ? { ...t, isUnread: false } : t
    );

    setThreads(nextThreads);
    THREADS_STATE = nextThreads; // ✅ 전역 상태도 같이 업데이트

    // 2) 상세 페이지로 이동
    navigate(`/messages/${thread.id}`, {
      state: {
        senderName: thread.name,
        content: thread.content,
        dateLabel: formatDateLabel(thread.receivedDate),
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
      <Header variant="plain" title="쪽지함" />

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

        {/* 쪽지 리스트 */}
        <section className="mt-2">
          {visibleThreads.map((thread) => (
            <MessageThreadItem
              key={thread.id}
              name={thread.name}
              dateLabel={thread.dateLabel}
              isUnread={thread.isUnread}
              onClick={() => handleClickThread(thread)}
            />
          ))}
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
