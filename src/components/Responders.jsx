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
  const statusColors = {
    Available: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      dot: "bg-emerald-500",
    },
    "On Mission": {
      bg: "bg-amber-100",
      text: "text-amber-800",
      dot: "bg-amber-500",
    },
    "On Scene": {
      bg: "bg-amber-100",
      text: "text-amber-800",
      dot: "bg-amber-500",
    },
    "En Route": {
      bg: "bg-amber-100",
      text: "text-amber-800",
      dot: "bg-amber-500",
    },
    "Out of Service": {
      bg: "bg-slate-100",
      text: "text-slate-600",
      dot: "bg-slate-400",
    },
    "Off Duty": {
      bg: "bg-slate-100",
      text: "text-slate-600",
      dot: "bg-slate-400",
    },
  };

  const colors = statusColors[responder.status] || statusColors["Off Duty"];

  const handleCardClick = () => {
    if (editMode) {
      onEdit(responder);
    } else {
      onSelect(responder);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-white shadow-sm border transition-all duration-200 ${
        editMode
          ? "ring-2 ring-blue-500 shadow-lg cursor-pointer transform hover:scale-[1.02]"
          : "border-slate-200 hover:shadow-md hover:border-slate-300"
      }`}
      onClick={handleCardClick}
    >
      {/* Status indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${colors.dot}`} />

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {responder.name}
              </h3>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                {responder.status}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="truncate">{responder.agency}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="truncate">{responder.location}</span>
              </div>
            </div>

            {responder.specialization && (
              <div className="flex flex-wrap gap-1 mt-3">
                {responder.specialization.slice(0, 2).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {responder.specialization.length > 2 && (
                  <span className="px-2 py-1 text-xs bg-gray-50 text-gray-500 rounded-full">
                    +{responder.specialization.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {editMode && (
        <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-1.5">
          <Edit className="w-3 h-3" />
        </div>
      )}
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
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-white">
      {/* Combined Header with Search and Filters */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="p-6">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Responder Directory
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredResponders.length} of {responders.length} responders
              </p>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                editMode
                  ? "bg-blue-500 text-white shadow-lg ring-2 ring-blue-200"
                  : "bg-slate-100 text-gray-700 hover:bg-slate-200"
              }`}
            >
              <Pencil size={16} />
              {editMode ? "Exit Edit" : "Edit Mode"}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name, agency, or location..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex bg-slate-100 rounded-2xl p-1">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilterChange(status)}
                className={`flex-1 rounded-xl py-2.5 px-4 text-sm font-medium transition-all duration-200 ${
                  filters.status === status
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Responder List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-4">
          {filteredResponders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No responders found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            filteredResponders.map((responder) => (
              <ResponderCard
                key={responder.id}
                responder={responder}
                onSelect={handleSelectResponder}
                onEdit={onEdit}
                editMode={editMode}
              />
            ))
          )}
        </div>

        {/* Add Button - Floating */}
        <div className="sticky bottom-6 flex justify-center px-6 mt-4">
          <button
            onClick={onAdd}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 transform hover:scale-105"
          >
            <Plus size={20} />
            Add New Responder
          </button>
        </div>
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
