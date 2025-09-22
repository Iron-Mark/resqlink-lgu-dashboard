import { useState } from "react";
import { OfflineBanner, useOnlineStatus } from "./components/OfflineBanner";
import Dashboard from "./components/Dashboard";
import { BellIcon } from "@heroicons/react/24/outline";
import { useNotifications } from "./context/NotificationContext";
import AlertFeed from "./components/AlertFeed";

export default function App() {
  const isOnline = useOnlineStatus();
  const { alerts, getUnreadAlertCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadAlertsCount = getUnreadAlertCount();

  return (
    <div className="min-h-screen bg-ui-background font-sans">
      <OfflineBanner />
      <header className="bg-ui-surface shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-ui-text">ResQLink</h1>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold ${
                isOnline ? "text-status-resolved" : "text-ui-subtext"
              }`}
            >
              ● {isOnline ? "Online" : "Offline"}
            </span>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-ui-background relative"
            >
              <BellIcon className="h-6 w-6 text-ui-subtext" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-status-high text-white text-xs ring-2 ring-white">
                  {unreadAlertsCount > 9 ? "9+" : unreadAlertsCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* Bottom Sheet Notifications */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300 ease-in-out ${
            showNotifications ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setShowNotifications(false)}
        >
          <div
            className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-ui-surface rounded-t-2xl shadow-lg p-4 transform transition-transform duration-300 ease-in-out ${
              showNotifications ? "translate-y-0" : "translate-y-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-ui-text rounded-full mx-auto mb-4"></div>
            <AlertFeed />
          </div>
        </div>
      </header>
      <main className="max-w-md mx-auto">
        <Dashboard />
      </main>
    </div>
  );
}
