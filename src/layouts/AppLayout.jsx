import { Outlet } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-bg-app text-text-main font-sans">
      {/* 페이지에서 각자 Header 렌더링 */}
      <main className="flex-1 pb-16">
        {/* 여기 안에서 라우트별 페이지가 바뀜 */}
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
