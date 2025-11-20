import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

// 프로젝트에 맞게 아이콘 경로 / 라우트 경로 바꿔서 쓰면 됨
const NAV_ITEMS = [
  {
    path: "/archive",
    label: "보관함",
    icon: "/icons/archive.svg",
  },
  {
    path: "/daily",
    label: "일상기록",
    icon: "/icons/daily.svg",
  },
  {
    path: "/video",
    label: "영상답변",
    icon: "/icons/video.svg",
  },
  {
    path: "/messages",
    label: "쪽지함",
    icon: "/icons/message.svg",
  },
  {
    path: "/mypage",
    label: "내정보",
    icon: "/icons/user.svg",
  },
];

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // 헤더랑 비슷하게: w-full px-4 flex
  // 고정 위치: fixed bottom-0 left-0 right-0
  const containerClass =
    "fixed bottom-0 left-0 right-0 bg-bg-app border-t border-gray-200";
  const innerClass = "w-full px-4 h-20 flex items-center"; // 높이 적당히 80px 정도

  return (
    <nav className={containerClass}>
      <div className={innerClass}>
        <ul className="flex w-full justify-between">
          {NAV_ITEMS.map((item) => {
            // 하위 경로(/video/detail 같은 것)도 활성으로 보고 싶으면 startsWith 사용
            const isActive = location.pathname.startsWith(item.path);

            const activeColor = "text-accent";
            const inactiveColor = "text-text-main";

            return (
              <li key={item.path} className="flex-1">
                <button
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`w-full flex flex-col items-center justify-center gap-1 ${
                    isActive ? activeColor : inactiveColor
                  }`}
                >
                  <img src={item.icon} alt={item.label} className="w-7 h-7" />
                  <span className="text-[10px] leading-tight">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default BottomNav;
