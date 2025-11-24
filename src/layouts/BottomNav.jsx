import { useLocation, useNavigate } from "react-router-dom";

// 프로젝트에 맞게 아이콘 경로 / 라우트 경로 바꿔서 쓰면 됨
const NAV_ITEMS = [
  {
    path: "/archive",
    label: "보관함",
    icon: "/icons/inactive/archive.svg",
    activeIcon: "/icons/active/archive.svg",
  },
  {
    path: "/daily",
    label: "일상기록",
    icon: "/icons/inactive/daily.svg",
    activeIcon: "/icons/active/daily.svg",
  },
  {
    path: "/week-answer",
    label: "영상답변",
    icon: "/icons/inactive/video.svg",
    activeIcon: "/icons/active/video.svg",
  },
  {
    path: "/messages",
    label: "쪽지함",
    icon: "/icons/inactive/messages.svg",
    activeIcon: "/icons/active/messages.svg",
  },
  {
    path: "/mypage",
    label: "내정보",
    icon: "/icons/inactive/mypage.svg",
    activeIcon: "/icons/active/mypage.svg",
  },
];

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // 배경 gray-20, 상단 구분선 gray-60
  const containerClass =
    "fixed bottom-0 left-0 right-0 bg-gray-20 border-t border-gray-60";

  // 헤더랑 맞춰서 px-4, 높이 100px
  const innerClass = "w-full px-4 h-20 flex items-center";

  return (
    <nav className={containerClass}>
      <div className={innerClass}>
        <ul className="flex w-full justify-between">
          {NAV_ITEMS.map((item) => {
            // const isActive = location.pathname === item.path; 메인에서만 하단바 사용하면 걍 이걸로 해도 됨
            // 하위 경로(/video/detail 같은 것)도 활성으로 보고 싶으면 startsWith 사용
            const isActive = location.pathname.startsWith(item.path);

            const activeColor = "text-text-main";
            const inactiveColor = "text-gray-60";

            const iconSrc = isActive ? item.activeIcon ?? item.icon : item.icon;

            return (
              <li key={item.path} className="flex-1">
                <button
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`w-full flex flex-col items-center justify-center gap-1 ${
                    isActive ? activeColor : inactiveColor
                  }`}
                >
                  <img src={iconSrc} alt={item.label} className="w-7 h-7" />
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
