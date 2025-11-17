import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/archive", label: "보관함", icon: "/icons/folder.svg" },
  { to: "/daily", label: "일상기록", icon: "/icons/note-edit.svg" },
  { to: "/answers", label: "영상답변", icon: "/icons/plus-box.svg" },
  { to: "/letters", label: "쪽지함", icon: "/icons/message.svg" },
  { to: "/profile", label: "내정보", icon: "/icons/person.svg" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 border-t border-black/10 bg-bg-app">
      <ul className="flex h-16 items-center justify-between px-4">
        {navItems.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex flex-col items-center justify-center gap-1 text-[11px]",
                  isActive ? "text-yellow-main" : "text-text-main/60",
                ].join(" ")
              }
            >
              <img src={item.icon} alt={item.label} className="h-6 w-6" />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
