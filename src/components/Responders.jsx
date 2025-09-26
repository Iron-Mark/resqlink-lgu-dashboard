import { useState, useEffect, useMemo } from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { UserIcon, UserGroupIcon } from "@heroicons/react/24/solid";
import { ChevronDown, MapPin, HeartPulse, Star, X, Edit } from "lucide-react";

export const defaultResponders = [
  {
    id: "R-001",
    name: "Miguel Santos",
    status: "Available",
    members: 1,
    location: "Brgy. Malanday",
    lastActive: "2m ago",
    specialization: ["Flood", "Medical"],
    agency: "Rescue",
    certifications: ["Swift Water", "First Responder"],
    dutyHistory: ["INC-045 Flood Evacuation", "INC-038 Search Ops"],
    lastCheckIn: "Just now",
  },
  {
    id: "R-002",
    name: "Leah Ramirez",
    status: "On Scene",
    members: 1,
    location: "Brgy. Concepcion",
    lastActive: "5m ago",
    specialization: ["Fire", "Technical Rescue"],
    agency: "BFP",
    certifications: ["HazMat", "Breaching"],
    dutyHistory: ["INC-042 Market Fire", "INC-031 Chemical Leak"],
    lastCheckIn: "3m ago",
  },
  {
    id: "R-003",
    name: "Paolo Fernandez",
    status: "En Route",
    members: 1,
    location: "Brgy. Sto. Nino",
    lastActive: "10m ago",
    specialization: ["Medical", "Evacuation"],
    agency: "EMS",
    certifications: ["Paramedic", "Triage Officer"],
    dutyHistory: ["INC-050 Landslide", "INC-035 Heat Stress"],
    lastCheckIn: "7m ago",
  },
  {
    id: "R-004",
    name: "Amina Cruz",
    status: "Available",
    members: 1,
    location: "Brgy. Bayan",
    lastActive: "15m ago",
    specialization: ["Search & Rescue", "Medical"],
    agency: "Rescue",
    certifications: ["Rope Rescue", "First Aid"],
    dutyHistory: ["INC-041 Missing Person"],
    lastCheckIn: "10m ago",
  },
  {
    id: "R-005",
    name: "Noel Garcia",
    status: "Off Duty",
    members: 1,
    location: "Brgy. San Roque",
    lastActive: "1h ago",
    specialization: ["Fire", "Earthquake Response"],
    agency: "Volunteer Corps",
    certifications: ["Fire Suppression", "USAR"],
    dutyHistory: ["INC-037 Warehouse Fire"],
    lastCheckIn: "45m ago",
  },
];

const statusConfig = {
  Available: {
    color: "bg-green-500",
    text: "text-green-800",
    bg: "bg-green-100",
  },
  "On Mission": {
    color: "bg-yellow-500",
    text: "text-yellow-800",
    bg: "bg-yellow-100",
  },
  "Out of Service": {
    color: "bg-gray-500",
    text: "text-gray-800",
    bg: "bg-gray-100",
  },
  "On Scene": {
    color: "bg-yellow-500",
    text: "text-yellow-800",
    bg: "bg-yellow-100",
  },
  "En Route": {
    color: "bg-blue-500",
    text: "text-blue-800",
    bg: "bg-blue-100",
  },
  "Off Duty": {
    color: "bg-gray-500",
    text: "text-gray-800",
    bg: "bg-gray-100",
  },
};

const STATUS_CATEGORY = {
  Available: "Available",
  Standby: "Available",
  "En Route": "On Mission",
  "On Scene": "On Mission",
  "On Mission": "On Mission",
  Assigned: "On Mission",
  "Off Duty": "Unavailable",
  Unavailable: "Unavailable",
};

const SUMMARY_TEMPLATE = [
  {
    key: "Available",
    label: "Available",
    color: "bg-status-resolved",
    text: "text-status-resolved",
  },
  {
    key: "On Mission",
    label: "On Mission",
    color: "bg-status-medium",
    text: "text-status-medium",
  },
  {
    key: "Unavailable",
    label: "Unavailable",
    color: "bg-slate-400",
    text: "text-ui-subtext",
  },
];

const statusTextClass = (status) => {
  switch (STATUS_CATEGORY[status] ?? status) {
    case "Available":
      return "text-status-resolved";
    case "On Mission":
      return "text-status-medium";
    default:
      return "text-ui-subtext";
  }
};

const statusChipClass = (status) => {
  switch (STATUS_CATEGORY[status] ?? status) {
    case "Available":
      return "bg-status-resolved/10 text-status-resolved";
    case "On Mission":
      return "bg-status-medium/10 text-status-medium";
    default:
      return "bg-slate-100 text-ui-subtext";
  }
};

const ResponderCard = ({ responder, onStatusChange, onSelect, onEdit }) => {
  const config =
    statusConfig[responder.status] || statusConfig["Out of Service"];

  return (
    <div className="rounded-2xl bg-ui-surface p-3 shadow transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
          <UserGroupIcon className="h-6 w-6 text-brand-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ui-text">
                {responder.name}
              </p>
              <p className="text-xs uppercase tracking-wide text-ui-subtext">
                {responder.agency}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusChipClass(
                  responder.status
                )}`}
              >
                {STATUS_CATEGORY[responder.status] ?? responder.status}
              </span>
              <span className="text-xs text-ui-subtext">
                {responder.location}
              </span>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-ui-subtext">
            <span className="flex items-center gap-1">
              <UserIcon className="h-3 w-3" /> {responder.members} members
            </span>
            <span>• Last active {responder.lastActive}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelect(responder)}
            className="rounded-full p-2 text-ui-subtext transition-colors hover:bg-brand-primary/10 hover:text-brand-primary"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
          <button
            onClick={() => onEdit(responder)}
            className="rounded-full p-2 text-ui-subtext transition-colors hover:bg-brand-primary/10 hover:text-brand-primary"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {responder.specialization.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-brand-primary/5 px-2 py-0.5 text-xs text-brand-primary"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

const ResponderDetailModal = ({
  responder,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  if (!isOpen || !responder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-ui-surface p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{responder.name}</h3>
            <p className="text-xs uppercase tracking-wide text-ui-subtext">
              {responder.agency}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-ui-subtext transition hover:text-ui-text"
            aria-label="Close responder detail"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-ui-subtext">Status</span>
            <span
              className={`font-semibold ${statusTextClass(responder.status)}`}
            >
              {STATUS_CATEGORY[responder.status] ?? responder.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="Members" value={responder.members} />
            <InfoItem label="Last Active" value={responder.lastActive} />
            <InfoItem label="Location" value={responder.location} />
            <InfoItem label="Last Check-in" value={responder.lastCheckIn} />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-ui-subtext">
              Specialization
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {responder.specialization.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs text-brand-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-ui-subtext">
              Certifications
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {responder.certifications.map((cert) => (
                <span
                  key={cert}
                  className="rounded-md bg-ui-background px-2 py-0.5 text-xs text-ui-text"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-ui-subtext">
              Recent assignments
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ui-text/90">
              {responder.dutyHistory.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-ui-subtext">
              Change status
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {["Available", "En Route", "On Scene", "Off Duty"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(responder.id, status)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${statusChipClass(
                      status
                    )}`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg bg-ui-background py-2 text-sm font-semibold text-ui-text"
            >
              Close
            </button>
            <button
              onClick={() => alert(`Contacting ${responder.name}...`)}
              className="flex-1 rounded-lg bg-brand-primary py-2 text-sm font-semibold text-white"
            >
              Contact team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Responders({
  responders: externalResponders,
  onStatusChange,
  onEdit,
}) {
  const [localResponders, setLocalResponders] = useState(
    externalResponders ?? defaultResponders
  );
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedResponder, setSelectedResponder] = useState(null);

  useEffect(() => {
    if (externalResponders) {
      setLocalResponders(externalResponders);
    }
  }, [externalResponders]);

  const responders = externalResponders ?? localResponders;

  useEffect(() => {
    if (!selectedResponder) return;
    const updated = responders.find(
      (responder) => responder.id === selectedResponder.id
    );
    if (updated && updated !== selectedResponder) {
      setSelectedResponder(updated);
    }
  }, [responders, selectedResponder]);

  const summaryCards = useMemo(
    () =>
      SUMMARY_TEMPLATE.map((card) => ({
        ...card,
        count: responders.filter(
          (responder) =>
            (STATUS_CATEGORY[responder.status] ?? responder.status) === card.key
        ).length,
      })),
    [responders]
  );

  const statusOptions = useMemo(() => {
    const unique = Array.from(
      new Set(responders.map((responder) => responder.status))
    );
    return ["All", ...unique];
  }, [responders]);

  const filteredResponders = responders.filter((responder) =>
    statusFilter === "All" ? true : responder.status === statusFilter
  );

  const handleStatusChange = (responderId, newStatus) => {
    if (onStatusChange) {
      onStatusChange(responderId, newStatus);
    } else {
      setLocalResponders((prev) =>
        prev.map((responder) =>
          responder.id === responderId
            ? { ...responder, status: newStatus, lastActive: "Just now" }
            : responder
        )
      );
    }

    setSelectedResponder((prev) =>
      prev && prev.id === responderId ? { ...prev, status: newStatus } : prev
    );
  };

  const handleSelectResponder = (responder) => {
    setSelectedResponder(responder);
  };

  return (
    <div className="bg-ui-surface p-4 rounded-2xl shadow space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ui-text">
          Responder Directory
        </h2>
        <span className="text-xs uppercase tracking-wider text-ui-subtext">
          Live
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {summaryCards.map((card) => (
          <div
            key={card.key}
            className="flex flex-col items-center rounded-xl bg-ui-background p-3"
          >
            <span className={`mb-1 h-3 w-3 rounded-full ${card.color}`}></span>
            <span className="text-xs font-medium text-ui-subtext">
              {card.label}
            </span>
            <span className={`text-lg font-semibold ${card.text}`}>
              {card.count}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b pb-2">
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              statusFilter === status
                ? "bg-brand-primary/10 text-brand-primary"
                : "text-ui-subtext"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredResponders.length ? (
          filteredResponders.map((responder) => (
            <ResponderCard
              key={responder.id}
              responder={responder}
              onStatusChange={onStatusChange}
              onSelect={handleSelectResponder}
              onEdit={onEdit}
            />
          ))
        ) : (
          <p className="py-4 text-center text-sm text-ui-subtext">
            No responders match the selected filter.
          </p>
        )}
      </div>

      <ResponderDetailModal
        responder={selectedResponder}
        isOpen={!!selectedResponder}
        onClose={() => setSelectedResponder(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-lg bg-ui-background p-2 text-xs">
      <p className="text-ui-subtext">{label}</p>
      <p className="font-semibold text-ui-text">{value}</p>
    </div>
  );
}
