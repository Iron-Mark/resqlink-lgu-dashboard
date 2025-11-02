import React, { useState, useEffect } from "react";
import {
  Settings,
  Globe,
  Sun,
  Moon,
  Type,
  Volume2,
  Download,
  Database,
  RefreshCw,
  Shield,
  Building2,
  Users,
  Lock,
  FileText,
  LogOut,
  ChevronRight,
  Wifi,
  Check,
  UserCog,
} from "lucide-react";

export default function More() {
  const [activeDialog, setActiveDialog] = useState(null);
  const [language, setLanguage] = useState(
    () => localStorage.getItem("app_language") || "English"
  );
  const [theme, setTheme] = useState(
    () => localStorage.getItem("app_theme") || "light"
  );
  const [textSize, setTextSize] = useState(
    () => localStorage.getItem("app_textSize") || "medium"
  );
  const [volume, setVolume] = useState(
    () => parseInt(localStorage.getItem("app_volume")) || 80
  );
  const [cacheSize, setCacheSize] = useState("24.5");
  const [autoSync, setAutoSync] = useState(
    () => localStorage.getItem("app_autoSync") !== "false"
  );
  const [dataRetention, setDataRetention] = useState(
    () => localStorage.getItem("app_dataRetention") || "90"
  );

  useEffect(() => {
    localStorage.setItem("app_language", language);
    localStorage.setItem("app_theme", theme);
    localStorage.setItem("app_textSize", textSize);
    localStorage.setItem("app_volume", volume.toString());
    localStorage.setItem("app_autoSync", autoSync.toString());
    localStorage.setItem("app_dataRetention", dataRetention);
    document.documentElement.classList.toggle("dark", theme === "dark");
    const fontSizeMap = { small: "14px", medium: "16px", large: "18px" };
    document.documentElement.style.fontSize = fontSizeMap[textSize];
  }, [language, theme, textSize, volume, autoSync, dataRetention]);

  const handleExportLogs = () => {
    const logs = {
      exportDate: new Date().toISOString(),
      systemInfo: { version: "2.1.4", language, theme, textSize },
      incidents: JSON.parse(localStorage.getItem("incident_history") || "[]"),
      settings: { language, theme, textSize, volume, autoSync, dataRetention },
    };
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "resqlink-logs-" + new Date().toISOString().split("T")[0] + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("Logs exported successfully!");
  };

  const handleClearCache = () => {
    if (confirm("Are you sure you want to clear all cached data?")) {
      const keysToKeep = [
        "app_language",
        "app_theme",
        "app_textSize",
        "app_volume",
        "app_autoSync",
        "app_dataRetention",
      ];
      const itemsToKeep = {};
      keysToKeep.forEach((key) => {
        const value = localStorage.getItem(key);
        if (value !== null) itemsToKeep[key] = value;
      });
      localStorage.clear();
      Object.entries(itemsToKeep).forEach(([key, value]) =>
        localStorage.setItem(key, value)
      );
      setCacheSize("0.0");
      setTimeout(() => setCacheSize("2.1"), 1000);
      alert("Cache cleared successfully!");
    }
  };

  const handleToggleSync = () => setAutoSync(!autoSync);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      const systemPrefs = {
        language: localStorage.getItem("app_language"),
        theme: localStorage.getItem("app_theme"),
        textSize: localStorage.getItem("app_textSize"),
        volume: localStorage.getItem("app_volume"),
      };
      localStorage.clear();
      Object.entries(systemPrefs).forEach(([key, value]) => {
        if (value) localStorage.setItem(key, value);
      });
      alert("Logged out successfully!");
      window.location.reload();
    }
  };

  function SystemPreferencesDialog() {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6" />
                <h2 className="text-xl font-semibold">System Preferences</h2>
              </div>
              <button
                onClick={() => setActiveDialog(null)}
                className="text-white/80 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4" />
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="English">English</option>
                <option value="Filipino">Filipino</option>
                <option value="Cebuano">Cebuano</option>
                <option value="Ilocano">Ilocano</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                {theme === "light" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                Theme
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTheme("light")}
                  className={
                    "px-4 py-3 rounded-xl border-2 transition-all " +
                    (theme === "light"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-gray-50 text-gray-700")
                  }
                >
                  <Sun className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={
                    "px-4 py-3 rounded-xl border-2 transition-all " +
                    (theme === "dark"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-gray-50 text-gray-700")
                  }
                >
                  <Moon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Dark</span>
                </button>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Type className="w-4 h-4" />
                Text Size
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["small", "medium", "large"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setTextSize(size)}
                    className={
                      "px-4 py-3 rounded-xl border-2 transition-all capitalize " +
                      (textSize === size
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-gray-50 text-gray-700")
                    }
                  >
                    <span className="text-sm font-medium">{size}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Volume2 className="w-4 h-4" />
                Alert Volume: {volume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Mute</span>
                <span>Max</span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="w-4 h-4" />
                <span>Changes saved automatically</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function DataManagementDialog() {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Data Management</h2>
              </div>
              <button
                onClick={() => setActiveDialog(null)}
                className="text-white/80 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Logs & Exports
              </h3>
              <button
                onClick={handleExportLogs}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      Export Incident Logs
                    </div>
                    <div className="text-xs text-gray-600">
                      Download all incident data as JSON
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Cache & Storage
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Cache Size</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {cacheSize} MB
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: (parseFloat(cacheSize) / 50) * 100 + "%",
                      }}
                    />
                  </div>
                </div>
                <button
                  onClick={handleClearCache}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-red-600" />
                    <div className="text-left">
                      <div className="font-medium text-red-900">
                        Clear Local Cache
                      </div>
                      <div className="text-xs text-red-600">
                        Free up temporary storage
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Synchronization
              </h3>
              <button
                onClick={handleToggleSync}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw
                    className={
                      "w-5 h-5 " +
                      (autoSync ? "text-green-600" : "text-gray-400")
                    }
                  />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Auto-Sync</div>
                    <div className="text-xs text-gray-600">
                      {autoSync
                        ? "Enabled - Syncing automatically"
                        : "Disabled - Manual sync only"}
                    </div>
                  </div>
                </div>
                <div
                  className={
                    "px-3 py-1 rounded-full text-xs font-semibold " +
                    (autoSync
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600")
                  }
                >
                  {autoSync ? "ON" : "OFF"}
                </div>
              </button>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Data Retention Policy
              </h3>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="mb-3 text-sm font-medium text-gray-900">
                  Auto-delete archived data after:
                </div>
                <div className="space-y-2">
                  {[
                    { value: "30", label: "30 days" },
                    { value: "90", label: "90 days (Recommended)" },
                    { value: "180", label: "180 days" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white cursor-pointer transition"
                    >
                      <input
                        type="radio"
                        name="retention"
                        value={option.value}
                        checked={dataRetention === option.value}
                        onChange={(e) => setDataRetention(e.target.value)}
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                      <span className="text-sm text-gray-900">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-900 font-medium mb-1">Note:</p>
              <p className="text-xs text-blue-700">
                These settings only affect local device storage. All data
                remains safely stored in the ResQLink cloud database.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function LGUAdminDialog() {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6" />
                <h2 className="text-xl font-semibold">LGU Admin Controls</h2>
              </div>
              <button
                onClick={() => setActiveDialog(null)}
                className="text-white/80 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Access Management
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() =>
                    alert("Manage Facilities feature coming soon!")
                  }
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        Manage Facilities
                      </div>
                      <div className="text-xs text-gray-600">
                        Add or edit LGU facilities
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={() =>
                    alert("Manage Responders feature coming soon!")
                  }
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        Manage Responders
                      </div>
                      <div className="text-xs text-gray-600">
                        Add, suspend, or edit responders
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Access Control
              </h3>
              <button
                onClick={() =>
                  alert("Roles & Permissions feature coming soon!")
                }
                className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      Roles & Permissions
                    </div>
                    <div className="text-xs text-gray-600">
                      Configure access levels
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Security
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => alert("Audit Logs feature coming soon!")}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        Audit Logs
                      </div>
                      <div className="text-xs text-gray-600">
                        View system activity logs
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={() =>
                    alert("Security Settings feature coming soon!")
                  }
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-gray-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        Security Settings
                      </div>
                      <div className="text-xs text-gray-600">
                        Configure security policies
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <section className="rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">System & Account</h1>
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-green-400 px-2.5 py-0.5">
                <div className="h-2 w-2 rounded-full bg-white" />
                <span className="text-xs font-semibold text-green-900">
                  Online
                </span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                2
              </div>
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <button
        onClick={() => alert("Account management coming soon!")}
        className="w-full rounded-2xl border border-ui-border bg-white p-4 shadow-sm transition hover:border-brand-primary hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <UserCog className="h-7 w-7 text-blue-600" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-bold text-gray-900">City of Makati - DRRM</h3>
            <p className="text-sm text-gray-500">
              Manage admin credentials and linked LGU
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </button>

      <section className="rounded-2xl border border-ui-border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-gray-500" />
            <h3 className="font-bold text-gray-900">System Overview</h3>
          </div>
          <span className="text-xs text-gray-500">Last Sync: 9:24 AM</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600">
              <Wifi className="h-4 w-4" />
              Active Mesh Nodes:
            </span>
            <span className="font-semibold text-blue-600">21 Nodes</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600">
              <Check className="h-4 w-4" />
              System Uptime
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-green-600">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              99.8%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600">
              <Settings className="h-4 w-4" />
              AI Modules
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-green-600">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Running
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-ui-border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Settings className="h-4 w-4 text-gray-500" />
          <h3 className="font-bold text-gray-900">System Controls</h3>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => setActiveDialog("lgu-admin")}
            className="flex w-full items-center gap-3 rounded-xl bg-blue-50 p-3 transition hover:bg-blue-100"
          >
            <Shield className="h-5 w-5 text-blue-600" />
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900">
                LGU Admin Controls
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
          <button
            onClick={() => setActiveDialog("preferences")}
            className="flex w-full items-center gap-3 rounded-xl bg-blue-50 p-3 transition hover:bg-blue-100"
          >
            <Settings className="h-5 w-5 text-blue-600" />
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900">
                System Preferences
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
          <button
            onClick={() => setActiveDialog("data-management")}
            className="flex w-full items-center gap-3 rounded-xl bg-blue-50 p-3 transition hover:bg-blue-100"
          >
            <Database className="h-5 w-5 text-blue-600" />
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900">Data Management</div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-ui-border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-500" />
            <h3 className="font-bold text-gray-900">Information & Policy</h3>
          </div>
          <span className="text-xs text-gray-500">v1.17.06.2025</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <button
            onClick={() => alert("Terms of Use & Privacy Policy")}
            className="text-left font-medium text-blue-600 underline"
          >
            Terms of Use & Privacy Policy
          </button>
          <button
            onClick={() => alert("Contact Support: support@resqlink.ph")}
            className="text-left font-medium text-blue-600 underline"
          >
            Contact Support
          </button>
          <button
            onClick={() => alert("Future Development roadmap coming soon!")}
            className="text-left font-medium text-blue-600 underline"
          >
            Future Development
          </button>
          <button
            onClick={() =>
              alert("ResQLink v2.1.4 - LGU Dashboard by Iron-Mark")
            }
            className="text-left font-medium text-blue-600 underline"
          >
            About ResQLink
          </button>
        </div>
      </section>

      <button
        onClick={handleLogout}
        className="w-full rounded-xl bg-red-50 border border-red-200 p-4 flex items-center justify-center gap-2 text-red-600 font-semibold hover:bg-red-100 transition"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>

      {activeDialog === "preferences" && <SystemPreferencesDialog />}
      {activeDialog === "data-management" && <DataManagementDialog />}
      {activeDialog === "lgu-admin" && <LGUAdminDialog />}
    </div>
  );
}
