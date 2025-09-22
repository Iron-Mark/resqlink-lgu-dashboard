import { useState, useEffect } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { UserIcon, UserGroupIcon } from "@heroicons/react/24/solid";

// Mock responder data
const mockResponders = [
  {
    id: "R-001",
    name: "Team Alpha",
    status: "Available",
    members: 3,
    location: "Brgy. Malanday",
    lastActive: "2m ago",
    specialization: ["Flood", "Medical"],
  },
  {
    id: "R-002",
    name: "Team Bravo",
    status: "En Route",
    members: 4,
    location: "Brgy. Concepcion",
    lastActive: "5m ago",
    specialization: ["Fire", "Technical Rescue"],
  },
  {
    id: "R-003",
    name: "Team Charlie",
    status: "On Scene",
    members: 2,
    location: "Brgy. Sto. Niño",
    lastActive: "10m ago",
    specialization: ["Medical", "Evacuation"],
  },
  {
    id: "R-004",
    name: "Team Delta",
    status: "Available",
    members: 5,
    location: "Brgy. Bayan",
    lastActive: "15m ago",
    specialization: ["Search & Rescue", "Medical"],
  },
  {
    id: "R-005",
    name: "Team Echo",
    status: "Off Duty",
    members: 3,
    location: "Brgy. San Roque",
    lastActive: "1h ago",
    specialization: ["Fire", "Earthquake Response"],
  },
];

export default function Responders({
  responders: externalResponders,
  onStatusChange,
}) {
  const [localResponders, setLocalResponders] = useState(
    externalResponders ?? mockResponders
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
    const updated = responders.find((r) => r.id === selectedResponder.id);
    if (updated && updated !== selectedResponder) {
      setSelectedResponder(updated);
    }
  }, [responders, selectedResponder]);

  const filteredResponders = responders.filter(
    (r) => statusFilter === "All" || r.status === statusFilter
  );

  const handleStatusChange = (responderId, newStatus) => {
    if (onStatusChange) {
      onStatusChange(responderId, newStatus);
    } else {
      setLocalResponders((prevResponders) =>
        prevResponders.map((r) =>
          r.id === responderId
            ? { ...r, status: newStatus, lastActive: "Just now" }
            : r
        )
      );
    }

    setSelectedResponder((prev) =>
      prev && prev.id === responderId ? { ...prev, status: newStatus } : prev
    );
  };

  // Count responders by status
  const responderCounts = responders.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-ui-surface p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold text-ui-text mb-4">Responders</h2>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-ui-background p-2 rounded-lg flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-status-resolved mb-1"></div>
          <span className="text-sm font-medium">Available</span>
          <span className="text-xl font-bold">
            {responderCounts.Available || 0}
          </span>
        </div>
        <div className="bg-ui-background p-2 rounded-lg flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-status-medium mb-1"></div>
          <span className="text-sm font-medium">En Route</span>
          <span className="text-xl font-bold">
            {responderCounts["En Route"] || 0}
          </span>
        </div>
        <div className="bg-ui-background p-2 rounded-lg flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-brand-primary mb-1"></div>
          <span className="text-sm font-medium">On Scene</span>
          <span className="text-xl font-bold">
            {responderCounts["On Scene"] || 0}
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 border-b">
        {["All", "Available", "En Route", "On Scene", "Off Duty"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`py-2 px-3 text-sm font-medium ${
                statusFilter === status
                  ? "border-b-2 border-brand-primary text-brand-primary"
                  : "text-ui-subtext"
              }`}
            >
              {status}
            </button>
          )
        )}
      </div>

      {/* Responders list */}
      <div className="space-y-3">
        {filteredResponders.length > 0 ? (
          filteredResponders.map((r) => (
            <div
              key={r.id}
              className="p-3 bg-ui-background rounded-lg shadow-sm cursor-pointer hover:shadow-card transition-shadow"
              onClick={() => setSelectedResponder(r)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-ui-subtext/10 p-2 rounded-full">
                    <UserGroupIcon className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-ui-text">{r.name}</p>
                    <div className="flex items-center gap-1 text-xs text-ui-subtext">
                      <UserIcon className="w-3 h-3" />
                      <span>{r.members} members</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      r.status === "Available"
                        ? "bg-status-resolved/10 text-status-resolved"
                        : r.status === "En Route"
                        ? "bg-status-medium/10 text-status-medium"
                        : r.status === "On Scene"
                        ? "bg-brand-primary/10 text-brand-primary"
                        : "bg-gray-100 text-ui-subtext"
                    }`}
                  >
                    {r.status}
                  </span>
                  <span className="text-xs text-ui-subtext mt-1">
                    {r.location}
                  </span>
                </div>
              </div>

              {/* Skills/specialization */}
              <div className="mt-2 flex flex-wrap gap-1">
                {r.specialization.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-ui-subtext/10 text-ui-subtext px-2 py-0.5 rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-ui-subtext text-center py-4">
            No responders match the selected filter.
          </p>
        )}
      </div>

      {/* Modal for responder detail */}
      {selectedResponder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-ui-surface p-5 rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedResponder.name}</h3>
              <button
                onClick={() => setSelectedResponder(null)}
                className="text-ui-subtext hover:text-ui-text"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-ui-subtext">Status:</span>
                <span
                  className={`font-medium ${
                    selectedResponder.status === "Available"
                      ? "text-status-resolved"
                      : selectedResponder.status === "En Route"
                      ? "text-status-medium"
                      : selectedResponder.status === "On Scene"
                      ? "text-brand-primary"
                      : "text-ui-subtext"
                  }`}
                >
                  {selectedResponder.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-ui-subtext">Members:</span>
                <span className="font-medium">{selectedResponder.members}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-ui-subtext">Location:</span>
                <span className="font-medium">
                  {selectedResponder.location}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-ui-subtext">Last Active:</span>
                <span className="font-medium">
                  {selectedResponder.lastActive}
                </span>
              </div>

              <div>
                <span className="text-ui-subtext">Specialization:</span>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedResponder.specialization.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <p className="font-medium mb-2">Change Status:</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Available", "En Route", "On Scene", "Off Duty"]
                    .filter((s) => s !== selectedResponder.status)
                    .map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          handleStatusChange(selectedResponder.id, status);
                          setSelectedResponder((prev) => ({ ...prev, status }));
                        }}
                        className={`py-2 px-3 rounded-lg text-sm font-medium ${
                          status === "Available"
                            ? "bg-status-resolved/10 text-status-resolved"
                            : status === "En Route"
                            ? "bg-status-medium/10 text-status-medium"
                            : status === "On Scene"
                            ? "bg-brand-primary/10 text-brand-primary"
                            : "bg-gray-100 text-ui-subtext"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between gap-3">
                <button
                  onClick={() => setSelectedResponder(null)}
                  className="w-full py-2 bg-ui-background text-ui-text rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert(`Contacting ${selectedResponder.name}...`);
                  }}
                  className="w-full py-2 bg-brand-primary text-white rounded-lg"
                >
                  Contact Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
