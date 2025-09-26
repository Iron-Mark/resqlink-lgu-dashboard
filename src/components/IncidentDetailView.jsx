import { useEffect, useMemo, useRef, useState } from "react";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  PlayCircleIcon,
  FlagIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { MapContainer, TileLayer, CircleMarker, Circle } from "react-leaflet";

const TABS = [
  { id: "summary", label: "AI Summary" },
  { id: "timeline", label: "Timeline" },
  { id: "media", label: "Media" },
  { id: "assign", label: "Assign/Reassign" },
  { id: "playbook", label: "Playbook / SOP" },
  { id: "resolve", label: "Resolve / Cancel" },
];

const SEVERITY_CLASS = {
  High: "bg-status-high/10 text-status-high",
  Medium: "bg-status-medium/10 text-status-medium",
  Low: "bg-status-low/10 text-status-low",
};

export default function IncidentDetailView({
  incident,
  onClose,
  onAssign,
  onMarkResolved,
  onMarkCancelled,
  onResolveConflict,
  callLog = [],
}) {
  const [activeTab, setActiveTab] = useState("summary");
  const [showPII, setShowPII] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const severityBadge = SEVERITY_CLASS[incident.severity] || SEVERITY_CLASS.Medium;
  const hazardPercent = Math.round((incident.aiHazardScore ?? 0) * 100);
  const incidentDescriptor = `${incident.type} in ${incident.location}`;

  const sortedTimeline = useMemo(() => {
    return [...(incident.timeline ?? [])].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
  }, [incident.timeline]);

  const activeTabs = useMemo(() => {
    return TABS.filter((tab) => {
      if (tab.id === "media") {
        return Boolean(incident.mediaGallery?.length);
      }
      return true;
    });
  }, [incident.mediaGallery]);

  const handleAssign = () => {
    if (onAssign) {
      onAssign();
    }
  };

  const handleResolve = () => {
    setConfirmAction("resolve");
  };

  const handleCancel = () => {
    setConfirmAction("cancel");
  };

  const handleConfirmAction = () => {
    if (confirmAction === "resolve") {
      onMarkResolved?.();
    } else if (confirmAction === "cancel") {
      onMarkCancelled?.();
    }
    setConfirmAction(null);
  };

  const handleDismissConfirm = () => {
    setConfirmAction(null);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center bg-black/50 backdrop-blur-sm px-4 py-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-ui-surface shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-ui-border px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${severityBadge}`}>
                {incident.severity} Severity
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-ui-subtext">
                {incident.status}
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-ui-text">{incident.type}</h2>
            <div className="flex items-center gap-2 text-sm text-ui-subtext">
              <MapPinIcon className="h-4 w-4" />
              <span>{incident.location}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-ui-background p-2 text-ui-subtext transition hover:text-ui-text"
            aria-label="Close incident detail"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </header>

        <div className="space-y-3 px-6 pt-4">
          {incident.flags?.conflict && (
            <Banner
              tone="warning"
              title="Conflicting field update"
              message={incident.flags.conflict.message}
              actionLabel="Mark resolved"
              onAction={() => onResolveConflict?.(incident.id)}
            />
          )}
          {incident.flags?.duplicate && (
            <Banner
              tone="info"
              title="Possible duplicate"
              message={`Matches ${incident.flags.duplicate.of} (${Math.round(
                (incident.flags.duplicate.confidence ?? 0) * 100
              )}% confidence)`}
            />
          )}
          {incident.flags?.offlineCache && (
            <Banner
              tone="info"
              title="Showing cached data"
              message={`Cached at ${new Date(
                incident.flags.offlineCache.cachedAt
              ).toLocaleString()} - ${incident.flags.offlineCache.note}`}
            />
          )}
        </div>

        <section className="px-6 py-4 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatTile
              icon={ShieldCheckIcon}
              label="Hazard Score"
              value={`${hazardPercent}%`}
              helper={incident.riskBand ? `${incident.riskBand} band` : undefined}
            />
            <StatTile
              icon={UserGroupIcon}
              label="People Impact"
              value={`${incident.peopleStats?.estimated ?? "--"}`}
              helper={`Evacuated ${incident.peopleStats?.evacuated ?? 0}`}
            />
          </div>

          <div className="rounded-2xl border border-ui-border bg-ui-background p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ui-text">Citizen Snapshot</h3>
              <label className="flex items-center gap-2 text-xs text-ui-subtext">
                <input
                  type="checkbox"
                  checked={showPII}
                  onChange={(event) => setShowPII(event.target.checked)}
                />
                Reveal PII
              </label>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
              <div>
                <p className="text-ui-subtext">Households</p>
                <p className="font-semibold text-ui-text">
                  {incident.citizenSnapshot?.households ?? "--"}
                </p>
              </div>
              <div>
                <p className="text-ui-subtext">Population</p>
                <p className="font-semibold text-ui-text">
                  {incident.citizenSnapshot?.population ?? "--"}
                </p>
              </div>
              <div>
                <p className="text-ui-subtext">Vulnerable</p>
                <p className="font-semibold text-ui-text">
                  {incident.citizenSnapshot?.vulnerable ?? "--"}
                </p>
              </div>
            </div>
            {showPII && incident.citizenSnapshot?.pii?.length ? (
              <div className="mt-3 space-y-2 rounded-xl bg-white/80 p-3 text-sm shadow-inner">
                {incident.citizenSnapshot.pii.map((entry) => (
                  <div key={entry.id} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ui-text">{entry.name}</p>
                      <p className="text-xs text-ui-subtext">{entry.notes}</p>
                    </div>
                    <span className="text-xs font-medium text-brand-primary">
                      {entry.contact}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <MiniMap incident={incident} />
        </section>

        <nav className="flex items-center gap-2 overflow-x-auto px-6 pb-2 pt-1">
          {activeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-brand-primary text-white"
                  : "bg-ui-background text-ui-subtext hover:bg-ui-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <section className="px-6 pb-6">
          {activeTab === "summary" && <SummaryTab incident={incident} hazardPercent={hazardPercent} />}
          {activeTab === "timeline" && <TimelineTab timeline={sortedTimeline} />}
          {activeTab === "media" && <MediaTab media={incident.mediaGallery} />}
          {activeTab === "assign" && (
            <AssignTab incident={incident} onAssign={handleAssign} callLog={callLog} />
          )}
          {activeTab === "playbook" && <PlaybookTab incident={incident} />}
          {activeTab === "resolve" && (
            <ResolveTab onResolve={handleResolve} onCancel={handleCancel} />
          )}
        </section>
      </div>
    </div>
  );
}

function SummaryTab({ incident, hazardPercent }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-ui-border bg-ui-background/70 p-4 text-sm text-ui-text/90">
        <p className="font-semibold text-ui-text">AI Hazard Analysis</p>
        <p className="mt-1 leading-relaxed">
          {incident.aiSummary || "AI summary not available."}
        </p>
        <p className="mt-2 text-xs text-ui-subtext">
          Impact radius approx. {incident.impactRadiusKm ?? "--"} km - Hazard score {hazardPercent}%
        </p>
      </div>
      {incident.riskNotes?.length ? (
        <div className="rounded-2xl border border-ui-border bg-white p-4 text-sm">
          <p className="font-semibold text-ui-text">Risk Notes</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-ui-text/90">
            {incident.riskNotes.map((note, index) => (
              <li key={`${incident.id}-risk-${index}`}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function TimelineTab({ timeline }) {
  if (!timeline.length) {
    return <p className="text-sm text-ui-subtext">No timeline entries yet.</p>;
  }
  return (
    <div className="space-y-3">
      {timeline.map((event) => {
        const timeLabel = new Date(event.timestamp).toLocaleString();
        return (
          <div
            key={event.id}
            className="rounded-2xl border border-ui-border bg-ui-background p-3 text-sm"
          >
            <p className="font-semibold text-ui-text">{event.label}</p>
            <div className="flex items-center justify-between text-xs text-ui-subtext">
              <span>{timeLabel}</span>
              <span>{event.actor}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MediaTab({ media }) {
  if (!media?.length) {
    return <p className="text-sm text-ui-subtext">No media linked to this incident.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      {media.map((item) => (
        <div key={item.id} className="overflow-hidden rounded-xl border border-ui-border">
          <img src={item.url} alt={item.caption || item.id} className="h-32 w-full object-cover" />
          {item.caption && (
            <p className="px-2 py-1 text-xs text-ui-subtext">{item.caption}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function AssignTab({ incident, onAssign, callLog = [] }) {
  const assigned = incident.assignedResponder;
  const recentCalls = callLog.slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-ui-border bg-white p-4 text-sm">
        <p className="text-xs uppercase tracking-wide text-ui-subtext">Current assignment</p>
        {assigned ? (
          <div className="mt-2">
            <p className="font-semibold text-ui-text">{assigned.name}</p>
            <p className="text-xs text-ui-subtext">
              Status: {assigned.status} - ETA {assigned.etaMinutes ?? "--"} min
            </p>
          </div>
        ) : (
          <p className="mt-2 text-ui-subtext">No responder assigned.</p>
        )}
      </div>

      <div className="rounded-2xl border border-ui-border bg-ui-background p-4 text-sm">
        <p className="text-xs uppercase tracking-wide text-ui-subtext">Call log</p>
        {recentCalls.length ? (
          <ul className="mt-2 space-y-2 max-h-36 overflow-y-auto pr-1">
            {recentCalls.map((entry) => {
              const callTime = new Date(entry.at);
              const dayLabel = callTime.toLocaleDateString(undefined, { month: "short", day: "numeric" });
              const timeLabel = callTime.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
              return (
                <li
                  key={`${entry.at}-${entry.responderId}`}
                  className="rounded-xl border border-ui-border/60 bg-white px-3 py-2"
                >
                  <div className="flex items-center justify-between text-[11px] text-ui-subtext">
                    <span>{dayLabel} {timeLabel}</span>
                    <span>{entry.responderName}</span>
                  </div>
                  {entry.responderStatus ? (
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-ui-subtext">
                      Status: {entry.responderStatus}
                    </p>
                  ) : null}
                  {entry.notes ? (
                    <p className="mt-1 text-xs italic text-ui-text/80">&ldquo;{entry.notes}&rdquo;</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-ui-subtext">No call attempts logged for this incident.</p>
        )}
      </div>

      <button
        onClick={onAssign}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white hover:bg-brand-secondary"
      >
        <PlayCircleIcon className="h-5 w-5" />
        Open Assign Sheet
      </button>
      {confirmAction && (
        <ConfirmActionModal
          action={confirmAction}
          incidentTitle={incidentDescriptor}
          onConfirm={handleConfirmAction}
          onDismiss={handleDismissConfirm}
        />
      )}
    </div>
  );
}

function PlaybookTab({ incident }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-2xl border border-ui-border bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-ui-subtext">Playbook Reference</p>
        <p className="mt-1 font-semibold text-ui-text">{incident.playbookRef}</p>
      </div>
      <div className="rounded-2xl border border-ui-border bg-ui-background p-4">
        <p className="text-xs uppercase tracking-wide text-ui-subtext">Recommended Action</p>
        <p className="mt-1 text-ui-text/90 leading-relaxed">
          {incident.recommendedAction || "Follow command center guidance."}
        </p>
      </div>
    </div>
  );
}

function ResolveTab({ onResolve, onCancel }) {
  return (
    <div className="space-y-3">
      <button
        onClick={onResolve}
        className="w-full rounded-xl bg-status-resolved px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-status-resolved/90"
      >
        Mark Resolved
      </button>
      <button
        onClick={onCancel}
        className="w-full rounded-xl bg-status-high/10 px-4 py-3 text-sm font-semibold text-status-high hover:bg-status-high/20"
      >
        Cancel Incident
      </button>
    </div>
  );
}

function MiniMap({ incident }) {
  const center = [incident.coordinates?.lat ?? 14.676, incident.coordinates?.lng ?? 121.0437];
  return (
    <div className="overflow-hidden rounded-2xl border border-ui-border">
      <MapContainer
        center={center}
        zoom={14}
        className="h-48 w-full"
        scrollWheelZoom={false}
        doubleClickZoom={false}
        dragging={false}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CircleMarker center={center} radius={10} pathOptions={{ color: "#1d4ed8", weight: 2 }} />
        <Circle center={center} radius={(incident.impactRadiusKm ?? 0.6) * 1000} pathOptions={{ color: "#2563eb", fillOpacity: 0.08 }} />
      </MapContainer>
    </div>
  );
}

function Banner({ tone, title, message, actionLabel, onAction }) {
  const toneClass = tone === "warning" ? "bg-status-high/10 text-status-high" : "bg-brand-primary/10 text-brand-primary";
  return (
    <div className={`flex flex-col gap-2 rounded-2xl border border-ui-border px-4 py-3 text-sm ${toneClass}`}>
      <div className="flex items-center gap-2 font-semibold">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <span>{title}</span>
      </div>
      <p className="text-xs leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="self-start rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ui-text shadow"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function StatTile({ icon: Icon, label, value, helper }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-ui-border bg-white p-3 text-sm">
      <Icon className="h-5 w-5 text-brand-primary" />
      <div>
        <p className="text-xs uppercase tracking-wide text-ui-subtext">{label}</p>
        <p className="text-lg font-semibold text-ui-text">{value}</p>
        {helper ? <p className="text-xs text-ui-subtext">{helper}</p> : null}
      </div>
    </div>
  );
}








function ConfirmActionModal({ action, incidentTitle, onConfirm, onDismiss }) {
  const confirmRef = useRef(null);
  const normalizedTitle = incidentTitle || "this incident";
  const copy =
    action === "cancel"
      ? {
          title: "Cancel incident?",
          description: `This will mark ${normalizedTitle} as cancelled and push updates to dashboard, map, and history views.`,
          confirmLabel: "Yes, cancel incident",
          confirmClass: "bg-status-high text-white hover:bg-status-high/90",
        }
      : {
          title: "Resolve incident?",
          description: `This will mark ${normalizedTitle} as resolved and archive the active response.`,
          confirmLabel: "Yes, mark resolved",
          confirmClass: "bg-status-resolved text-white hover:bg-status-resolved/90",
        };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDismiss]);

  useEffect(() => {
    confirmRef.current?.focus();
  }, [action]);

  const titleId = `confirm-action-${action ?? "resolve"}`;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 px-4 py-6">
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h3 id={titleId} className="text-lg font-semibold text-ui-text">
          {copy.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ui-subtext">
          {copy.description}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onDismiss?.()}
            className="rounded-xl border border-ui-border px-4 py-2 text-sm font-semibold text-ui-text hover:bg-ui-background"
          >
            Back
          </button>
          <button
            type="button"
            ref={confirmRef}
            onClick={() => onConfirm?.()}
            className={`rounded-xl px-4 py-2 text-sm font-semibold shadow-sm ${copy.confirmClass}`}
          >
            {copy.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

