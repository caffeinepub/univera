import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Flame, Heart, Home, MessageCircle, User } from "lucide-react";

const tabs = [
  { path: "/home-feed", icon: Home, label: "Home" },
  { path: "/app", icon: Flame, label: "Swipe" },
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
      className="glass-dark border-t border-border/50 px-1 pt-2 flex justify-around flex-shrink-0"
      style={{
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
      data-ocid="bottom.nav"
    >
      {tabs.map(({ path, icon: Icon, label }) => {
        const isActive =
          (path === "/app" && current === "/app") ||
          (path === "/home-feed" && current === "/home-feed") ||
          (path === "/chat/m1" && current.startsWith("/chat")) ||
          (path !== "/app" &&
            path !== "/chat/m1" &&
            path !== "/home-feed" &&
            current === path);
        return (
          <button
            type="button"
            key={path}
            onClick={() => navigate({ to: path })}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[44px] min-h-[44px] justify-center ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid={`bottom.${label.toLowerCase()}.link`}
          >
            <Icon
              size={22}
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
