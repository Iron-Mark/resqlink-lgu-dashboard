import { useEffect, useState } from "react";
import { MapPinIcon, ClockIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function PopupIncident({
  incident,
  onClose,
  onSnooze,
  onAssign,
  onOpen,
}) {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const severityConfig = {
    High: {
      chip: "bg-status-high/10 text-status-high border-status-high",
      label: "High Severity",
    },
    Medium: {
      chip: "bg-status-medium/10 text-status-medium border-status-medium",
      label: "Medium Severity",
    },
    Low: {
      chip: "bg-status-low/10 text-status-low border-status-low",
      label: "Low Severity",
    },
  };
  const { chip, label } =
    severityConfig[incident.severity] || severityConfig.Low;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative bg-ui-surface p-0 rounded-2xl w-full max-w-sm shadow-2xl border border-ui-border/50 overflow-hidden">
        {/* Image Banner */}
        <div className="w-full h-48 bg-ui-background flex items-center justify-center overflow-hidden">
          <img
            src={incident.mediaUrl}
            alt={incident.type}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 w-9 h-9 bg-ui-surface text-ui-subtext rounded-full flex items-center justify-center shadow hover:bg-ui-border transition-colors z-10"
          onClick={onClose}
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${chip}`}
            >
              {label}
            </span>
            <span className="text-xs text-ui-subtext font-mono bg-ui-background px-2 py-1 rounded flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              {String(Math.floor(timer / 60)).padStart(2, "0")}:
              {String(timer % 60).padStart(2, "0")}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-ui-text mb-1">
            {incident.type}
          </h3>
          <div className="flex items-center gap-2 text-ui-subtext mb-4">
            <MapPinIcon className="w-5 h-5" />
            <span className="font-medium text-sm">{incident.location}</span>
          </div>
          <div className="mt-6 space-y-3">
            <button
              className="w-full px-4 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
              onClick={() => onOpen?.()}
            >
              Open Incident
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="px-4 py-3 bg-ui-background text-ui-text rounded-lg font-semibold hover:bg-ui-border transition-colors"
                onClick={onSnooze}
              >
                Snooze
              </button>
              <button
                className="px-4 py-3 bg-brand-secondary text-white rounded-lg font-semibold hover:bg-brand-primary transition-colors"
                onClick={onAssign}
              >
                Assign Responder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



