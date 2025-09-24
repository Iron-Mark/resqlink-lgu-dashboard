import { useState, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";

import KPI from "./KPI";
import IncidentCard from "./IncidentCard";
import AlertFeed from "./AlertFeed";
import PopupIncident from "./PopupIncident";
import QuickActions from "./QuickActions";
import MapView from "./MapView";

import {
  FunnelIcon,
  XMarkIcon,
  MapIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

const INCIDENT_COORDINATES = {
  "Brgy. Malanday": { lat: 14.676, lng: 121.0437 },
  "Brgy. Concepcion": { lat: 14.669, lng: 121.0539 },
  "Brgy. Sto. Nino": { lat: 14.6832, lng: 121.0409 },
  "Brgy. Ibaba": { lat: 14.6698, lng: 121.0321 },
  "Brgy. San Roque": { lat: 14.6612, lng: 121.0327 },
  "Brgy. Bagong Silang": { lat: 14.6685, lng: 121.0475 },
  "Brgy. Bayan": { lat: 14.6721, lng: 121.0382 },
  "Brgy. Tanong": { lat: 14.6765, lng: 121.0492 },
};

const DEFAULT_COORDINATE = { lat: 14.676, lng: 121.0437 };

const SEVERITY_DEFAULTS = {
  High: {
    citizenReports: 12,
    aiHazardScore: 0.82,
    riskBand: "Red",
    aiSummary:
      "Automated hazard model flags rapid escalation. Prepare immediate deployment.",
    impactRadiusKm: 1.2,
  },
  Medium: {
    citizenReports: 6,
    aiHazardScore: 0.58,
    riskBand: "Amber",
    aiSummary:
      "Situation stable but trending upward. Monitor conditions closely.",
    impactRadiusKm: 0.8,
  },
  Low: {
    citizenReports: 3,
    aiHazardScore: 0.32,
    riskBand: "Blue",
    aiSummary: "Low impact and contained. Continue situational awareness.",
    impactRadiusKm: 0.4,
  },
};

const enrichIncidentWithGeo = (incident) => {
  const severityDefaults =
    SEVERITY_DEFAULTS[incident.severity] || SEVERITY_DEFAULTS.Medium;
  const coordinates =
    incident.coordinates ||
    INCIDENT_COORDINATES[incident.location] ||
    DEFAULT_COORDINATE;

  return {
    ...incident,
    coordinates,
    status: incident.status || "Awaiting Dispatch",
    assignedResponder: incident.assignedResponder || null,
    citizenReports: incident.citizenReports ?? severityDefaults.citizenReports,
    aiHazardScore: incident.aiHazardScore ?? severityDefaults.aiHazardScore,
    riskBand: incident.riskBand || severityDefaults.riskBand,
    aiSummary: incident.aiSummary || severityDefaults.aiSummary,
    impactRadiusKm: incident.impactRadiusKm ?? severityDefaults.impactRadiusKm,
  };
};

const toRad = (value) => (value * Math.PI) / 180;

const computeDistanceKm = (origin, target) => {
  if (!origin || !target) return null;
  const lat1 = Number(origin.lat);
  const lng1 = Number(origin.lng);
  const lat2 = Number(target.lat);
  const lng2 = Number(target.lng);
  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lng1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lng2)
  ) {
    return null;
  }
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
};

const pickResponderForIncident = (incident, responderList) => {
  if (!incident?.coordinates) return null;
  const prioritizedStatuses = new Set(["Available", "Standby"]);
  const fallbackStatuses = new Set(["En Route", "On Scene"]);
  const prioritized = [];
  const secondary = [];

  responderList.forEach((responder) => {
    if (responder.currentAssignment) {
      return;
    }
    const distanceKm = computeDistanceKm(incident.coordinates, responder.coordinates);
    const candidate = {
      responder,
      distanceKm: Number.isFinite(distanceKm) ? distanceKm : Infinity,
    };
    if (prioritizedStatuses.has(responder.status)) {
      prioritized.push(candidate);
    } else if (fallbackStatuses.has(responder.status)) {
      secondary.push(candidate);
    }
  });

  const ordered = prioritized.length ? prioritized : secondary;
  if (!ordered.length) {
    return null;
  }

  ordered.sort((a, b) => a.distanceKm - b.distanceKm);
  const [top] = ordered;
  const etaMinutes = Number.isFinite(top.distanceKm)
    ? Math.max(3, Math.round(top.distanceKm * 4))
    : top.responder.etaMinutes ?? 12;

  return {
    responder: top.responder,
    etaMinutes,
    distanceKm: top.distanceKm,
  };
};

export default function Dashboard() {
  const { popupIncident, showIncidentPopup, closeIncidentPopup, addAlert } =
    useNotifications();

  const kpis = [
    { label: "Active Reports", value: 8, trend: "+2" },
    { label: "Pending", value: 3, trend: "-1" },
    { label: "Resolved Today", value: 12, trend: "+5" },
    { label: "Responders", value: 5, trend: "+1" },
  ];

  const initialIncidents = [
    {
      id: "INC-001",
      type: "Flood",
      severity: "High",
      status: "Awaiting Dispatch",
      location: "Brgy. Malanday",
      coordinates: INCIDENT_COORDINATES["Brgy. Malanday"],
      time: "2m ago",
      citizenReports: 23,
      aiHazardScore: 0.87,
      aiSummary:
        "River gauge hit critical level; inundation expected within 25 minutes.",
      riskBand: "Red",
      impactRadiusKm: 1.6,
      reportSources: ["Hotline", "Mobile App"],
      recommendedAction:
        "Pre-evacuate riverside households and stage rescue boats.",
      mediaUrl: "https://via.placeholder.com/150/EF4444/FFFFFF?text=Flood",
    },
    {
      id: "INC-002",
      type: "Fire",
      severity: "Medium",
      status: "Team Mobilized",
      location: "Brgy. Concepcion",
      coordinates: INCIDENT_COORDINATES["Brgy. Concepcion"],
      time: "5m ago",
      citizenReports: 9,
      aiHazardScore: 0.65,
      aiSummary:
        "Thermal plume trending downward; maintain hydrant pressure and cordon.",
      riskBand: "Amber",
      impactRadiusKm: 0.9,
      reportSources: ["Command Center", "CCTV"],
      recommendedAction: "Hold perimeter and prepare backup water supply.",
      assignedResponder: {
        id: "R-002",
        name: "Team Bravo",
        status: "En Route",
        etaMinutes: 4,
      },
      mediaUrl: "https://via.placeholder.com/150/F59E0B/FFFFFF?text=Fire",
    },
    {
      id: "INC-003",
      type: "Vehicle Accident",
      severity: "Low",
      status: "Clearing Lane",
      location: "Brgy. Sto. Nino",
      coordinates: INCIDENT_COORDINATES["Brgy. Sto. Nino"],
      time: "10m ago",
      citizenReports: 4,
      aiHazardScore: 0.33,
      aiSummary: "Minor slowdown detected; tow truck arrival in 12 minutes.",
      riskBand: "Blue",
      impactRadiusKm: 0.4,
      reportSources: ["Citizen App"],
      recommendedAction: "Coordinate towing and clear debris.",
      mediaUrl: "https://via.placeholder.com/150/3B82F6/000000?text=Accident",
    },
    {
      id: "INC-004",
      type: "Landslide",
      severity: "High",
      status: "Roads Blocked",
      location: "Brgy. Ibaba",
      coordinates: INCIDENT_COORDINATES["Brgy. Ibaba"],
      time: "15m ago",
      citizenReports: 17,
      aiHazardScore: 0.79,
      aiSummary:
        "Slope sensors show continued drift; secondary slide possible.",
      riskBand: "Red",
      impactRadiusKm: 1.1,
      reportSources: ["Hotline", "Barangay Net"],
      recommendedAction: "Close access road and deploy geotech team.",
      mediaUrl: "https://via.placeholder.com/150/8B5CF6/FFFFFF?text=Landslide",
    },
    {
      id: "INC-005",
      type: "Earthquake",
      severity: "High",
      status: "Assessment Ongoing",
      location: "Brgy. San Roque",
      coordinates: INCIDENT_COORDINATES["Brgy. San Roque"],
      time: "20m ago",
      citizenReports: 11,
      aiHazardScore: 0.83,
      aiSummary:
        "Aftershock probability at 42%; inspect low-rise dwellings first.",
      riskBand: "Red",
      impactRadiusKm: 1.3,
      reportSources: ["Seismic Net", "Radio"],
      recommendedAction: "Dispatch rapid damage assessment teams.",
      mediaUrl: "https://via.placeholder.com/150/F43F5E/FFFFFF?text=Quake",
    },
    {
      id: "INC-006",
      type: "Power Outage",
      severity: "Medium",
      status: "Crew En Route",
      location: "Brgy. Bagong Silang",
      coordinates: INCIDENT_COORDINATES["Brgy. Bagong Silang"],
      time: "25m ago",
      citizenReports: 8,
      aiHazardScore: 0.54,
      aiSummary:
        "Grid load shift detected; expect restoration within 40 minutes.",
      riskBand: "Amber",
      impactRadiusKm: 0.7,
      reportSources: ["Call Center", "Utility"],
      recommendedAction: "Activate backup generators for clinic cluster.",
      mediaUrl: "https://via.placeholder.com/150/10B981/FFFFFF?text=Outage",
    },
    {
      id: "INC-007",
      type: "Medical Emergency",
      severity: "High",
      status: "Triage Requested",
      location: "Brgy. Bayan",
      coordinates: INCIDENT_COORDINATES["Brgy. Bayan"],
      time: "30m ago",
      citizenReports: 14,
      aiHazardScore: 0.76,
      aiSummary:
        "Crowd density rising; deploy additional medics within 10 minutes.",
      riskBand: "Red",
      impactRadiusKm: 0.9,
      reportSources: ["LGU Hotline", "Responder Radio"],
      recommendedAction: "Coordinate ambulance staging and triage tent.",
      mediaUrl: "https://via.placeholder.com/150/FFB300/FFFFFF?text=Medical",
    },
  ];

  const initialResponders = [
    {
      id: "R-001",
      name: "Team Alpha",
      status: "Available",
      members: 3,
      location: "Brgy. Malanday Station",
      lastActive: "2m ago",
      specialization: ["Flood", "Medical"],
      coordinates: { lat: 14.6795, lng: 121.0452 },
      currentAssignment: null,
      etaMinutes: null,
    },
    {
      id: "R-002",
      name: "Team Bravo",
      status: "En Route",
      members: 4,
      location: "Brgy. Concepcion Depot",
      lastActive: "5m ago",
      specialization: ["Fire", "Technical Rescue"],
      coordinates: { lat: 14.671, lng: 121.05 },
      currentAssignment: "INC-002",
      etaMinutes: 4,
    },
    {
      id: "R-003",
      name: "Team Charlie",
      status: "On Scene",
      members: 2,
      location: "Brgy. Sto. Nino Ridge",
      lastActive: "10m ago",
      specialization: ["Medical", "Evacuation"],
      coordinates: { lat: 14.665, lng: 121.035 },
      currentAssignment: "INC-003",
      etaMinutes: 2,
    },
    {
      id: "R-004",
      name: "Team Delta",
      status: "Available",
      members: 5,
      location: "Brgy. Bayan Hub",
      lastActive: "15m ago",
      specialization: ["Search & Rescue", "Medical"],
      coordinates: { lat: 14.673, lng: 121.04 },
      currentAssignment: null,
      etaMinutes: null,
    },
    {
      id: "R-005",
      name: "Team Echo",
      status: "Off Duty",
      members: 3,
      location: "Central Base",
      lastActive: "1h ago",
      specialization: ["Fire", "Earthquake Response"],
      coordinates: { lat: 14.667, lng: 121.043 },
      currentAssignment: null,
      etaMinutes: null,
    },
  ];

  const [activeIncidents, setActiveIncidents] = useState(
    initialIncidents.map(enrichIncidentWithGeo)
  );
  const [responders, setResponders] = useState(initialResponders);
  const [showAllIncidents, setShowAllIncidents] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [viewMode, setViewMode] = useState("list"); // "list" or "map"

  const INITIAL_INCIDENT_DISPLAY_COUNT = 2;

  const incidentTypes = [
    "All",
    "Flood",
    "Fire",
    "Vehicle Accident",
    "Landslide",
    "Earthquake",
    "Power Outage",
    "Medical Emergency",
  ];

  const severityLevels = ["All", "Low", "Medium", "High"];

  const addIncident = (incident) => {
    const prepared = enrichIncidentWithGeo({
      ...incident,
      time: incident.time || "Just now",
    });
    setActiveIncidents((prev) => [prepared, ...prev]);
    showIncidentPopup(prepared);
  };

  const handleSnooze = (id) => {
    setActiveIncidents((prev) => prev.filter((inc) => inc.id !== id));
    closeIncidentPopup();
  };

  const handleAssign = (id, responder = null) => {
    const targetIncident = activeIncidents.find((inc) => inc.id === id);
    if (!targetIncident) {
      return;
    }

    let resolvedResponder = responder;
    let resolvedEta = responder?.etaMinutes ?? null;

    if (!resolvedResponder) {
      const suggestion = pickResponderForIncident(targetIncident, responders);
      if (suggestion) {
        resolvedResponder = suggestion.responder;
        resolvedEta = suggestion.etaMinutes;
      }
    }

    if (!resolvedResponder) {
      const incidentLabel = ${targetIncident.type} in ;
      addAlert({
        id: ssign--,
        msg: ${incidentLabel} queued: no available team. Review in Management.,
        time: "Just now",
        type: "System",
      });
      closeIncidentPopup();
      return;
    }

    const responderStatusLabel =
      resolvedResponder.status === "On Scene" ? "On Scene" : "En Route";

    setActiveIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              status: Assigned to ,
              assignedResponder: {
                id: resolvedResponder.id,
                name: resolvedResponder.name,
                status: responderStatusLabel,
                etaMinutes:
                  resolvedEta ?? resolvedResponder.etaMinutes ?? inc.etaMinutes ?? null,
              },
              etaMinutes:
                resolvedEta ?? resolvedResponder.etaMinutes ?? inc.etaMinutes ?? null,
            }
          : inc
      )
    );

    setResponders((prev) =>
      prev.map((team) =>
        team.id === resolvedResponder.id
          ? {
              ...team,
              status: responderStatusLabel,
              currentAssignment: id,
              etaMinutes: resolvedEta ?? team.etaMinutes ?? 10,
              lastActive: "Just now",
            }
          : team
      )
    );

    const incidentLabel = ${targetIncident.type} in ;

    addAlert({
      id: ssign--,
      msg: ${resolvedResponder.name} assigned to .,
      time: "Just now",
      type: "System",
    });
    closeIncidentPopup();
  };

  const handleResponderStatusChange = (responderId, newStatus) => {
    setResponders((prev) =>
      prev.map((team) =>
        team.id === responderId
          ? {
              ...team,
              status: newStatus,
              currentAssignment:
                newStatus === "Available" || newStatus === "Off Duty"
                  ? null
                  : team.currentAssignment,
              lastActive: "Just now",
            }
          : team
      )
    );

    setActiveIncidents((prev) =>
      prev.map((incident) =>
        incident.assignedResponder?.id === responderId
          ? {
              ...incident,
              status:
                newStatus === "Available" || newStatus === "Off Duty"
                  ? "Awaiting Dispatch"
                  : incident.status,
              assignedResponder: {
                ...incident.assignedResponder,
                status: newStatus,
              },
            }
          : incident
      )
    );
  };

  const handleBroadcastAlert = (payload) => {
    addAlert({
      id: `broadcast-${Date.now()}`,
      msg: `${payload.priority} priority broadcast: ${payload.title}`,
      time: "Just now",
      type: "System",
    });
  };

  // Simulate new incident
  useEffect(() => {
    const timer = setTimeout(() => {
      const newIncident = {
        id: `INC-${String(Date.now()).slice(-3)}`,
        type: "Structure Collapse",
        severity: "High",
        location: "Brgy. Tanong",
        time: "1m ago",
        mediaUrl: "https://via.placeholder.com/150/800080/FFFFFF?text=Collapse",
      };
      addIncident(newIncident);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4">
        {kpis.map((k, i) => (
          <KPI key={i} {...k} />
        ))}
      </div>

      {/* Intake Queue */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-ui-text">Intake Queue</h2>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md overflow-hidden border border-ui-border">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 ${
                  viewMode === "list"
                    ? "bg-brand-primary text-white"
                    : "bg-ui-background text-ui-subtext"
                }`}
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-1.5 ${
                  viewMode === "map"
                    ? "bg-brand-primary text-white"
                    : "bg-ui-background text-ui-subtext"
                }`}
              >
                <MapIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 px-2 py-1 text-sm bg-ui-background border border-ui-border rounded hover:bg-ui-border"
              >
                <FunnelIcon className="h-4 w-4" />
                <span>Filter</span>
                {(typeFilter !== "All" || severityFilter !== "All") && (
                  <span className="ml-1 h-2 w-2 rounded-full bg-brand-primary"></span>
                )}
              </button>

              {showFilters && (
                <div className="absolute right-0 top-full mt-1 bg-ui-surface p-3 rounded-lg border border-ui-border shadow-lg z-10 w-72">
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-xs font-medium text-ui-subtext mb-1">
                        Incident Type
                      </label>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full text-sm bg-ui-background border border-ui-border rounded px-2 py-1.5"
                      >
                        {incidentTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ui-subtext mb-1">
                        Severity
                      </label>
                      <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="w-full text-sm bg-ui-background border border-ui-border rounded px-2 py-1.5"
                      >
                        {severityLevels.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => {
                          setTypeFilter("All");
                          setSeverityFilter("All");
                        }}
                        className="text-xs text-brand-primary"
                      >
                        Reset Filters
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="text-xs bg-brand-primary text-white px-3 py-1 rounded"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {activeIncidents.length > 0 ? (
          <div>
            {viewMode === "list" ? (
              <div className="space-y-3">
                {(showAllIncidents
                  ? activeIncidents
                  : activeIncidents.slice(0, INITIAL_INCIDENT_DISPLAY_COUNT)
                )
                  .filter((i) => typeFilter === "All" || i.type === typeFilter)
                  .filter(
                    (i) =>
                      severityFilter === "All" || i.severity === severityFilter
                  )
                  .map((i) => (
                    <IncidentCard
                      key={i.id}
                      incident={i}
                      onClick={() => showIncidentPopup(i)}
                    />
                  ))}
              </div>
            ) : (
              <MapView
                activeIncidents={activeIncidents
                  .filter((i) => typeFilter === "All" || i.type === typeFilter)
                  .filter(
                    (i) =>
                      severityFilter === "All" || i.severity === severityFilter
                  )}
                responders={responders}
                onAssign={handleAssign}
                onIncidentSelect={showIncidentPopup}
              />
            )}

            {viewMode === "list" &&
              activeIncidents.length > INITIAL_INCIDENT_DISPLAY_COUNT && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowAllIncidents((prev) => !prev)}
                    className="w-full text-center px-4 py-2 bg-ui-surface hover:bg-ui-background rounded-lg font-semibold text-brand-primary shadow-card transition-all"
                  >
                    {showAllIncidents
                      ? "See Less"
                      : `See More (${
                          activeIncidents.length -
                          INITIAL_INCIDENT_DISPLAY_COUNT
                        })`}
                  </button>
                </div>
              )}
          </div>
        ) : (
          <div className="text-center py-10 px-4 bg-ui-background rounded-lg">
            <h3 className="text-lg font-medium text-ui-text">All clear!</h3>
            <p className="text-ui-subtext">
              No active incidents at the moment.
            </p>
          </div>
        )}
      </div>

      {/* Alerts Feed */}
      {/* <AlertFeed /> */}

      {/* FAB */}
      <QuickActions
        onManualCreate={addIncident}
        onBroadcast={handleBroadcastAlert}
        onOpenMap={() => setViewMode("map")}
      />

      {popupIncident && (
        <PopupIncident
          incident={popupIncident}
          onClose={closeIncidentPopup}
          onSnooze={() => handleSnooze(popupIncident.id)}
          onAssign={() => handleAssign(popupIncident.id)}
        />
      )}
    </div>
  );
}
