import { useState } from "react";
import {
  MegaphoneIcon,
  MapIcon,
  PlusIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/solid";

const channelOptions = ["SMS", "Push", "Radio"];
const MESSAGE_LIMIT = 240;

const BroadcastAlertModal = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("High");
  const [audience, setAudience] = useState("All responders");
  const [channels, setChannels] = useState(["SMS", "Push"]);
  const [error, setError] = useState("");

  const toggleChannel = (channel) => {
    setChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!message.trim()) {
      setError("Message is required");
      return;
    }
    if (channels.length === 0) {
      setError("Select at least one channel");
      return;
    }

    if (onSubmit) {
      onSubmit({
        title: title.trim(),
        message: message.trim(),
        priority,
        audience,
        channels,
      });
    }
    setError("");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-ui-surface w-full max-w-md rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-ui-text">Broadcast Alert</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-ui-subtext hover:text-ui-text hover:bg-ui-background"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ui-subtext mb-1">
              Alert title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-ui-border rounded-lg bg-ui-background focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="Flood warning for riverside barangays"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ui-subtext mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={MESSAGE_LIMIT}
              className="w-full px-3 py-2 border border-ui-border rounded-lg bg-ui-background resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="Detail the situation, recommended actions, and escalation path."
            />
            <div className="text-xs text-ui-subtext text-right mt-1">
              {message.length}/{MESSAGE_LIMIT}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ui-subtext mb-1">
                Priority level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-ui-border rounded-lg bg-ui-background"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ui-subtext mb-1">
                Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-3 py-2 border border-ui-border rounded-lg bg-ui-background"
              >
                <option>All responders</option>
                <option>Command center</option>
                <option>Field teams only</option>
                <option>Medical teams</option>
              </select>
            </div>
          </div>
          <div>
            <span className="block text-sm font-medium text-ui-subtext mb-2">
              Channels
            </span>
            <div className="flex flex-wrap gap-2">
              {channelOptions.map((channel) => {
                const isSelected = channels.includes(channel);
                return (
                  <button
                    type="button"
                    key={channel}
                    onClick={() => toggleChannel(channel)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition ${
                      isSelected
                        ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                        : "border-ui-border text-ui-subtext hover:text-ui-text"
                    }`}
                  >
                    {channel}
                  </button>
                );
              })}
            </div>
          </div>
          {error && <p className="text-sm text-status-high">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-ui-background text-ui-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-secondary"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              Send broadcast
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateManualIncident = ({ onClose, onAddIncident }) => {
  const [incidentType, setIncidentType] = useState("");
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState("Low");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedType = incidentType.trim();
    const trimmedLocation = location.trim();
    if (!trimmedType || !trimmedLocation) {
      return;
    }

    const severityDefaults = {
      High: {
        status: "Awaiting Dispatch",
        reports: 12,
        hazard: 0.82,
        riskBand: "Red",
        impact: 1.0,
      },
      Medium: {
        status: "Awaiting Dispatch",
        reports: 7,
        hazard: 0.55,
        riskBand: "Amber",
        impact: 0.7,
      },
      Low: {
        status: "Awaiting Dispatch",
        reports: 3,
        hazard: 0.32,
        riskBand: "Blue",
        impact: 0.4,
      },
    };
    const defaults = severityDefaults[severity] || severityDefaults.Medium;

    const coordinateMatch = trimmedLocation.match(
      /^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/
    );
    let coordinates;
    if (coordinateMatch) {
      const parts = trimmedLocation
        .split(",")
        .map((part) => parseFloat(part.trim()));
      if (
        parts.length === 2 &&
        parts.every((value) => Number.isFinite(value))
      ) {
        coordinates = { lat: parts[0], lng: parts[1] };
      }
    }

    const newIncident = {
      id: `INC-${String(Date.now()).slice(-4)}`,
      type: trimmedType,
      severity,
      status: defaults.status,
      location: trimmedLocation,
      coordinates,
      time: "Just now",
      citizenReports: defaults.reports,
      aiHazardScore: defaults.hazard,
      aiSummary: `Manual log: ${trimmedType} reported via command center.`,
      riskBand: defaults.riskBand,
      impactRadiusKm: defaults.impact,
      reportSources: ["Command Center"],
      recommendedAction: "Confirm details with barangay desk.",
      mediaUrl: `https://via.placeholder.com/150/808080/FFFFFF?text=${trimmedType
        .split(" ")
        .join("+")}`,
    };

    if (onAddIncident) {
      onAddIncident(newIncident);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-ui-surface w-full max-w-sm rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-ui-text">
            Create Manual Incident
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-ui-subtext hover:text-ui-text hover:bg-ui-background"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ui-subtext mb-1">
              Incident type
            </label>
            <input
              type="text"
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              className="w-full px-3 py-2 border border-ui-border rounded-lg bg-ui-background focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="e.g. Flash flood"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ui-subtext mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-ui-border rounded-lg bg-ui-background focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="Barangay, landmark, or coordinates"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ui-subtext mb-1">
              Severity
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-3 py-2 border border-ui-border rounded-lg bg-ui-background"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-ui-background text-ui-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-secondary"
            >
              <ClipboardDocumentListIcon className="w-4 h-4" />
              Create incident
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function QuickActions({
  onManualCreate,
  onBroadcast,
  onOpenMap,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showManualCreate, setShowManualCreate] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  const handleManualCreate = () => {
    setShowManualCreate(true);
    setShowMenu(false);
  };

  const handleBroadcast = () => {
    setShowBroadcastModal(true);
    setShowMenu(false);
  };

  const handleBroadcastSubmit = (payload) => {
    if (onBroadcast) {
      onBroadcast(payload);
    }
    setShowBroadcastModal(false);
  };

  const handleOpenMap = () => {
    if (onOpenMap) {
      onOpenMap();
    }
    setShowMenu(false);
  };

  return (
    <>
      <div className="fixed bottom-28 right-6 sm:bottom-10 sm:right-10 flex flex-col items-end gap-3 z-40">
        {showMenu && (
          <div className="flex flex-col items-end gap-3">
            <ActionButton
              Icon={MegaphoneIcon}
              label="Broadcast alert"
              onClick={handleBroadcast}
              className="text-status-high border-status-high/40 bg-status-high/10 hover:bg-status-high/20"
            />
            <ActionButton
              Icon={MapIcon}
              label="Focus map"
              onClick={handleOpenMap}
              className="text-brand-primary border-brand-primary/40 bg-brand-primary/10 hover:bg-brand-primary/20"
            />
            <ActionButton
              Icon={ClipboardDocumentListIcon}
              label="Manual incident"
              onClick={handleManualCreate}
              className="text-ui-text border-ui-border bg-ui-surface hover:bg-ui-background"
            />
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-ui-subtext bg-ui-surface/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-card">
            Quick actions
          </div>
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="p-4 rounded-full bg-brand-primary text-white shadow-lg hover:bg-brand-secondary transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
            aria-label="Toggle quick actions"
          >
            <PlusIcon
              className={`h-6 w-6 transition-transform ${
                showMenu ? "rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>
      {showManualCreate && (
        <CreateManualIncident
          onClose={() => setShowManualCreate(false)}
          onAddIncident={onManualCreate}
        />
      )}
      {showBroadcastModal && (
        <BroadcastAlertModal
          onClose={() => setShowBroadcastModal(false)}
          onSubmit={handleBroadcastSubmit}
        />
      )}
    </>
  );
}

const ActionButton = ({ Icon, label, onClick, className = "" }) => (
  <div className="relative group">
    <button
      onClick={onClick}
      className={`p-3 rounded-full border shadow-lg transition-transform transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-primary/60 ${className}`}
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
    </button>
    <span className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2 py-1 rounded-md bg-ui-surface/95 text-xs text-ui-text shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      {label}
    </span>
  </div>
);
