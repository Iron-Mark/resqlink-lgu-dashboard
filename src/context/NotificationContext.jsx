import React, { createContext, useState, useContext, useCallback } from "react";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [alerts, setAlerts] = useState({
    New: [],
    Escalations: [],
    Reassignment: [],
    System: [
      {
        id: `sys-${Date.now()}`,
        msg: "System: 5 responders now online",
        time: "1h ago",
        type: "System",
        read: false,
      },
    ],
  });
  const [popupIncident, setPopupIncident] = useState(null);

  const addAlert = useCallback((alert) => {
    // Add read: false to new alerts
    const newAlert = { ...alert, read: false };
    setAlerts((prevAlerts) => ({
      ...prevAlerts,
      [alert.type]: [newAlert, ...prevAlerts[alert.type]],
    }));
  }, []);

  const markAlertAsRead = useCallback((alertId, alertType) => {
    setAlerts((prevAlerts) => ({
      ...prevAlerts,
      [alertType]: prevAlerts[alertType].map((alert) =>
        alert.id === alertId ? { ...alert, read: true } : alert
      ),
    }));
  }, []);

  const markAllAlertsAsRead = useCallback((alertType) => {
    setAlerts((prevAlerts) => ({
      ...prevAlerts,
      [alertType]: prevAlerts[alertType].map((alert) => ({
        ...alert,
        read: true,
      })),
    }));
  }, []);

  const getUnreadAlertCount = useCallback(
    (type = null) => {
      if (type) {
        return alerts[type]?.filter((alert) => !alert.read).length || 0;
      }
      return Object.values(alerts)
        .flat()
        .filter((alert) => !alert.read).length;
    },
    [alerts]
  );

  const showIncidentPopup = (incident) => {
    setPopupIncident(incident);
    addAlert({
      id: `alert-${incident.id}`,
      msg: `New report: ${incident.type} in ${incident.location}`,
      time: "Just now",
      type: "New",
    });
  };

  const closeIncidentPopup = () => {
    setPopupIncident(null);
  };

  const value = {
    alerts,
    addAlert,
    popupIncident,
    showIncidentPopup,
    closeIncidentPopup,
    markAlertAsRead,
    markAllAlertsAsRead,
    getUnreadAlertCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
