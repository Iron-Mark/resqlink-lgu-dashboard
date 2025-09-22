import { Home, Map, Users2, UserRound } from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "reports", label: "Reports", icon: Map, badge: 2 },
  { id: "contacts", label: "Contacts", icon: Users2 },
  { id: "profile", label: "Profile", icon: UserRound },
];

export default function BottomNav({ activeId = "dashboard", onNavigate }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ui-border bg-ui-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around gap-1 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pt-2">
        {NAV_ITEMS.map(({ id, label, icon: Icon, badge }) => {
          const isActive = id === activeId;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate?.(id)}
              className={`relative flex flex-1 flex-col items-center gap-1 rounded-md py-2 transition-colors ${
                isActive ? "text-brand-primary" : "text-ui-subtext"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
                  isActive ? "bg-brand-primary/10" : "bg-transparent"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.7 : 2} />
              </span>
              <span className={`text-xs font-medium ${isActive ? "text-brand-primary" : "text-ui-subtext"}`}>
                {label}
              </span>
              {badge ? (
                <span className="absolute top-1/2 left-1/2 -translate-y-6 translate-x-4 rounded-full bg-status-high px-1.5 text-[10px] font-bold text-white shadow">
                  {badge}
                </span>
              ) : null}
              {isActive ? (
                <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-brand-primary" />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
