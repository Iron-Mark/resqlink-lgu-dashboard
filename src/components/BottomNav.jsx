import { Home, ClipboardList, History, Menu } from "lucide-react";

const DEFAULT_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "management", label: "Management", icon: ClipboardList },
  { id: "history", label: "History", icon: History },
  { id: "more", label: "More", icon: Menu },
];

export default function BottomNav({
  activeId,
  onNavigate,
  items = DEFAULT_NAV_ITEMS,
  badges = {},
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ui-border bg-ui-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around gap-1 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pt-2">
        {items.map(({ id, label, icon: Icon, badge }) => {
          const isActive = id === activeId;
          const resolvedBadge = badge ?? badges[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate?.(id)}
              className={`relative flex flex-1 flex-col items-center gap-1 rounded-md px-2 py-2 transition-colors ${
                isActive ? "text-brand-primary" : "text-ui-subtext"
              }`}
              aria-pressed={isActive}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
                  isActive ? "bg-brand-primary/10" : "bg-transparent"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.6 : 2} />
              </span>
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-brand-primary" : "text-ui-subtext"
                }`}
              >
                {label}
              </span>
              {resolvedBadge ? (
                <span className="absolute top-1 right-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-status-high px-1 text-[10px] font-bold text-white">
                  {resolvedBadge > 9 ? "9+" : resolvedBadge}
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
