import { useState, useEffect, useMemo } from "react";
import { useNotifications } from "../context/NotificationContext";
import { useIncidentContext } from "../context/IncidentContext";
import { buildPlaceholderImage } from "../utils/placeholder";

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
    const distanceKm = computeDistanceKm(
      incident.coordinates,
      responder.coordinates
    );
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

  const {
    incidents,
    responders: responderDirectory,
    facilities: coreFacilities,
    registerIncident,
    snoozeIncident,
    openAssignSheet,
    assignResponder,
    updateResponderStatus,
    upsertFacility,
    removeFacility,
    getSuggestedResponders,
    kpiSummary,
    openIncidentDetail,
  } = useIncidentContext();

  // State for UI controls
  const [showAllIncidents, setShowAllIncidents] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [viewMode, setViewMode] = useState("list"); // "list" or "map"

  const responders = responderDirectory;
  const userRole = "LGU";
  const INITIAL_INCIDENT_DISPLAY_COUNT = 2;

  const kpis = [
    { label: "Active Reports", value: kpiSummary.activeReports, trend: "+0" },
    { label: "Pending", value: kpiSummary.pending, trend: "" },
    { label: "Resolved Today", value: kpiSummary.resolvedToday, trend: "" },
    { label: "Responders", value: kpiSummary.availableResponders, trend: "" },
  ];

  const handleAssign = (incidentId, responder = null, options = {}) => {
    if (!incidentId) return;
    if (responder?.id) {
      const etaFromOptions =
        Number.isFinite(options.etaMinutes) && options.etaMinutes > 0
          ? options.etaMinutes
          : null;
      const etaFromResponder =
        Number.isFinite(responder.etaMinutes) && responder.etaMinutes > 0
          ? responder.etaMinutes
          : null;
      assignResponder(incidentId, responder.id, {
        ...options,
        etaMinutes: etaFromOptions ?? etaFromResponder ?? null,
        decisionSource: options.decisionSource ?? "Map dispatch",
      });
      return;
    }
    openAssignSheet(incidentId);
  };

  const handleOpenDetail = (incidentId) => {
    if (!incidentId) return;
    openIncidentDetail(incidentId);
    closeIncidentPopup();
  };

  const handleFacilityUpdate = (facility) => {
    if (!facility) return;
    upsertFacility(facility);
  };

  const handleFacilityAdd = (facility) => {
    if (!facility) return;
    upsertFacility({ ...facility, id: facility.id || generateFacilityId() });
  };

  const handleFacilityRemove = (facilityId) => {
    if (!facilityId) return;
    removeFacility(facilityId);
  };

  const currentIncidents = useMemo(() => {
    const now = Date.now();
    return incidents.filter((incident) => {
      if (!incident.snoozedUntil) {
        return true;
      }
      const wakeTime = new Date(incident.snoozedUntil).getTime();
      return Number.isFinite(wakeTime) ? wakeTime <= now : true;
    });
  }, [incidents]);

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
    if (!incident) {
      return;
    }
    const prepared = {
      id: incident.id || `INC-${Date.now()}`,
      ...incident,
      time: incident.time || "Just now",
    };
    registerIncident(prepared);
    showIncidentPopup(prepared);
  };

  const handleSnooze = (id) => {
    if (!id) {
      return;
    }
    snoozeIncident(id);
    closeIncidentPopup();
  };

  const generateFacilityId = () => {
    const suffix = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `FAC-${Date.now()}-${suffix}`;
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
        mediaUrl: buildPlaceholderImage({
          text: "Collapse",
          background: "#800080",
        }),
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

        {currentIncidents.length > 0 ? (
          <div>
            {viewMode === "list" ? (
              <div className="space-y-3">
                {(showAllIncidents
                  ? currentIncidents
                  : currentIncidents.slice(0, INITIAL_INCIDENT_DISPLAY_COUNT)
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
                activeIncidents={currentIncidents
                  .filter((i) => typeFilter === "All" || i.type === typeFilter)
                  .filter(
                    (i) =>
                      severityFilter === "All" || i.severity === severityFilter
                  )}
                responders={responders}
                coreFacilities={coreFacilities}
                viewerRole={userRole}
                onAssign={handleAssign}
                onFacilityUpdate={handleFacilityUpdate}
                onIncidentSelect={(incident) => incident && handleOpenDetail(incident.id)}
              />
            )}

            {viewMode === "list" &&
              currentIncidents.length > INITIAL_INCIDENT_DISPLAY_COUNT && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowAllIncidents((prev) => !prev)}
                    className="w-full text-center px-4 py-2 bg-ui-surface hover:bg-ui-background rounded-lg font-semibold text-brand-primary shadow-card transition-all"
                  >
                    {showAllIncidents
                      ? "See Less"
                      : `See More (${
                          currentIncidents.length -
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
          onOpen={() => handleOpenDetail(popupIncident.id)}
        />
      )}
    </div>
  );
}






