import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
import { NotificationProvider } from "./context/NotificationContext";
import { IncidentProvider } from "./context/IncidentContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NotificationProvider>
      <IncidentProvider>
        <App />
      </IncidentProvider>
    </NotificationProvider>
  </React.StrictMode>
);
