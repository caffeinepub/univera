import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Heart, Home, LayoutGrid, MessageCircle, User } from "lucide-react";

const tabs = [
  { path: "/home", icon: Home, label: "Home" },
  { path: "/feed", icon: LayoutGrid, label: "Feed" },
  { path: "/matches", icon: Heart, label: "Likes" },
  { path: "/chat/m1", icon: MessageCircle, label: "Chat" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const current = location.pathname;

  return (
    <nav
      className="glass-dark border-t border-border/50 px-2 py-2 flex justify-around"
      data-ocid="bottom.nav"
    >
      {tabs.map(({ path, icon: Icon, label }) => {
        const isActive =
          current === path ||
          (path === "/chat/m1" && current.startsWith("/chat")) ||
          (path === "/home" && current === "/home");
        return (
          <button
            type="button"
            key={path}
            onClick={() => navigate({ to: path })}
            className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid={`bottom.${label.toLowerCase()}.link`}
          >
            <Icon
              size={20}
              className={
                isActive ? "drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" : ""
              }
            />
            <span className="text-[9px] font-semibold">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
