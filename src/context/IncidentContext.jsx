import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { useNotifications } from "./NotificationContext";

const IncidentContext = createContext(null);

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

const DEFAULT_SNOOZE_MINUTES = 10;
const FINAL_STATES = new Set(["Resolved", "Cancelled", "Closed"]);

const SAMPLE_PII = [
  {
    name: "Santos Family",
    notes: "Infant onboard; requires carrier",
    contact: "+63 917 555 2201",
  },
  {
    name: "Maria Luna",
    notes: "Elderly; wheelchair assistance",
    contact: "+63 915 412 8890",
  },
  {
    name: "Josefina Ramos",
    notes: "Dialysis patient; ensure cold chain",
    contact: "+63 917 662 4411",
  },
  {
    name: "Flores Family",
    notes: "Two toddlers, needs formula",
    contact: "+63 917 332 7701",
  },
  {
    name: "Emilio Dela Cruz",
    notes: "Insulin dependent",
    contact: "+63 917 004 1123",
  },
  {
    name: "Barangay Youth Council",
    notes: "Volunteer leader coordinating crowd",
    contact: "+63 905 224 1189",
  },
];

const initialIncidentSeeds = [
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
    occurredAt: "2025-09-22T05:15:00Z",
  },
  {
    id: "INC-002",
    type: "Fire",
    severity: "Medium",
    status: "Responder Mobilized",
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
      name: "Leah Ramirez",
      status: "En Route",
      etaMinutes: 4,
    },
    mediaUrl: "https://via.placeholder.com/150/F59E0B/FFFFFF?text=Fire",
    occurredAt: "2025-09-22T05:12:00Z",
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
    occurredAt: "2025-09-22T05:07:00Z",
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
    aiSummary: "Slope sensors show continued drift; secondary slide possible.",
    riskBand: "Red",
    impactRadiusKm: 1.1,
    reportSources: ["Hotline", "Barangay Net"],
    recommendedAction: "Close access road and deploy geotech team.",
    mediaUrl: "https://via.placeholder.com/150/8B5CF6/FFFFFF?text=Landslide",
    occurredAt: "2025-09-22T05:02:00Z",
    flags: {
      conflict: {
        detectedAt: "2025-09-22T05:08:00Z",
        message:
          "Field scout reported partial clearing, conflicting with latest hazard telemetry.",
      },
    },
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
    occurredAt: "2025-09-22T04:57:00Z",
    flags: {
      offlineCache: {
        cachedAt: "2025-09-22T04:59:00Z",
        note: "Offline mode: using cached data synced via satcom.",
      },
    },
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
    occurredAt: "2025-09-22T04:52:00Z",
    flags: {
      duplicate: {
        of: "INC-002",
        confidence: 0.82,
        note: "Transformer fire and outage share same feeder coordinates.",
      },
    },
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
    occurredAt: "2025-09-22T04:47:00Z",
  },
];

const initialResponders = [
  {
    id: "R-001",
    name: "Miguel Santos",
    status: "Available",
    members: 1,
    location: "Brgy. Malanday Station",
    lastActive: "2m ago",
    specialization: ["Flood", "Medical"],
    agency: "Rescue",
    certifications: ["Swift Water", "First Responder"],
    dutyHistory: ["INC-045 Flood Evacuation", "INC-038 Search Ops"],
    lastCheckIn: "Just now",
    coordinates: { lat: 14.6795, lng: 121.0452 },
    currentAssignment: null,
    etaMinutes: null,
    workload: 0.3,
    shiftWindow: "06:00 - 14:00",
    contactNumber: "+63 917 801 2201",
    homeBase: "Rescue HQ Malanday",
    lastPingAt: "2025-09-22T05:13:00Z",
  },
  {
    id: "R-002",
    name: "Leah Ramirez",
    status: "En Route",
    members: 1,
    location: "Brgy. Concepcion Depot",
    lastActive: "5m ago",
    specialization: ["Fire", "Technical Rescue"],
    agency: "BFP",
    certifications: ["HazMat", "Breaching"],
    dutyHistory: ["INC-042 Market Fire", "INC-031 Chemical Leak"],
    lastCheckIn: "3m ago",
    coordinates: { lat: 14.671, lng: 121.05 },
    currentAssignment: "INC-002",
    etaMinutes: 4,
    workload: 0.7,
    shiftWindow: "14:00 - 22:00",
    contactNumber: "+63 917 802 1144",
    homeBase: "BFP Central",
    lastPingAt: "2025-09-22T05:11:00Z",
  },
  {
    id: "R-003",
    name: "Paolo Fernandez",
    status: "On Scene",
    members: 1,
    location: "Brgy. Sto. Nino Ridge",
    lastActive: "10m ago",
    specialization: ["Medical", "Evacuation"],
    agency: "EMS",
    certifications: ["Paramedic", "Triage Officer"],
    dutyHistory: ["INC-050 Landslide", "INC-035 Heat Stress"],
    lastCheckIn: "7m ago",
    coordinates: { lat: 14.665, lng: 121.035 },
    currentAssignment: "INC-003",
    etaMinutes: 2,
    workload: 0.6,
    shiftWindow: "22:00 - 06:00",
    contactNumber: "+63 917 803 2210",
    homeBase: "EMS Hub Sto. Nino",
    lastPingAt: "2025-09-22T05:05:00Z",
  },
  {
    id: "R-004",
    name: "Amina Cruz",
    status: "Available",
    members: 1,
    location: "Brgy. Bayan Hub",
    lastActive: "15m ago",
    specialization: ["Search & Rescue", "Medical"],
    agency: "Rescue",
    certifications: ["Rope Rescue", "First Aid"],
    dutyHistory: ["INC-041 Missing Person"],
    lastCheckIn: "10m ago",
    coordinates: { lat: 14.673, lng: 121.04 },
    currentAssignment: null,
    etaMinutes: null,
    workload: 0.2,
    shiftWindow: "06:00 - 14:00",
    contactNumber: "+63 917 804 5544",
    homeBase: "Rescue Hub Bayan",
    lastPingAt: "2025-09-22T05:00:00Z",
  },
  {
    id: "R-005",
    name: "Noel Garcia",
    status: "Off Duty",
    members: 1,
    location: "Central Base",
    lastActive: "1h ago",
    specialization: ["Fire", "Earthquake Response"],
    agency: "Volunteer Corps",
    certifications: ["Fire Suppression", "USAR"],
    dutyHistory: ["INC-037 Warehouse Fire"],
    lastCheckIn: "45m ago",
    coordinates: { lat: 14.667, lng: 121.043 },
    currentAssignment: null,
    etaMinutes: null,
    workload: 0.1,
    shiftWindow: "14:00 - 22:00",
    contactNumber: "+63 917 805 1199",
    homeBase: "Volunteer HQ",
    lastPingAt: "2025-09-22T04:25:00Z",
  },
];

const initialFacilities = [
  {
    id: "FAC-001",
    type: "Hospital",
    name: "Marikina Valley Medical Center",
    address: "Sumulong Hwy, Brgy. Sto. Nino",
    hotline: "+63 2 9485 6789",
    status: "Open",
    notes: "Capable of handling mass casualty triage",
    coordinates: { lat: 14.6689, lng: 121.0489 },
    lastUpdated: "2025-09-22T04:30:00Z",
  },
  {
    id: "FAC-002",
    type: "Police Station",
    name: "Marikina Central Police HQ",
    address: "JP Rizal St, Brgy. Sta. Elena",
    hotline: "(02) 571-1234",
    status: "Open",
    notes: "Rapid deployment unit on standby",
    coordinates: { lat: 14.6524, lng: 121.0431 },
    lastUpdated: "2025-09-22T03:55:00Z",
  },
  {
    id: "FAC-003",
    type: "Fire Station",
    name: "Bureau of Fire Protection - Marikina",
    address: "P. Burgos St, Brgy. San Roque",
    hotline: "(02) 646-2000",
    status: "Open",
    notes: "Two pumpers available, one aerial ladder",
    coordinates: { lat: 14.6558, lng: 121.0438 },
    lastUpdated: "2025-09-22T03:10:00Z",
  },
  {
    id: "FAC-004",
    type: "Evacuation Center",
    name: "Malanday Elementary Gymnasium",
    address: "P. Herrera St, Brgy. Malanday",
    hotline: "+63 917 567 4455",
    status: "At Capacity",
    notes: "Requesting additional food packs",
    coordinates: { lat: 14.6812, lng: 121.0448 },
    lastUpdated: "2025-09-22T05:00:00Z",
  },
];

const initialHistory = [
  {
    id: "INC-173",
    incidentId: "INC-173",
    type: "Flood",
    severity: "High",
    outcome: "Resolved",
    decisionType: "After Action",
    date: "2025-09-20T08:45:00Z",
    barangay: "Brgy. Malanday",
    assignedResponder: "Miguel Santos",
    peopleAssisted: 48,
    media: ["river-rising.jpg", "evac-route.mp4"],
    aiSummary:
      "Swift evacuation executed before waters breached first-floor homes. Temporary shelter established at Barangay Gym within 20 minutes.",
    aar: {
      worked:
        "Advance warning from sensors allowed pre-positioning of rescue boats.",
      improve: "Need higher-wattage lighting for night operations.",
      actions: [
        "Coordinate with engineering for drainage clearing",
        "Replenish PPE stock",
      ],
    },
    notes: "Night ops coordination successful with barangay volunteers.",
  },
  {
    id: "INC-162",
    incidentId: "INC-162",
    type: "Fire",
    severity: "Medium",
    outcome: "Contained",
    decisionType: "After Action",
    date: "2025-09-18T19:12:00Z",
    barangay: "Brgy. Concepcion",
    assignedResponder: "Leah Ramirez",
    peopleAssisted: 12,
    media: ["warehouse-fire.jpg"],
    aiSummary:
      "Localized warehouse fire isolated to eastern bay. Foam deployment prevented spread to adjacent LPG storage.",
    aar: {
      worked:
        "Rapid hydrant connection and clear division of interior vs. exterior teams.",
      improve: "Update mutual-aid call list for after-hours shifts.",
      actions: ["Audit hydrant pressure quarterly"],
    },
    notes: "Handled with mutual-aid standby only.",
  },
  {
    id: "INC-151",
    incidentId: "INC-151",
    type: "Medical",
    severity: "Low",
    outcome: "Closed",
    decisionType: "After Action",
    date: "2025-09-15T11:05:00Z",
    barangay: "Brgy. San Roque",
    assignedResponder: "Paolo Fernandez",
    peopleAssisted: 6,
    media: [],
    aiSummary:
      "Heat exhaustion cluster at construction site. IV rehydration administered on-site, no transport required.",
    aar: {
      worked: "Quick triage table set up by EMS lead.",
      improve: "Need portable canopy for shade.",
      actions: [],
    },
    notes: "Forward triage best practice documented.",
  },
];
const initialState = {
  incidents: initialIncidentSeeds.map(enrichIncident),
  responders: initialResponders,
  facilities: initialFacilities,
  history: initialHistory,
  detailIncidentId: null,
  assignState: {
    open: false,
    incidentId: null,
    preselectResponderId: null,
    mode: "assign",
  },
  callLog: [],
};

function incidentReducer(state, action) {
  switch (action.type) {
    case "OPEN_DETAIL":
      return { ...state, detailIncidentId: action.payload.incidentId };
    case "CLOSE_DETAIL":
      return { ...state, detailIncidentId: null };
    case "OPEN_ASSIGN":
      return {
        ...state,
        assignState: {
          open: true,
          incidentId: action.payload.incidentId,
          preselectResponderId: action.payload.responderId ?? null,
          mode: action.payload.mode ?? "assign",
        },
      };
    case "CLOSE_ASSIGN":
      return {
        ...state,
        assignState: {
          open: false,
          incidentId: null,
          preselectResponderId: null,
          mode: "assign",
        },
      };
    case "ASSIGN_RESPONDER":
      return assignResponderReducer(state, action.payload);
    case "MARK_RESOLVED":
      return markIncidentLifecycle(state, {
        incidentId: action.payload.incidentId,
        nextStatus: "Resolved",
        notes: action.payload.notes,
        decisionType: "Resolved",
      });
    case "MARK_CANCELLED":
      return markIncidentLifecycle(state, {
        incidentId: action.payload.incidentId,
        nextStatus: "Cancelled",
        notes: action.payload.notes,
        decisionType: "Cancelled",
      });
    case "UPDATE_RESPONDER_STATUS":
      return {
        ...state,
        responders: state.responders.map((responder) =>
          responder.id === action.payload.responderId
            ? {
                ...responder,
                status: action.payload.status,
                currentAssignment:
                  action.payload.status === "Available" ||
                  action.payload.status === "Off Duty"
                    ? null
                    : responder.currentAssignment,
                lastActive: "Just now",
                lastPingAt: new Date().toISOString(),
              }
            : responder
        ),
      };
    case "ADD_INCIDENT":
      return addIncidentReducer(state, action.payload);
    case "SNOOZE_INCIDENT":
      return snoozeIncidentReducer(state, action.payload);
    case "UPSERT_FACILITY":
      return upsertFacilityReducer(state, action.payload);
    case "REMOVE_FACILITY":
      return removeFacilityReducer(state, action.payload);
    case "REGISTER_CALL":
      return registerCallReducer(state, action.payload);
    case "CLEAR_CONFLICT":
      return clearConflictReducer(state, action.payload);
    default:
      return state;
  }
}

export function IncidentProvider({ children }) {
  const { addAlert } = useNotifications();
  const [state, dispatch] = useReducer(incidentReducer, initialState);

  const openIncidentDetail = useCallback((incidentId) => {
    dispatch({ type: "OPEN_DETAIL", payload: { incidentId } });
  }, []);

  const closeIncidentDetail = useCallback(() => {
    dispatch({ type: "CLOSE_DETAIL" });
  }, []);

  const openAssignSheet = useCallback(
    (incidentId, responderId = null, mode = "assign") => {
      dispatch({
        type: "OPEN_ASSIGN",
        payload: { incidentId, responderId, mode },
      });
    },
    []
  );

  const closeAssignSheet = useCallback(() => {
    dispatch({ type: "CLOSE_ASSIGN" });
  }, []);

  const assignResponder = useCallback(
    (incidentId, responderId, options = {}) => {
      dispatch({
        type: "ASSIGN_RESPONDER",
        payload: {
          incidentId,
          responderId,
          etaMinutes: options.etaMinutes,
          notes: options.notes,
          decisionSource: options.decisionSource || "Command Center",
        },
      });
      const incident = state.incidents.find((item) => item.id === incidentId);
      const responder = state.responders.find(
        (item) => item.id === responderId
      );
      if (incident && responder) {
        addAlert({
          id: `assign-${incidentId}-${responderId}-${Date.now()}`,
          msg: `${responder.name} assigned to ${incident.type} in ${incident.location}`,
          time: "Just now",
          type: "System",
        });
      }
    },
    [addAlert, state.incidents, state.responders]
  );

  const markIncidentResolved = useCallback(
    (incidentId, notes) => {
      dispatch({ type: "MARK_RESOLVED", payload: { incidentId, notes } });
      const incident = state.incidents.find((item) => item.id === incidentId);
      if (incident) {
        addAlert({
          id: `resolve-${incidentId}-${Date.now()}`,
          msg: `${incident.type} in ${incident.location} marked resolved`,
          time: "Just now",
          type: "System",
        });
      }
    },
    [addAlert, state.incidents]
  );

  const markIncidentCancelled = useCallback(
    (incidentId, notes) => {
      dispatch({ type: "MARK_CANCELLED", payload: { incidentId, notes } });
      addAlert({
        id: `cancel-${incidentId}-${Date.now()}`,
        msg: `Incident ${incidentId} marked as cancelled`,
        time: "Just now",
        type: "System",
      });
    },
    [addAlert]
  );

  const updateResponderStatus = useCallback((responderId, status) => {
    dispatch({
      type: "UPDATE_RESPONDER_STATUS",
      payload: { responderId, status },
    });
  }, []);

  const registerIncident = useCallback(
    (incident) => {
      dispatch({ type: "ADD_INCIDENT", payload: { incident } });
      if (incident?.type && incident?.location) {
        addAlert({
          id: `incident-${incident.id ?? Date.now()}`,
          msg: `New incident logged: ${incident.type} in ${incident.location}`,
          time: "Just now",
          type: "New",
        });
      }
    },
    [addAlert]
  );

  const snoozeIncident = useCallback(
    (incidentId, minutes) => {
      dispatch({ type: "SNOOZE_INCIDENT", payload: { incidentId, minutes } });
      addAlert({
        id: `snooze-${incidentId}-${Date.now()}`,
        msg: `Incident ${incidentId} snoozed for ${
          minutes ?? DEFAULT_SNOOZE_MINUTES
        } minutes`,
        time: "Just now",
        type: "System",
      });
    },
    [addAlert]
  );

  const upsertFacility = useCallback((facility) => {
    dispatch({ type: "UPSERT_FACILITY", payload: { facility } });
  }, []);

  const removeFacility = useCallback((facilityId) => {
    dispatch({ type: "REMOVE_FACILITY", payload: { facilityId } });
  }, []);

  const initiateCall = useCallback(
    (incidentId, responderId, notes) => {
      dispatch({
        type: "REGISTER_CALL",
        payload: { incidentId, responderId, notes },
      });
      const responder = state.responders.find(
        (item) => item.id === responderId
      );
      if (responder) {
        addAlert({
          id: `call-${incidentId}-${responderId}-${Date.now()}`,
          msg: `Calling ${responder.name} before confirmation`,
          time: "Just now",
          type: "System",
        });
      }
    },
    [addAlert, state.responders]
  );

  const clearIncidentConflict = useCallback((incidentId) => {
    dispatch({ type: "CLEAR_CONFLICT", payload: { incidentId } });
  }, []);

  const getSuggestedResponders = useCallback(
    (incidentId, limit = 5) => {
      const incident = state.incidents.find((item) => item.id === incidentId);
      if (!incident) return [];
      return rankRespondersForIncident(incident, state.responders).slice(
        0,
        limit
      );
    },
    [state.incidents, state.responders]
  );

  const kpiSummary = useMemo(() => {
    const now = new Date();
    const activeReports = state.incidents.filter(
      (incident) => !isFinalStatus(incident.status)
    ).length;
    const pending = state.incidents.filter((incident) =>
      [
        "Awaiting Dispatch",
        "Pending",
        "Responder Mobilized",
        "Crew En Route",
        "Triage Requested",
        "Roads Blocked",
        "Assessment Ongoing",
      ].includes(incident.status)
    ).length;
    const resolvedToday = state.history.filter((record) => {
      if (!record.date) return false;
      const recordDate = new Date(record.date);
      return (
        record.outcome &&
        record.outcome.toLowerCase().includes("resolved") &&
        isSameDay(recordDate, now)
      );
    }).length;
    const availableResponders = state.responders.filter(
      (responder) => responder.status === "Available"
    ).length;
    return {
      activeReports,
      pending,
      resolvedToday,
      availableResponders,
    };
  }, [state.incidents, state.history, state.responders]);

  const assignmentRoutes = useMemo(() => {
    return state.incidents
      .filter(
        (incident) =>
          incident.assignedResponder?.id && incident.assignedRoute?.path
      )
      .map((incident) => {
        const responder = state.responders.find(
          (item) => item.id === incident.assignedResponder.id
        );
        return {
          incidentId: incident.id,
          responderId: responder?.id ?? incident.assignedResponder.id,
          path: incident.assignedRoute.path,
          severity: incident.severity,
          updatedAt: incident.assignedRoute.updatedAt,
        };
      });
  }, [state.incidents, state.responders]);

  const value = useMemo(
    () => ({
      incidents: state.incidents,
      responders: state.responders,
      facilities: state.facilities,
      history: state.history,
      detailIncidentId: state.detailIncidentId,
      assignState: state.assignState,
      callLog: state.callLog,
      kpiSummary,
      assignmentRoutes,
      openIncidentDetail,
      closeIncidentDetail,
      openAssignSheet,
      closeAssignSheet,
      assignResponder,
      markIncidentResolved,
      markIncidentCancelled,
      updateResponderStatus,
      registerIncident,
      snoozeIncident,
      upsertFacility,
      removeFacility,
      initiateCall,
      clearIncidentConflict,
      getSuggestedResponders,
    }),
    [
      state.incidents,
      state.responders,
      state.facilities,
      state.history,
      state.detailIncidentId,
      state.assignState,
      state.callLog,
      kpiSummary,
      assignmentRoutes,
      openIncidentDetail,
      closeIncidentDetail,
      openAssignSheet,
      closeAssignSheet,
      assignResponder,
      markIncidentResolved,
      markIncidentCancelled,
      updateResponderStatus,
      registerIncident,
      snoozeIncident,
      upsertFacility,
      removeFacility,
      initiateCall,
      clearIncidentConflict,
      getSuggestedResponders,
    ]
  );

  return (
    <IncidentContext.Provider value={value}>
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidentContext() {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error(
      "useIncidentContext must be used within an IncidentProvider"
    );
  }
  return context;
}

function enrichIncident(seed) {
  const severityDefaults =
    SEVERITY_DEFAULTS[seed.severity] || SEVERITY_DEFAULTS.Medium;
  const coordinates =
    seed.coordinates ||
    INCIDENT_COORDINATES[seed.location] ||
    DEFAULT_COORDINATE;
  const timeline = normalizeTimeline(
    seed.timeline ?? buildDefaultTimeline(seed)
  );
  const statusHistory =
    seed.statusHistory ?? buildStatusHistory({ ...seed, timeline });
  const citizenSnapshot =
    seed.citizenSnapshot ?? buildCitizenSnapshot(seed, severityDefaults);
  const peopleStats =
    seed.peopleStats ?? buildPeopleStats(seed, severityDefaults);
  const mediaGallery = buildMediaGallery(seed);
  const riskNotes = seed.riskNotes ?? [
    "Monitor weather advisory feeds for changes.",
    "Coordinate with Barangay for crowd control.",
  ];
  const flags = {
    duplicate: seed.flags?.duplicate ?? null,
    offlineCache: seed.flags?.offlineCache ?? null,
    conflict: seed.flags?.conflict ?? null,
  };

  return {
    ...seed,
    coordinates,
    status: seed.status || "Awaiting Dispatch",
    assignedResponder: seed.assignedResponder || null,
    citizenReports: seed.citizenReports ?? severityDefaults.citizenReports,
    aiHazardScore: seed.aiHazardScore ?? severityDefaults.aiHazardScore,
    riskBand: seed.riskBand || severityDefaults.riskBand,
    aiSummary: seed.aiSummary || severityDefaults.aiSummary,
    aiHazardNarrative:
      seed.aiHazardNarrative || seed.aiSummary || severityDefaults.aiSummary,
    impactRadiusKm: seed.impactRadiusKm ?? severityDefaults.impactRadiusKm,
    timeline,
    statusHistory,
    citizenSnapshot,
    peopleStats,
    mediaGallery,
    playbookRef:
      seed.playbookRef || `${seed.type.toUpperCase().replace(/\s+/g, "-")}-SOP`,
    decisionLog: seed.decisionLog ?? [],
    flags,
    version: seed.version ?? 1,
    snoozedUntil: seed.snoozedUntil ?? null,
    riskNotes,
  };
}

function normalizeTimeline(entries) {
  return entries
    .map((entry, index) => ({
      id: entry.id ?? `timeline-${index}-${Date.now()}`,
      timestamp: entry.timestamp ?? new Date().toISOString(),
      label: entry.label ?? "Timeline event",
      actor: entry.actor ?? "System",
    }))
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
}

function buildCitizenSnapshot(seed, severityDefaults) {
  const severityFactor =
    seed.severity === "High" ? 2.6 : seed.severity === "Medium" ? 1.8 : 1.4;
  const citizenReports = seed.citizenReports ?? severityDefaults.citizenReports;
  const households = Math.max(10, Math.round(citizenReports * severityFactor));
  const population = Math.round(
    households * (seed.severity === "High" ? 3.4 : 3)
  );
  const vulnerable = Math.max(
    3,
    Math.round(population * (seed.severity === "High" ? 0.12 : 0.08))
  );
  return {
    households,
    population,
    vulnerable,
    pii: buildPIIList(seed.id, Math.min(3, households >= 40 ? 3 : 2)),
  };
}

function buildPIIList(incidentId, count) {
  const baseIndex = incidentId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const items = [];
  for (let i = 0; i < count; i += 1) {
    const sample = SAMPLE_PII[(baseIndex + i) % SAMPLE_PII.length];
    items.push({
      id: `${incidentId}-pii-${i}`,
      name: sample.name,
      contact: sample.contact,
      notes: sample.notes,
    });
  }
  return items;
}

function buildPeopleStats(seed, severityDefaults) {
  const base = seed.citizenReports ?? severityDefaults.citizenReports;
  const estimated = Math.max(
    12,
    Math.round(base * (seed.severity === "High" ? 8 : 5))
  );
  const evacuated =
    seed.severity === "High"
      ? Math.round(estimated * 0.22)
      : Math.round(estimated * 0.15);
  const injured =
    seed.severity === "High"
      ? Math.max(0, Math.round(estimated * 0.04))
      : Math.round(estimated * 0.02);
  const missing = seed.severity === "High" ? Math.round(estimated * 0.01) : 0;
  return {
    estimated,
    evacuated,
    injured,
    missing,
  };
}

function buildMediaGallery(seed) {
  if (Array.isArray(seed.mediaGallery) && seed.mediaGallery.length) {
    return seed.mediaGallery;
  }
  const baseColor = getSeverityColorBlock(seed.severity);
  const fallback =
    seed.mediaUrl ||
    `https://via.placeholder.com/150/${baseColor}/FFFFFF?text=${encodeURIComponent(
      seed.type
    )}`;
  return [
    {
      id: `${seed.id}-media-hero`,
      type: "image",
      url: fallback,
      caption: `${seed.type} overview`,
    },
    {
      id: `${seed.id}-media-context`,
      type: "image",
      url: `https://via.placeholder.com/320/${baseColor}/FFFFFF?text=${encodeURIComponent(
        seed.location
      )}`,
      caption: `${seed.location} context`,
    },
    {
      id: `${seed.id}-media-asset`,
      type: "image",
      url: "https://via.placeholder.com/320/0F172A/FFFFFF?text=Asset+Map",
      caption: "Asset map preview",
    },
  ];
}

function getSeverityColorBlock(severity) {
  if (severity === "High") return "EF4444";
  if (severity === "Medium") return "F59E0B";
  return "3B82F6";
}

function buildDefaultTimeline(seed) {
  const base = seed.occurredAt ? new Date(seed.occurredAt) : new Date();
  const toIso = (minutes) =>
    new Date(base.getTime() + minutes * 60000).toISOString();
  const sources = seed.reportSources ?? ["Citizen"];
  return [
    {
      id: `${seed.id}-timeline-0`,
      timestamp: toIso(-2),
      label: `${sources[0]} report received`,
      actor: sources[0],
    },
    {
      id: `${seed.id}-timeline-1`,
      timestamp: toIso(-1),
      label: "AI triage run completed",
      actor: "ResQLink AI",
    },
    {
      id: `${seed.id}-timeline-2`,
      timestamp: toIso(-0.3),
      label: "Command center verifying resources",
      actor: "Command Center",
    },
  ];
}

function buildStatusHistory(seed) {
  const timeline = seed.timeline ?? [];
  const earliest = timeline.length
    ? timeline[0].timestamp
    : seed.occurredAt ?? new Date().toISOString();
  return [
    {
      status: seed.status ?? "Awaiting Dispatch",
      timestamp: earliest,
      detail: "Incident logged in command center",
    },
  ];
}

function appendAndSortTimeline(existing, entry) {
  return normalizeTimeline([...(existing ?? []), entry]);
}

function buildRoute(origin, target) {
  const start = origin ?? DEFAULT_COORDINATE;
  const end = target ?? DEFAULT_COORDINATE;
  return {
    path: [
      [start.lat, start.lng],
      [end.lat, end.lng],
    ],
    updatedAt: new Date().toISOString(),
  };
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

function computeDistanceKm(origin, target) {
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
}

function estimateEtaMinutes(distanceKm, fallback) {
  if (Number.isFinite(fallback)) {
    return fallback;
  }
  if (!Number.isFinite(distanceKm)) {
    return 12;
  }
  return Math.max(3, Math.round(distanceKm * 4));
}

function getStatusScore(status) {
  switch (status) {
    case "Available":
    case "Standby":
      return 1;
    case "En Route":
      return 0.6;
    case "On Scene":
    case "On Mission":
      return 0.4;
    default:
      return 0.2;
  }
}

function isWithinShift(window, iso) {
  if (!window) return true;
  const [startRaw, endRaw] = window.split("-").map((part) => part.trim());
  if (!startRaw || !endRaw) return true;
  const incidentTime = iso ? new Date(iso) : new Date();
  const local = new Date(incidentTime);
  const [startHour, startMinute] = startRaw.split(":").map(Number);
  const [endHour, endMinute] = endRaw.split(":").map(Number);
  const start = new Date(local);
  start.setHours(startHour, startMinute || 0, 0, 0);
  const end = new Date(local);
  end.setHours(endHour, endMinute || 0, 0, 0);
  if (end <= start) {
    return local >= start || local <= end;
  }
  return local >= start && local <= end;
}

function scoreResponderForIncident(incident, responder) {
  const distanceKm = computeDistanceKm(
    responder.coordinates,
    incident.coordinates
  );
  const distanceScore = Number.isFinite(distanceKm)
    ? Math.max(0, 1 - Math.min(distanceKm, 20) / 20)
    : 0.4;
  const skillMatches = Array.isArray(responder.specialization)
    ? responder.specialization.filter((skill) =>
        incident.type.toLowerCase().includes(skill.toLowerCase())
      ).length
    : 0;
  const skillScore = skillMatches
    ? Math.min(1, 0.5 + skillMatches * 0.25)
    : 0.35;
  const workload = responder.workload ?? 0.5;
  const workloadScore = 1 - Math.min(0.95, workload);
  const statusScore = getStatusScore(responder.status);
  const shiftScore = isWithinShift(responder.shiftWindow, incident.occurredAt)
    ? 1
    : 0.6;
  const composite =
    distanceScore * 0.35 +
    skillScore * 0.25 +
    workloadScore * 0.2 +
    statusScore * 0.15 +
    shiftScore * 0.05;
  const etaMinutes = estimateEtaMinutes(distanceKm, responder.etaMinutes);
  return {
    responder,
    distanceKm,
    distanceScore,
    skillScore,
    workloadScore,
    statusScore,
    shiftScore,
    composite,
    etaMinutes,
  };
}

function rankRespondersForIncident(incident, responders) {
  return responders
    .filter((responder) => responder.status !== "Off Duty")
    .map((responder) => scoreResponderForIncident(incident, responder))
    .sort((a, b) => b.composite - a.composite);
}

function buildHistoryEntry(incident, overrides = {}) {
  if (!incident) return null;
  const peopleAssisted = Math.max(
    incident.peopleStats?.evacuated ?? 0,
    Math.round((incident.citizenReports ?? 4) * 2)
  );
  const media = (incident.mediaGallery ?? [])
    .slice(0, 3)
    .map((item) => item.url);
  return {
    id: `${incident.id}-${Date.now()}`,
    incidentId: incident.id,
    type: incident.type,
    severity: incident.severity,
    date: new Date().toISOString(),
    barangay: incident.location,
    assignedResponder: incident.assignedResponder?.name ?? "Unassigned",
    peopleAssisted,
    media,
    aiSummary: incident.aiSummary,
    aar: {
      worked: incident.recommendedAction ?? "Follow SOP.",
      improve: "Log field updates for analytics.",
      actions: [],
    },
    decisionType: overrides.decisionType ?? "Assignment",
    outcome: overrides.outcome ?? incident.status,
    notes: overrides.notes ?? "",
  };
}
function assignResponderReducer(state, payload) {
  const {
    incidentId,
    responderId,
    etaMinutes,
    notes,
    decisionSource = "Command Center",
  } = payload;
  const incident = state.incidents.find((item) => item.id === incidentId);
  const responder = state.responders.find((item) => item.id === responderId);
  if (!incident || !responder) {
    return state;
  }
  const nowIso = new Date().toISOString();
  const inferredEta = estimateEtaMinutes(
    computeDistanceKm(responder.coordinates, incident.coordinates),
    etaMinutes ?? responder.etaMinutes
  );

  const responders = state.responders.map((item) => {
    if (item.id === responderId) {
      return {
        ...item,
        status: "En Route",
        currentAssignment: incidentId,
        etaMinutes: inferredEta,
        workload: Math.min(0.95, (item.workload ?? 0.4) + 0.2),
        lastActive: "Just now",
        lastPingAt: nowIso,
      };
    }
    if (item.currentAssignment === incidentId && item.id !== responderId) {
      return {
        ...item,
        status: "Available",
        currentAssignment: null,
        etaMinutes: null,
        workload: Math.max(0.2, (item.workload ?? 0.4) - 0.2),
        lastActive: "Just now",
        lastPingAt: nowIso,
      };
    }
    return item;
  });

  const incidents = state.incidents.map((item) => {
    if (item.id !== incidentId) return item;
    const priorResponderId = item.assignedResponder?.id ?? null;
    const hasReassignment =
      priorResponderId && priorResponderId !== responderId;

    const timelineEntry = {
      id: `${incidentId}-assign-${Date.now()}`,
      timestamp: nowIso,
      label: `${responder.name} ${
        hasReassignment ? "reassigned" : "assigned"
      } (${inferredEta} min ETA)`,
      actor: decisionSource,
    };

    const statusHistory = [
      ...item.statusHistory,
      {
        status: "Assigned",
        timestamp: nowIso,
        detail: `${responder.name} dispatched`,
      },
      {
        status: "In Progress",
        timestamp: nowIso,
        detail: `${responder.name} en route`,
      },
    ];

    const decisionLog = [
      ...item.decisionLog,
      {
        id: `${incidentId}-decision-${Date.now()}`,
        at: nowIso,
        action: hasReassignment ? "Reassignment" : "Assignment",
        actor: decisionSource,
        responderId,
        responderName: responder.name,
        notes: notes ?? "",
      },
    ];

    const assignedRoute = buildRoute(responder.coordinates, item.coordinates);

    return {
      ...item,
      status: "In Progress",
      assignedResponder: {
        id: responder.id,
        name: responder.name,
        status: "En Route",
        etaMinutes: inferredEta,
        lastSynced: nowIso,
      },
      assignedRoute,
      timeline: appendAndSortTimeline(item.timeline, timelineEntry),
      statusHistory,
      decisionLog,
      version: (item.version ?? 1) + 1,
      flags: {
        ...item.flags,
        conflict: null,
      },
    };
  });

  const updatedIncident = incidents.find((item) => item.id === incidentId);
  const historyEntry = buildHistoryEntry(updatedIncident, {
    decisionType:
      incident.assignedResponder &&
      incident.assignedResponder.id !== responderId
        ? "Reassignment"
        : "Assignment",
    outcome: "Assigned",
    notes: notes ?? "",
  });

  return {
    ...state,
    incidents,
    responders,
    history: historyEntry ? [historyEntry, ...state.history] : state.history,
    assignState: {
      open: false,
      incidentId: null,
      preselectResponderId: null,
      mode: "assign",
    },
  };
}

function markIncidentLifecycle(
  state,
  { incidentId, nextStatus, notes, decisionType }
) {
  const incident = state.incidents.find((item) => item.id === incidentId);
  if (!incident) return state;
  const nowIso = new Date().toISOString();
  const responders = state.responders.map((responder) => {
    if (
      incident.assignedResponder?.id &&
      responder.id === incident.assignedResponder.id
    ) {
      return {
        ...responder,
        status: "Available",
        currentAssignment: null,
        etaMinutes: null,
        workload: Math.max(0.15, (responder.workload ?? 0.4) - 0.2),
        lastActive: "Just now",
        lastPingAt: nowIso,
      };
    }
    return responder;
  });
  const timelineEntry = {
    id: `${incidentId}-${nextStatus.toLowerCase()}-${Date.now()}`,
    timestamp: nowIso,
    label:
      nextStatus === "Resolved"
        ? "Incident marked resolved"
        : "Incident cancelled",
    actor: "Command Center",
  };
  const statusHistoryEntry = {
    status: nextStatus,
    timestamp: nowIso,
    detail: notes ?? "",
  };
  const decisionEntry = {
    id: `${incidentId}-decision-${Date.now()}`,
    at: nowIso,
    action: decisionType ?? nextStatus,
    actor: "Command Center",
    responderId: incident.assignedResponder?.id ?? null,
    responderName: incident.assignedResponder?.name ?? "Unassigned",
    notes: notes ?? "",
  };

  const incidents = state.incidents.map((item) =>
    item.id === incidentId
      ? {
          ...item,
          status: nextStatus,
          resolvedAt: nowIso,
          assignedResponder:
            nextStatus === "Resolved" || nextStatus === "Cancelled"
              ? item.assignedResponder
                ? { ...item.assignedResponder, status: nextStatus }
                : null
              : item.assignedResponder,
          timeline: appendAndSortTimeline(item.timeline, timelineEntry),
          statusHistory: [...item.statusHistory, statusHistoryEntry],
          decisionLog: [...item.decisionLog, decisionEntry],
          version: (item.version ?? 1) + 1,
        }
      : item
  );

  const updatedIncident = incidents.find((item) => item.id === incidentId);
  const historyEntry = buildHistoryEntry(updatedIncident, {
    decisionType: decisionType ?? "Lifecycle",
    outcome: nextStatus,
    notes: notes ?? "",
  });

  return {
    ...state,
    incidents,
    responders,
    history: historyEntry ? [historyEntry, ...state.history] : state.history,
  };
}

function registerCallReducer(state, { incidentId, responderId, notes }) {
  const incident = state.incidents.find((item) => item.id === incidentId);
  const responder = state.responders.find((item) => item.id === responderId);
  if (!incident || !responder) {
    return state;
  }
  const nowIso = new Date().toISOString();
  const callEntry = {
    id: `${incidentId}-call-${Date.now()}`,
    timestamp: nowIso,
    label: `Call placed to ${responder.name}`,
    actor: "Command Center",
  };
  const incidents = state.incidents.map((item) =>
    item.id === incidentId
      ? {
          ...item,
          timeline: appendAndSortTimeline(item.timeline, callEntry),
          decisionLog: [
            ...item.decisionLog,
            {
              id: `${incidentId}-decision-${Date.now()}`,
              at: nowIso,
              action: "Call First",
              actor: "Command Center",
              responderId,
              responderName: responder.name,
              notes: notes ?? "",
            },
          ],
        }
      : item
  );
  return {
    ...state,
    incidents,
    callLog: [
      ...state.callLog,
      {
        incidentId,
        responderId,
        at: nowIso,
        notes: notes ?? "",
      },
    ],
  };
}

function addIncidentReducer(state, { incident }) {
  if (!incident) return state;
  const prepared = enrichIncident(incident);
  const withoutDup = state.incidents.filter((item) => item.id !== prepared.id);
  const timelineEntry = {
    id: `${prepared.id}-logged-${Date.now()}`,
    timestamp: new Date().toISOString(),
    label: "Manual incident logged by command center",
    actor: "Command Center",
  };
  const incidents = [
    {
      ...prepared,
      timeline: appendAndSortTimeline(prepared.timeline ?? [], timelineEntry),
    },
    ...withoutDup,
  ];
  return {
    ...state,
    incidents,
  };
}

function snoozeIncidentReducer(state, { incidentId, minutes }) {
  const incident = state.incidents.find((item) => item.id === incidentId);
  if (!incident) return state;
  const duration = minutes ?? DEFAULT_SNOOZE_MINUTES;
  const snoozedUntil = new Date(Date.now() + duration * 60000).toISOString();
  const timelineEntry = {
    id: `${incidentId}-snooze-${Date.now()}`,
    timestamp: new Date().toISOString(),
    label: `Incident snoozed for ${duration} minutes`,
    actor: "Command Center",
  };
  const incidents = state.incidents.map((item) =>
    item.id === incidentId
      ? {
          ...item,
          snoozedUntil,
          timeline: appendAndSortTimeline(item.timeline, timelineEntry),
        }
      : item
  );
  return {
    ...state,
    incidents,
  };
}

function normalizeFacility(facility) {
  const coordinates = facility.coordinates ?? {};
  const lat = Number(coordinates.lat);
  const lng = Number(coordinates.lng);
  return {
    ...facility,
    coordinates: {
      lat: Number.isFinite(lat) ? lat : DEFAULT_COORDINATE.lat,
      lng: Number.isFinite(lng) ? lng : DEFAULT_COORDINATE.lng,
    },
    lastUpdated: facility.lastUpdated ?? new Date().toISOString(),
  };
}

function upsertFacilityReducer(state, { facility }) {
  if (!facility) return state;
  const normalized = normalizeFacility(facility);
  const facilities = [
    normalized,
    ...state.facilities.filter((item) => item.id !== normalized.id),
  ];
  return {
    ...state,
    facilities,
  };
}

function removeFacilityReducer(state, { facilityId }) {
  if (!facilityId) return state;
  return {
    ...state,
    facilities: state.facilities.filter(
      (facility) => facility.id !== facilityId
    ),
  };
}

function clearConflictReducer(state, { incidentId }) {
  return {
    ...state,
    incidents: state.incidents.map((incident) =>
      incident.id === incidentId
        ? {
            ...incident,
            flags: {
              ...incident.flags,
              conflict: null,
            },
            version: (incident.version ?? 1) + 1,
          }
        : incident
    ),
  };
}

function isFinalStatus(status) {
  return FINAL_STATES.has(status);
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
