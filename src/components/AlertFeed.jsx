import { useState, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function AlertFeed() {
  const [activeFilter, setActiveFilter] = useState("New");
  const { alerts, markAlertAsRead, markAllAlertsAsRead, getUnreadAlertCount } =
    useNotifications();
  const filters = ["New", "Escalations", "Reassignment", "System"];

  // Automatically mark alerts as read when viewing a category
  useEffect(() => {
    const timer = setTimeout(() => {
      if (alerts[activeFilter]?.length > 0) {
        markAllAlertsAsRead(activeFilter);
      }
    }, 3000); // Mark all as read after 3 seconds of viewing

    return () => clearTimeout(timer);
  }, [activeFilter, alerts, markAllAlertsAsRead]);

  const handleAlertClick = (alert) => {
    if (!alert.read) {
      markAlertAsRead(alert.id, alert.type);
    }
  };

  return (
    <div className="bg-ui-surface p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold text-ui-text">Alerts</h2>
        <button
          onClick={() => markAllAlertsAsRead(activeFilter)}
          className="text-xs text-brand-primary hover:text-brand-secondary"
        >
          Mark all as read
        </button>
      </div>
      <div className="flex gap-2 mb-4 border-b">
        {filters.map((filter) => {
          const unreadCount = getUnreadAlertCount(filter);
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`py-2 px-3 text-sm font-medium relative ${
                activeFilter === filter
                  ? "border-b-2 border-brand-primary text-brand-primary"
                  : "text-ui-subtext"
              }`}
            >
              {filter}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-0 h-4 w-4 bg-status-high text-white rounded-full text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {alerts[activeFilter] && alerts[activeFilter].length > 0 ? (
          alerts[activeFilter].map((a) => (
            <div
              key={a.id}
              onClick={() => handleAlertClick(a)}
              className={`p-3 ${
                a.read ? "bg-ui-background" : "bg-ui-background/80"
              } border-l-4 border-brand-primary rounded flex justify-between items-start cursor-pointer transition-colors hover:bg-ui-background`}
            >
              <div>
                <p
                  className={`text-sm ${
                    a.read ? "text-ui-text" : "text-ui-text font-medium"
                  }`}
                >
                  {a.msg}
                </p>
                <span className="text-xs text-ui-subtext">{a.time}</span>
              </div>
              {a.read && (
                <CheckCircleIcon className="w-4 h-4 text-status-resolved flex-shrink-0" />
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-ui-subtext text-center py-4">
            No alerts for this category.
          </p>
        )}
      </div>
    </div>
  );
}
