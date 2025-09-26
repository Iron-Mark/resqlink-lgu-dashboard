import { useMemo, useState } from "react";
import {
  XMarkIcon,
  PhoneIcon,
  UserIcon,
  UserGroupIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

const STATUS_STYLE = {
  Available: "bg-status-resolved/10 text-status-resolved",
  "En Route": "bg-status-medium/10 text-status-medium",
  "On Scene": "bg-status-medium/10 text-status-medium",
  "On Mission": "bg-status-medium/10 text-status-medium",
  "Off Duty": "bg-ui-border text-ui-subtext",
};

export default function AssignResponderSheet({
  incident,
  isOpen,
  onClose,
  suggestions = [],
  responders = [],
  onAssign,
  onCall,
}) {
  const [selectedResponder, setSelectedResponder] = useState(null);

  const directory = useMemo(() => {
    return [...responders].sort((a, b) => a.name.localeCompare(b.name));
  }, [responders]);

  const handleAssign = (responder, options = {}) => {
    if (onAssign) {
      onAssign(responder, options);
    }
  };

  const handleCall = (responder) => {
    if (onCall) {
      onCall(responder);
    }
  };

  if (!isOpen || !incident) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[998] flex flex-col justify-end bg-black/40">
      <div className="rounded-t-3xl bg-ui-surface shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-ui-border px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-ui-subtext">Assign responder</p>
            <h3 className="text-lg font-semibold text-ui-text">{incident.type}</h3>
            <p className="text-xs text-ui-subtext">{incident.location}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-ui-background p-2 text-ui-subtext transition hover:text-ui-text"
            aria-label="Close assign sheet"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4 space-y-6">
          <section>
            <h4 className="mb-3 text-sm font-semibold text-ui-text">Auto suggestions</h4>
            <div className="space-y-3">
              {suggestions.length ? (
                suggestions.map((item) => (
                  <SuggestionCard
                    key={item.responder.id}
                    suggestion={item}
                    onAssign={handleAssign}
                    onCall={handleCall}
                    onViewProfile={setSelectedResponder}
                  />
                ))
              ) : (
                <p className="text-sm text-ui-subtext">
                  No immediate match available. Review directory below.
                </p>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-ui-text">Responder directory</h4>
              <span className="text-xs text-ui-subtext">{directory.length} teams</span>
            </div>
            <div className="space-y-2">
              {directory.map((responder) => (
                <DirectoryRow
                  key={responder.id}
                  responder={responder}
                  onAssign={handleAssign}
                  onCall={handleCall}
                  onViewProfile={setSelectedResponder}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      {selectedResponder && (
        <ProfileDrawer responder={selectedResponder} onClose={() => setSelectedResponder(null)} />
      )}
    </div>
  );
}

function SuggestionCard({ suggestion, onAssign, onCall, onViewProfile }) {
  const { responder, etaMinutes, distanceKm, skillScore, workloadScore } = suggestion;
  return (
    <div className="rounded-2xl border border-brand-primary/30 bg-brand-primary/5 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ui-text">{responder.name}</p>
          <p className="text-xs text-ui-subtext">
            {responder.agency} · {responder.specialization?.join(", ")}
          </p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          STATUS_STYLE[responder.status] || "bg-ui-border text-ui-text"
        }`}>
          {responder.status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-ui-subtext">
        <InfoChip label="ETA" value={`${etaMinutes ?? "--"} min`} />
        <InfoChip label="Distance" value={distanceKm ? `${distanceKm.toFixed(1)} km` : "--"} />
        <InfoChip label="Load" value={`${Math.round((1 - workloadScore) * 100)}%`} />
        <InfoChip label="Skills" value={`${Math.round(skillScore * 100)}% match`} />
        <InfoChip label="Last ping" value={responder.lastPingAt ? new Date(responder.lastPingAt).toLocaleTimeString() : responder.lastActive} />
        <InfoChip label="Shift" value={responder.shiftWindow || "-"} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => onAssign(responder, { etaMinutes })}
          className="flex-1 rounded-xl bg-brand-primary px-3 py-2 text-sm font-semibold text-white"
        >
          Assign
        </button>
        <button
          onClick={() => onCall(responder)}
          className="flex items-center gap-2 rounded-xl border border-brand-primary px-3 py-2 text-sm font-semibold text-brand-primary"
        >
          <PhoneIcon className="h-4 w-4" /> Call first
        </button>
        <button
          onClick={() => onViewProfile(responder)}
          className="flex items-center gap-2 rounded-xl bg-ui-background px-3 py-2 text-sm font-semibold text-ui-text"
        >
          <ArrowTopRightOnSquareIcon className="h-4 w-4" /> Profile
        </button>
      </div>
    </div>
  );
}

function DirectoryRow({ responder, onAssign, onCall, onViewProfile }) {
  return (
    <div className="rounded-2xl border border-ui-border bg-ui-background p-3 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-ui-text">{responder.name}</p>
          <p className="text-xs text-ui-subtext">
            {responder.agency} · {responder.specialization?.join(", ")}
          </p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          STATUS_STYLE[responder.status] || "bg-ui-border text-ui-text"
        }`}>
          {responder.status}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-ui-subtext">
        <span>Last ping: {responder.lastPingAt ? new Date(responder.lastPingAt).toLocaleTimeString() : responder.lastActive}</span>
        <span>Workload {Math.round((responder.workload ?? 0.3) * 100)}%</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => onAssign(responder)}
          className="flex-1 rounded-lg bg-brand-primary px-3 py-2 text-xs font-semibold text-white"
        >
          Assign
        </button>
        <button
          onClick={() => onCall(responder)}
          className="flex-1 rounded-lg border border-brand-primary px-3 py-2 text-xs font-semibold text-brand-primary"
        >
          Call
        </button>
        <button
          onClick={() => onViewProfile(responder)}
          className="flex-1 rounded-lg bg-ui-surface px-3 py-2 text-xs font-semibold text-ui-text"
        >
          View profile
        </button>
      </div>
    </div>
  );
}

function ProfileDrawer({ responder, onClose }) {
  return (
    <div className="fixed inset-0 z-[999] flex items-end bg-black/40">
      <div className="w-full rounded-t-3xl bg-ui-surface p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ui-text">{responder.name}</p>
            <p className="text-xs text-ui-subtext">{responder.agency}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-ui-background p-2 text-ui-subtext"
            aria-label="Close profile"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-3 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-ui-subtext">Contact</p>
            <p className="font-semibold text-ui-text">{responder.contactNumber || "Not provided"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ui-subtext">Specialization</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {responder.specialization?.map((skill) => (
                <span key={skill} className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs text-brand-primary">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ui-subtext">Certifications</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {responder.certifications?.map((cert) => (
                <span key={cert} className="rounded-lg bg-ui-background px-2 py-1 text-xs">
                  {cert}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ui-subtext">Recent missions</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-ui-text/90">
              {responder.dutyHistory?.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div className="rounded-lg bg-white px-2 py-1">
      <p className="text-[10px] uppercase tracking-wide text-ui-subtext">{label}</p>
      <p className="text-xs font-semibold text-ui-text">{value}</p>
    </div>
  );
}
