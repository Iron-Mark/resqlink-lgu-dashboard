import { useMemo, useState } from "react";
import { OfflineBanner, useOnlineStatus } from "./components/OfflineBanner";
import Dashboard from "./components/Dashboard";
import { BellIcon } from "@heroicons/react/24/outline";
import { useNotifications } from "./context/NotificationContext";
import AlertFeed from "./components/AlertFeed";
import BottomNav from "./components/BottomNav";
import Management from "./components/Management";
import ResponseHistory from "./components/ResponseHistory";
import More from "./components/More";

const NAV_META = {
  dashboard: {
    title: "Command Center",
    description: "Real-time overview of incidents and responder posture",
  },
  management: {
    title: "Responder Management",
    description: "Dispatch, shifts, and safety tools for field teams",
  },
  history: {
    title: "Response History",
    description: "Accountability and after-action insights",
  },
  more: {
    title: "More",
    description: "Settings, legal, and upcoming modules",
  },
};

export default function App() {
  const isOnline = useOnlineStatus();
  const { getUnreadAlertCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const unreadAlertsCount = getUnreadAlertCount();
  const navInfo = NAV_META[activeTab];

  const content = useMemo(() => {
    switch (activeTab) {
      case "management":
        return <Management />;
      case "history":
        return <ResponseHistory />;
      case "more":
        return <More />;
      case "dashboard":
      default:
        return <Dashboard />;
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-ui-background font-sans pb-24">
      <OfflineBanner />

      <header className="sticky top-0 z-20 bg-ui-surface shadow-sm">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 p-4">
          <div>
            <h1 className="text-xl font-bold text-ui-text">{navInfo.title}</h1>
            <p className="text-xs text-ui-subtext">{navInfo.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-semibold ${
                isOnline ? "text-status-resolved" : "text-ui-subtext"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative rounded-full p-2 transition hover:bg-ui-background"
              aria-label="Toggle alerts"
            >
              <BellIcon className="h-6 w-6 text-ui-subtext" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-status-high px-1 text-xs font-bold text-white ring-2 ring-white">
                  {unreadAlertsCount > 9 ? "9+" : unreadAlertsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div
          className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 ease-in-out ${
            showNotifications ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setShowNotifications(false)}
        >
          <div
            className={`fixed bottom-20 left-0 right-0 mx-auto max-w-md rounded-t-2xl bg-ui-surface p-4 shadow-lg transition-transform duration-300 ease-in-out ${
              showNotifications ? "translate-y-0" : "translate-y-full"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-ui-text/40" />
            <AlertFeed />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md pb-12">{content}</main>

      <BottomNav
        activeId={activeTab}
        onNavigate={setActiveTab}
        badges={{ dashboard: unreadAlertsCount || undefined }}
      />
    </div>
  );
}
