import { useState, useEffect, useMemo } from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { UserIcon, UserGroupIcon } from "@heroicons/react/24/solid";
import {
  ChevronDown,
  MapPin,
  HeartPulse,
  Star,
  X,
  Edit,
  Shield,
  Pencil,
  Plus,
  Search,
} from "lucide-react";

const getStatusColor = (status) => {
  switch (status) {
    case "Available":
      return "bg-green-500";
    case "On Mission":
      return "bg-yellow-500";
    case "Out of Service":
      return "bg-gray-500";
    default:
      return "bg-gray-300";
  }
};

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
    avatar: "https://i.pravatar.cc/150?img=3",
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
    avatar: "https://i.pravatar.cc/150?img=4",
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
    avatar: "https://i.pravatar.cc/150?img=5",
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
    avatar: "https://i.pravatar.cc/150?img=6",
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
    avatar: "https://i.pravatar.cc/150?img=7",
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

const ResponderCard = ({ responder, onSelect, onEdit, editMode }) => {
  const statusColor = getStatusColor(responder.status);

  const handleCardClick = () => {
    if (editMode) {
      onEdit(responder);
    } else {
      onSelect(responder);
    }
  };

  return (
    <div
      className={`rounded-2xl bg-ui-surface p-3 shadow transition-all ${
        editMode ? "ring-2 ring-accent-blue cursor-pointer" : "hover:shadow-md"
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="truncate font-semibold text-ui-text">
              {responder.name}
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor
                  .replace("bg-", "text-")
                  .replace("-500", "-900")} ${statusColor.replace(
                  "500",
                  "100"
                )}`}
              >
                {responder.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-ui-subtext mt-1">
            <Shield className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{responder.agency}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-ui-subtext">
            <MapPin size={14} />{" "}
            <span className="truncate">{responder.location}</span>
          </div>
        </div>
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
              {(responder.specialization || []).map((skill) => (
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
              {(responder.certifications || []).map((cert) => (
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
              {(responder.dutyHistory || []).map((item) => (
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
  onAdd,
}) {
  const [localResponders, setLocalResponders] = useState(
    externalResponders ?? defaultResponders
  );
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedResponder, setSelectedResponder] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ status: "All", agency: "All" });

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

  const agencies = useMemo(
    () => ["All", ...new Set(responders.map((r) => r.agency))],
    [responders]
  );

  const statusOptions = useMemo(() => {
    const unique = Array.from(
      new Set(responders.map((responder) => responder.status))
    );
    return ["All", ...unique];
  }, [responders]);

  const filteredResponders = responders.filter((responder) => {
    const searchMatch =
      responder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      responder.agency.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch =
      filters.status === "All" || responder.status === filters.status;
    const agencyMatch =
      filters.agency === "All" || responder.agency === filters.agency;
    return searchMatch && statusMatch && agencyMatch;
  });

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

  const handleStatusFilterChange = (status) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  const statuses = ["All", "Available", "On Mission", "Out of Service"];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-ui-background border-b border-ui-surface-border">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-ui-text">
            Responder Directory
          </h2>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`p-2 rounded-full transition-colors ${
              editMode
                ? "bg-accent-blue text-white"
                : "bg-ui-surface text-ui-text"
            }`}
            aria-label="Toggle Edit Mode"
          >
            <Pencil size={18} />
          </button>
        </div>

        <div className="mt-3 space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search responders..."
              className="w-full rounded-full bg-ui-surface px-3 py-2 pl-10 text-sm text-ui-text shadow focus:outline-none focus:ring-2 focus:ring-accent-blue"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-subtext"
              size={20}
            />
          </div>

          <div className="flex space-x-1 rounded-full bg-ui-surface p-1">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusFilterChange(s)}
                className={`w-full rounded-full py-1.5 text-sm font-medium transition-colors ${
                  filters.status === s
                    ? "bg-white text-accent-blue shadow"
                    : "text-ui-subtext hover:bg-ui-surface-hover"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredResponders.map((responder) => (
          <ResponderCard
            key={responder.id}
            responder={responder}
            onSelect={handleSelectResponder}
            onEdit={onEdit}
            editMode={editMode}
          />
        ))}
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
