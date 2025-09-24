import { useState, useEffect, useMemo, useCallback } from "react";
import { MapPinIcon } from "@heroicons/react/24/solid";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
  Circle,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import {
  Maximize2,
  Minimize2,
  Radar,
  Users as UsersIcon,
  Crosshair,
  Activity,
  AlertTriangle,
  SignalHigh,
  Target,
  Building2,
  Hospital,
  Shield,
  Flame,
  Home,
  Phone,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

// Fix for default marker icons in Leaflet with Vite/webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER = [14.676, 121.0437];
const DEFAULT_ZOOM = 13;
const SEVERITY_ORDER = { High: 0, Medium: 1, Low: 2 };
const HAPTIC_SHORT = 18;
const HAPTIC_TOGGLE = [12, 10, 16];

function MapController({ center, zoom }) {
  const mapInstance = useMap();

  useEffect(() => {
    if (mapInstance && center) {
      mapInstance.setView(center, zoom);
    }
  }, [mapInstance, center, zoom]);

  return null;
}

const createIncidentIcon = (severity, isSelected = false) => {
  const color = getSeverityColor(severity);
  const size = isSelected ? 34 : 28;
  const borderWidth = isSelected ? 3 : 2;

  return L.divIcon({
    className: "custom-div-icon incident-marker",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${borderWidth}px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.3);transform:translate(-50%,-50%);position:relative;">
        <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-45%);font-size:11px;font-weight:700;color:#fff;font-family:Inter,Arial,sans-serif;">${
          severity?.[0] ?? ""
        }</span>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const createResponderIcon = (status) => {
  const color =
    status === "Available"
      ? "#34D399"
      : status === "On Scene"
      ? "#3B82F6"
      : status === "En Route"
      ? "#F59E0B"
      : "#9CA3AF";

  return L.divIcon({
    className: "custom-div-icon responder-marker",
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.25);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -6],
  });
};

function getSeverityColor(severity) {
  switch (severity) {
    case "High":
      return "#F43F5E";
    case "Medium":
      return "#F97316";
    case "Low":
      return "#3B82F6";
    default:
      return "#6B7280";
  }
}

function getRiskColor(riskBand) {
  switch (riskBand) {
    case "Red":
      return "#F43F5E";
    case "Amber":
      return "#F97316";
    case "Blue":
      return "#3B82F6";
    default:
      return "#0EA5E9";
  }
}

const EARTH_RADIUS_KM = 6371;
const toRad = (value) => (value * Math.PI) / 180;

function calculateDistanceKm(source, target) {
  if (!source || !target) return null;
  const { lat: lat1, lng: lng1 } = source;
  const { lat: lat2, lng: lng2 } = target;
  if (
    typeof lat1 !== "number" ||
    typeof lng1 !== "number" ||
    typeof lat2 !== "number" ||
    typeof lng2 !== "number"
  ) {
    return null;
  }
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

const FACILITY_STATUS_OPTIONS = ["Open", "At Capacity", "Full"];

const FACILITY_MARKER_GLYPHS = {
  Hospital:
    '<svg class="facility-marker-icon" viewBox="0 0 24 24"><path fill="white" d="M10 3h4v6h6v4h-6v8h-4v-8H4v-4h6z"/></svg>',
  "Police Station":
    '<svg class="facility-marker-icon" viewBox="0 0 24 24"><path fill="white" d="M12 2l7 3v5c0 5.5-3.4 10.6-7 12-3.6-1.4-7-6.5-7-12V5z"/></svg>',
  "Fire Station":
    '<svg class="facility-marker-icon" viewBox="0 0 24 24"><path fill="white" d="M12 2c2.4 2.3 4 4.8 4 7.3 0 3.3-2.4 5-4 6.7-1.6-1.7-4-3.4-4-6.7 0-2.5 1.6-5 4-7.3z"/></svg>',
  "Evacuation Center":
    '<svg class="facility-marker-icon" viewBox="0 0 24 24"><path fill="white" d="M12 4l8 7h-2v9h-4v-5h-4v5H6v-9H4z"/></svg>',
};

const FACILITY_TYPE_META = {
  Hospital: {
    color: "#22C55E",
    markerHtml: FACILITY_MARKER_GLYPHS.Hospital,
    icon: Hospital,
  },
  "Police Station": {
    color: "#3B82F6",
    markerHtml: FACILITY_MARKER_GLYPHS["Police Station"],
    icon: Shield,
  },
  "Fire Station": {
    color: "#EF4444",
    markerHtml: FACILITY_MARKER_GLYPHS["Fire Station"],
    icon: Flame,
  },
  "Evacuation Center": {
    color: "#F97316",
    markerHtml: FACILITY_MARKER_GLYPHS["Evacuation Center"],
    icon: Home,
  },
  __fallback: {
    color: "#6366F1",
    markerHtml: '<span class="facility-marker-glyph">F</span>',
    icon: Building2,
  },
};

function getFacilityStatusAccent(status, fallbackColor) {
  if (!status) return fallbackColor;
  const normalized = status.toLowerCase();
  if (normalized.includes("full")) {
    return "#DC2626";
  }
  if (normalized.includes("capacity")) {
    return "#F97316";
  }
  if (normalized.includes("closed")) {
    return "#6B7280";
  }
  return fallbackColor;
}

function createFacilityIcon(type, status, isHighlighted = false) {
  const meta = FACILITY_TYPE_META[type] ?? FACILITY_TYPE_META.__fallback;
  const accent = getFacilityStatusAccent(status, meta.color);
  const glyphHtml =
    meta.markerHtml ?? '<span class="facility-marker-glyph">F</span>';
  const highlightFlag = isHighlighted ? "true" : "false";
  return L.divIcon({
    className: "custom-div-icon facility-marker",
    html: `<div class="facility-marker-pin" data-highlight="${highlightFlag}" style="--facility-color:${meta.color};--facility-ring:${accent};">${glyphHtml}</div>`,
    iconSize: [30, 36],
    iconAnchor: [15, 32],
    popupAnchor: [0, -30],
  });
}

function getFacilityStatusBadgeClass(status) {
  if (!status) {
    return "bg-ui-border text-ui-subtext";
  }
  const normalized = status.toLowerCase();
  if (normalized.includes("full")) {
    return "border border-status-high/40 bg-status-high/15 text-status-high";
  }
  if (normalized.includes("capacity")) {
    return "border border-status-medium/40 bg-status-medium/15 text-status-medium";
  }
  return "border border-status-low/40 bg-status-low/15 text-status-low";
}

function toDialHref(value) {
  if (typeof value !== "string") return null;
  const digits = value.replace(/[^+\d]/g, "");
  return digits.length > 3 ? `tel:${digits}` : null;
}

function FacilityPane() {
  const mapInstance = useMap();

  useEffect(() => {
    if (!mapInstance) return;
    if (!mapInstance.getPane("core-facilities")) {
      const pane = mapInstance.createPane("core-facilities");
      pane.style.zIndex = "550";
    }
  }, [mapInstance]);

  return null;
}

const formatHazardScore = (value) =>
  `${Math.round(Math.min(Math.max(value ?? 0, 0), 1) * 100)}%`;

const formatDistanceKm = (value) =>
  value == null ? "--" : `${value.toFixed(1)} km`;

export default function MapView({
  activeIncidents = [],
  onIncidentSelect,
  responders = [],
  coreFacilities = [],
  viewerRole = "Citizen",
  onAssign,
  onFacilityUpdate,
  onFacilityAdd,
  onFacilityRemove,
}) {
  const incidents = useMemo(
    () =>
      activeIncidents.map((incident) => {
        const coordinates = incident.coordinates || {};
        const lat =
          typeof coordinates.lat === "number"
            ? coordinates.lat
            : Number(coordinates.lat);
        const lng =
          typeof coordinates.lng === "number"
            ? coordinates.lng
            : Number(coordinates.lng);

        return {
          ...incident,
          lat: Number.isFinite(lat) ? lat : DEFAULT_CENTER[0],
          lng: Number.isFinite(lng) ? lng : DEFAULT_CENTER[1],
          citizenReports: incident.citizenReports ?? 0,
          aiHazardScore: incident.aiHazardScore ?? 0,
          impactRadiusKm: incident.impactRadiusKm ?? 0.8,
          riskBand: incident.riskBand ?? "Amber",
          status: incident.status ?? "Awaiting Dispatch",
          reportSources: incident.reportSources ?? [],
        };
      }),
    [activeIncidents]
  );

  const sortedIncidents = useMemo(() => {
    return [...incidents].sort((a, b) => {
      const severityCompare =
        (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99);
      if (severityCompare !== 0) return severityCompare;
      return (b.citizenReports ?? 0) - (a.citizenReports ?? 0);
    });
  }, [incidents]);

  const [selectedIncidentId, setSelectedIncidentId] = useState(() =>
    incidents.length ? incidents[0].id : null
  );

  useEffect(() => {
    if (!incidents.length) {
      setSelectedIncidentId(null);
      return;
    }
    setSelectedIncidentId((current) => {
      if (current && incidents.some((inc) => inc.id === current)) {
        return current;
      }
      return incidents[0].id;
    });
  }, [incidents]);

  const selectedIncident = useMemo(
    () => incidents.find((inc) => inc.id === selectedIncidentId) ?? null,
    [incidents, selectedIncidentId]
  );

  const [autoFocus, setAutoFocus] = useState(true);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [mapIsReady, setMapIsReady] = useState(false);
  const [showResponders, setShowResponders] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showFacilities, setShowFacilities] = useState(true);
  const [facilityVisibility, setFacilityVisibility] = useState(() => {
    const visibility = {};
    coreFacilities.forEach((facility) => {
      if (facility?.type) {
        visibility[facility.type] = true;
      }
    });
    return visibility;
  });
  const [isAddingFacility, setIsAddingFacility] = useState(false);
  const [draftFacility, setDraftFacility] = useState(null);
  const isFacilityManager = viewerRole?.toLowerCase().includes("lgu");

  useEffect(() => {
    if (!isFacilityManager) {
      setIsAddingFacility(false);
      setDraftFacility(null);
    }
  }, [isFacilityManager]);

  const triggerHaptic = (pattern = HAPTIC_SHORT) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setMapIsReady(true), 260);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!selectedIncident || !autoFocus) return;
    setMapCenter([selectedIncident.lat, selectedIncident.lng]);
    setMapZoom((prev) => Math.max(prev, 13));
  }, [selectedIncident, autoFocus]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isFullScreen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
    return undefined;
  }, [isFullScreen]);

  const responderMarkers = useMemo(
    () =>
      responders
        .map((responder) => {
          const coordinates = responder.coordinates || {};
          const lat =
            typeof coordinates.lat === "number"
              ? coordinates.lat
              : Number(coordinates.lat);
          const lng =
            typeof coordinates.lng === "number"
              ? coordinates.lng
              : Number(coordinates.lng);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return null;
          }
          return {
            ...responder,
            lat,
            lng,
          };
        })
        .filter(Boolean),
    [responders]
  );

  const facilityTypes = useMemo(() => {
    const unique = new Set();
    coreFacilities.forEach((facility) => {
      if (facility?.type) {
        unique.add(facility.type);
      }
    });
    return Array.from(unique);
  }, [coreFacilities]);

  useEffect(() => {
    if (!facilityTypes.length) {
      setFacilityVisibility((prev) => {
        if (!prev || Object.keys(prev).length === 0) {
          return prev;
        }
        return {};
      });
      return;
    }

    setFacilityVisibility((prev) => {
      const next = {};
      facilityTypes.forEach((type) => {
        next[type] = prev?.[type] ?? true;
      });
      const prevKeys = Object.keys(prev || {});
      const sameKeyLength = prevKeys.length === facilityTypes.length;
      if (
        sameKeyLength &&
        facilityTypes.every((type) => prevKeys.includes(type))
      ) {
        let changed = false;
        facilityTypes.forEach((type) => {
          if (next[type] !== prev[type]) {
            changed = true;
          }
        });
        if (!changed) {
          return prev;
        }
      }
      return next;
    });
  }, [facilityTypes]);

  const facilityTypeSuggestions = useMemo(() => {
    const canonical = [
      "Hospital",
      "Police Station",
      "Fire Station",
      "Evacuation Center",
    ];
    const extras = facilityTypes.filter(
      (type) => type && !canonical.includes(type)
    );
    const merged = Array.from(new Set([...canonical, ...extras]));
    return merged;
  }, [facilityTypes]);

  const facilityMarkers = useMemo(
    () =>
      coreFacilities
        .map((facility) => {
          if (!facility) return null;
          const coordinates = facility.coordinates || {};
          const lat =
            typeof coordinates.lat === "number"
              ? coordinates.lat
              : Number(coordinates.lat);
          const lng =
            typeof coordinates.lng === "number"
              ? coordinates.lng
              : Number(coordinates.lng);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return null;
          }
          return {
            ...facility,
            lat,
            lng,
            dialHref: toDialHref(facility.hotline),
          };
        })
        .filter(Boolean),
    [coreFacilities]
  );

  const visibleFacilities = useMemo(
    () =>
      facilityMarkers.filter((facility) => {
        if (!showFacilities) return false;
        if (!facility.type) return true;
        return facilityVisibility[facility.type] ?? true;
      }),
    [facilityMarkers, facilityVisibility, showFacilities]
  );
  const nearestFacilities = useMemo(() => {
    if (!selectedIncident || !visibleFacilities.length) {
      return [];
    }
    const origin = { lat: selectedIncident.lat, lng: selectedIncident.lng };
    const byType = new Map();
    visibleFacilities.forEach((facility) => {
      const distanceKm = calculateDistanceKm(
        { lat: facility.lat, lng: facility.lng },
        origin
      );
      if (distanceKm == null) {
        return;
      }
      const current = byType.get(facility.type);
      if (!current || distanceKm < (current.distanceKm ?? Infinity)) {
        byType.set(facility.type, { ...facility, distanceKm });
      }
    });
    return Array.from(byType.values()).sort(
      (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
    );
  }, [visibleFacilities, selectedIncident]);
  const highlightedFacilityIds = useMemo(
    () => new Set(nearestFacilities.map((facility) => facility.id)),
    [nearestFacilities]
  );
  const defaultFacilityType = facilityTypeSuggestions[0] ?? "Hospital";
  const facilityStatusOptions = FACILITY_STATUS_OPTIONS;
  const facilityRoleLabel = isFacilityManager ? "Manage" : "View only";

  const metrics = useMemo(() => {
    const totalReports = incidents.reduce(
      (acc, incident) => acc + (incident.citizenReports ?? 0),
      0
    );
    const highSeverity = incidents.filter(
      (incident) => incident.severity === "High"
    ).length;
    const averageHazard = incidents.length
      ? incidents.reduce(
          (acc, incident) => acc + (incident.aiHazardScore ?? 0),
          0
        ) / incidents.length
      : 0;
    const deployedTeams = responders.filter((responder) =>
      ["En Route", "On Scene"].includes(responder.status)
    ).length;

    return {
      totalReports,
      highSeverity,
      averageHazard,
      deployedTeams,
    };
  }, [incidents, responders]);

  const availableResponders = useMemo(() => {
    if (!selectedIncident) return [];
    return responderMarkers
      .filter((responder) => responder.status !== "Off Duty")
      .map((responder) => ({
        ...responder,
        distanceKm: calculateDistanceKm(
          { lat: responder.lat, lng: responder.lng },
          {
            lat: selectedIncident.lat,
            lng: selectedIncident.lng,
          }
        ),
      }))
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }, [responderMarkers, selectedIncident]);

  const handleIncidentClick = (incidentId) => {
    const incident = incidents.find((inc) => inc.id === incidentId);
    if (!incident) return;
    setSelectedIncidentId(incidentId);
    if (onIncidentSelect) {
      onIncidentSelect(incident);
    }
  };

  const handleAssignResponder = (responder) => {
    if (!selectedIncident || !onAssign) return;
    triggerHaptic(HAPTIC_TOGGLE);
    onAssign(selectedIncident.id, responder);
  };

  const focusIncidentFromList = (incidentId) => {
    const incident = incidents.find((inc) => inc.id === incidentId);
    if (!incident) return;
    setSelectedIncidentId(incidentId);
    if (onIncidentSelect) {
      onIncidentSelect(incident);
    }
    if (autoFocus) {
      setMapCenter([incident.lat, incident.lng]);
    }
  };

  const wrapperClassName = isFullScreen
    ? "fixed inset-0 z-50 flex flex-col overflow-hidden bg-ui-surface px-4 py-4 sm:px-6"
    : "rounded-2xl border border-ui-border/60 bg-ui-surface p-6 shadow-lg lg:p-8";

  const mapContainerClassName = isFullScreen
    ? "relative flex-1 rounded-3xl border border-ui-border/50 bg-ui-background z-10"
    : "relative rounded-2xl border border-ui-border/70 bg-ui-background shadow-inner  z-10";

  const layoutClassName = isFullScreen
    ? "flex flex-col flex-1 gap-4"
    : "flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.9fr)_minmax(320px,1fr)] lg:items-start lg:gap-6";

  const mapViewportStyle = isFullScreen
    ? { minHeight: "100%" }
    : { minHeight: "420px", height: "60vh", maxHeight: "640px" };

  const handleToggleFacilities = () => {
    triggerHaptic();
    setShowFacilities((prev) => !prev);
  };

  const handleFacilityTypeToggle = (type) => {
    triggerHaptic();
    setFacilityVisibility((prev) => ({
      ...prev,
      [type]: !(prev?.[type] ?? true),
    }));
  };

  const handleToggleHazards = () => {
    triggerHaptic();
    setShowHazards((prev) => !prev);
  };

  const handleToggleResponders = () => {
    triggerHaptic();
    setShowResponders((prev) => !prev);
  };

  const handleToggleAutoFocus = () => {
    triggerHaptic();
    setAutoFocus((prev) => !prev);
  };

  const handleToggleFullScreen = () => {
    triggerHaptic(HAPTIC_TOGGLE);
    setIsFullScreen((prev) => !prev);
  };

  const handleStartAddFacility = () => {
    if (!isFacilityManager) return;
    triggerHaptic();
    setIsAddingFacility(true);
    setDraftFacility(null);
  };

  const handleCancelAddFacility = () => {
    setIsAddingFacility(false);
    setDraftFacility(null);
  };

  const handleFacilityLocationSelect = useCallback(
    ({ lat, lng }) => {
      if (!isFacilityManager) return;
      const safeLat = Number(lat);
      const safeLng = Number(lng);
      if (!Number.isFinite(safeLat) || !Number.isFinite(safeLng)) {
        return;
      }
      setDraftFacility({
        lat: safeLat,
        lng: safeLng,
        type: defaultFacilityType,
        status: FACILITY_STATUS_OPTIONS[0],
      });
      setIsAddingFacility(false);
    },
    [defaultFacilityType, isFacilityManager]
  );

  const handleFacilityFormSubmit = useCallback(
    (payload) => {
      if (!onFacilityAdd || !payload) return;
      const { coordinates = {} } = payload;
      const lat = Number(coordinates.lat);
      const lng = Number(coordinates.lng);
      const sanitized = {
        ...payload,
        type: payload.type?.trim() || defaultFacilityType || "Facility",
        name: payload.name?.trim() || "Unnamed site",
        address: payload.address?.trim() || "Address pending",
        hotline: payload.hotline?.trim() || "",
        status: payload.status || FACILITY_STATUS_OPTIONS[0],
        notes: payload.notes?.trim() || "",
        coordinates: {
          lat: Number.isFinite(lat) ? lat : DEFAULT_CENTER[0],
          lng: Number.isFinite(lng) ? lng : DEFAULT_CENTER[1],
        },
      };
      triggerHaptic(HAPTIC_TOGGLE);
      onFacilityAdd(sanitized);
      setIsAddingFacility(false);
      setDraftFacility(null);
    },
    [defaultFacilityType, onFacilityAdd]
  );

  const handleFacilityDelete = useCallback(
    (facility) => {
      if (!facility?.id || !onFacilityRemove) {
        return;
      }
      const confirmed =
        typeof window !== "undefined"
          ? window.confirm(`Remove ${facility.name || "facility"}?`)
          : true;
      if (!confirmed) return;
      triggerHaptic(HAPTIC_TOGGLE);
      onFacilityRemove(facility.id);
    },
    [onFacilityRemove]
  );

  const facilityFormTypeOptions = facilityTypeSuggestions;

  const focusFacility = useCallback(
    (facilityId) => {
      const target = facilityMarkers.find(
        (facility) => facility.id === facilityId
      );
      if (!target) return;
      setShowFacilities(true);
      if (target.type) {
        setFacilityVisibility((prev) => {
          if (!prev) {
            return prev;
          }
          const current = prev[target.type];
          if (current === true || current === undefined) {
            return prev;
          }
          return {
            ...prev,
            [target.type]: true,
          };
        });
      }
      setMapCenter([target.lat, target.lng]);
      setMapZoom((prev) => Math.max(prev, 14));
      setIsAddingFacility(false);
      setDraftFacility(null);
    },
    [facilityMarkers]
  );

  return (
    <div className={wrapperClassName}>
      <div className={`flex flex-col gap-6 ${isFullScreen ? "flex-1" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-ui-text">Focus Map</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-medium text-brand-primary">
                <Radar className="h-3 w-3" /> Live
              </span>
            </div>
            <p className="mt-1 text-xs text-ui-subtext">
              Unified view for rapid decisions.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="hidden text-[11px] font-semibold uppercase tracking-wide text-ui-subtext lg:inline">
              Map tools
            </span>
            <TogglePill
              active={showFacilities}
              icon={Building2}
              label="Core facilities"
              onClick={handleToggleFacilities}
            />
            <TogglePill
              active={showHazards}
              icon={Radar}
              label="Hazard rings"
              onClick={handleToggleHazards}
            />
            <TogglePill
              active={showResponders}
              icon={UsersIcon}
              label="Responders"
              onClick={handleToggleResponders}
            />
            <TogglePill
              active={autoFocus}
              icon={Crosshair}
              label="Auto focus"
              onClick={handleToggleAutoFocus}
            />
            <button
              type="button"
              onClick={handleToggleFullScreen}
              className={`group flex h-9 w-9 items-center justify-center rounded-full border border-ui-border bg-ui-background text-ui-text shadow-sm transition hover:bg-ui-background/80 lg:h-auto lg:min-h-[36px] lg:w-auto lg:justify-start lg:gap-2 lg:px-3 lg:py-1.5 ${
                isFullScreen
                  ? "border-brand-primary bg-brand-primary text-white"
                  : ""
              }`}
              aria-label={isFullScreen ? "Exit full screen map" : "Expand map"}
              title={isFullScreen ? "Exit full screen map" : "Expand map"}
            >
              {isFullScreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
              <span className="hidden text-xs font-semibold lg:inline">
                {isFullScreen ? "Collapse" : "Full screen"}
              </span>
            </button>
          </div>
        </div>

        {showFacilities && facilityMarkers.length > 0 && (
          <div className="rounded-2xl border border-ui-border/60 bg-ui-background px-3 py-2">
            <div className="mb-2 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wide text-ui-subtext">
              <span>Core Facilities</span>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] ${
                    isFacilityManager
                      ? "bg-status-low/15 text-status-low"
                      : "bg-ui-border text-ui-subtext"
                  }`}
                >
                  {facilityRoleLabel}
                </span>
                {isFacilityManager && onFacilityAdd && (
                  <button
                    type="button"
                    onClick={
                      draftFacility || isAddingFacility
                        ? handleCancelAddFacility
                        : handleStartAddFacility
                    }
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${
                      draftFacility || isAddingFacility
                        ? "border-status-high/60 text-status-high"
                        : "border-brand-primary text-brand-primary hover:bg-brand-primary/10"
                    }`}
                  >
                    {draftFacility || isAddingFacility
                      ? "Cancel add"
                      : "Add facility"}
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {facilityTypes.map((type) => {
                const meta =
                  FACILITY_TYPE_META[type] ?? FACILITY_TYPE_META.__fallback;
                return (
                  <FacilityFilterChip
                    key={type}
                    icon={meta.icon}
                    color={meta.color}
                    label={type}
                    active={facilityVisibility[type] ?? true}
                    onClick={() => handleFacilityTypeToggle(type)}
                  />
                );
              })}
            </div>
            {isFacilityManager && isAddingFacility && (
              <div className="mt-2 rounded-lg border border-dashed border-brand-primary/60 bg-brand-primary/5 px-3 py-2 text-[11px] text-brand-primary">
                Tap anywhere on the map to place the new facility pin, or select
                �Cancel add� to stop.
              </div>
            )}
            {draftFacility && (
              <div className="mt-2 rounded-lg border border-ui-border/70 bg-ui-surface/80 px-3 py-2 text-[11px] text-ui-subtext">
                Pin placed at {draftFacility.lat.toFixed(5)},{" "}
                {draftFacility.lng.toFixed(5)} � complete the details to save.
              </div>
            )}
            {nearestFacilities.length > 0 && (
              <p className="mt-2 text-[10px] text-brand-primary/80">
                Pulsing pins show the closest facility for each service relative
                to the focused incident.
              </p>
            )}
            {facilityMarkers.length > 0 && visibleFacilities.length === 0 && (
              <p className="mt-2 text-[11px] text-ui-subtext">
                No facilities match the current filters.
              </p>
            )}
          </div>
        )}

        {!isFullScreen && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <FocusStat
              icon={AlertTriangle}
              iconClassName="text-status-high"
              label="Incidents"
              value={incidents.length}
              badge={`${metrics.highSeverity} high`}
            />
            <FocusStat
              icon={SignalHigh}
              iconClassName="text-brand-primary"
              label="Signals"
              value={metrics.totalReports}
              badge="Last 30 min"
            />
            <FocusStat
              icon={Activity}
              iconClassName="text-brand-secondary"
              label="AI hazard"
              value={formatHazardScore(metrics.averageHazard)}
              badge="Confidence"
            />
            <FocusStat
              icon={UsersIcon}
              iconClassName="text-status-medium"
              label="Teams"
              value={metrics.deployedTeams}
              badge={`${responders.length} total`}
            />
          </div>
        )}

        <div className={layoutClassName}>
          <div
            className={`${mapContainerClassName} ${
              isFullScreen ? "" : "lg:min-h-[520px]"
            }`}
            style={mapViewportStyle}
          >
            {!mapIsReady ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-ui-background">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-brand-primary" />
              </div>
            ) : (
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                className={`h-full w-full ${
                  isFacilityManager && isAddingFacility
                    ? "facility-adding-cursor"
                    : ""
                }`}
                scrollWheelZoom
                zoomControl={false}
                doubleClickZoom
                dragging
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController center={mapCenter} zoom={mapZoom} />
                <ZoomControl position="topright" />
                <FacilityPane />
                <FacilityAddListener
                  enabled={isFacilityManager && isAddingFacility}
                  onLocationPick={handleFacilityLocationSelect}
                />

                {draftFacility && isFacilityManager && (
                  <Marker
                    position={[draftFacility.lat, draftFacility.lng]}
                    icon={createFacilityIcon(
                      draftFacility.type ?? defaultFacilityType,
                      draftFacility.status ?? FACILITY_STATUS_OPTIONS[0],
                      true
                    )}
                    pane="core-facilities"
                    interactive={false}
                  />
                )}

                {showFacilities &&
                  visibleFacilities.map((facility) => (
                    <Marker
                      key={facility.id}
                      position={[facility.lat, facility.lng]}
                      icon={createFacilityIcon(
                        facility.type,
                        facility.status,
                        highlightedFacilityIds.has(facility.id)
                      )}
                      pane="core-facilities"
                      zIndexOffset={0}
                    >
                      <Tooltip direction="top" offset={[0, -18]}>
                        <div className="text-xs font-semibold text-ui-text">
                          {facility.name}
                        </div>
                        <div className="text-[10px] text-ui-subtext">
                          {facility.type}
                        </div>
                      </Tooltip>
                      <Popup className="facility-popup" closeButton={false}>
                        <div className="space-y-1.5 text-sm">
                          <div className="font-semibold text-ui-text leading-tight">
                            {facility.name}
                          </div>
                          <div className="text-xs text-ui-subtext leading-snug">
                            {facility.address}
                          </div>
                          {facility.hotline && facility.dialHref && (
                            <a
                              href={facility.dialHref}
                              className="flex items-center gap-1 text-xs font-semibold text-brand-primary hover:text-brand-secondary"
                            >
                              <Phone className="h-3.5 w-3.5" strokeWidth={2} />
                              {facility.hotline}
                            </a>
                          )}
                          {facility.status && (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${getFacilityStatusBadgeClass(
                                facility.status
                              )}`}
                            >
                              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-white/60" />
                              {facility.status}
                            </span>
                          )}
                          {facility.notes && (
                            <p className="text-xs text-ui-subtext/90">
                              {facility.notes}
                            </p>
                          )}
                          {isFacilityManager && (
                            <div className="flex flex-col gap-1.5 pt-1">
                              {onFacilityUpdate && (
                                <div className="flex flex-wrap gap-1.5">
                                  {facilityStatusOptions.map((option) => (
                                    <button
                                      key={option}
                                      type="button"
                                      onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        triggerHaptic(HAPTIC_TOGGLE);
                                        onFacilityUpdate(facility.id, {
                                          status: option,
                                        });
                                      }}
                                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold transition ${
                                        facility.status === option
                                          ? "border-brand-primary bg-brand-primary text-white"
                                          : "border-ui-border text-ui-subtext hover:text-ui-text"
                                      }`}
                                      aria-pressed={facility.status === option}
                                    >
                                      {option}
                                    </button>
                                  ))}
                                </div>
                              )}
                              {onFacilityRemove && (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    handleFacilityDelete(facility);
                                  }}
                                  className="inline-flex items-center justify-center rounded-full border border-status-high/50 px-2 py-0.5 text-[10px] font-semibold text-status-high hover:bg-status-high/10"
                                >
                                  Remove facility
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                {showHazards &&
                  incidents.map((incident) => (
                    <Circle
                      key={`${incident.id}-hazard`}
                      center={[incident.lat, incident.lng]}
                      radius={(incident.impactRadiusKm ?? 0.6) * 1000}
                      pathOptions={{
                        color: getSeverityColor(incident.severity),
                        fillColor: getSeverityColor(incident.severity),
                        fillOpacity: 0.1,
                        weight: incident.id === selectedIncidentId ? 2 : 1,
                      }}
                    />
                  ))}

                {incidents.map((incident) => (
                  <Marker
                    key={incident.id}
                    position={[incident.lat, incident.lng]}
                    icon={createIncidentIcon(
                      incident.severity,
                      incident.id === selectedIncidentId
                    )}
                    eventHandlers={{
                      click: () => handleIncidentClick(incident.id),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -8]}>
                      <div className="text-xs font-semibold text-ui-text">
                        {incident.type}
                      </div>
                      <div className="text-[10px] text-ui-subtext">
                        {incident.citizenReports} citizen reports
                      </div>
                    </Tooltip>
                    <Popup className="incident-popup" closeButton={false}>
                      <div className="space-y-1 text-sm">
                        <div className="font-semibold text-ui-text">
                          {incident.type}
                        </div>
                        <div className="text-xs text-ui-subtext">
                          {incident.location}
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            focusIncidentFromList(incident.id);
                          }}
                          className="mt-2 w-full rounded-lg bg-brand-primary px-2 py-1 text-xs font-semibold text-white"
                        >
                          Focus mission
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {showResponders &&
                  responderMarkers.map((responder) => (
                    <Marker
                      key={responder.id}
                      position={[responder.lat, responder.lng]}
                      icon={createResponderIcon(responder.status)}
                    >
                      <Tooltip direction="top" offset={[0, -4]}>
                        <div className="text-xs font-semibold text-ui-text">
                          {responder.name}
                        </div>
                        <div className="text-[10px] text-ui-subtext">
                          {responder.status}
                        </div>
                      </Tooltip>
                    </Marker>
                  ))}
              </MapContainer>
            )}

            {isFacilityManager && isAddingFacility && !draftFacility && (
              <div className="pointer-events-none absolute inset-x-0 top-4 z-[1200] flex justify-center px-4">
                <span className="pointer-events-auto rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-lg">
                  Click (or tap) on the map to place a facility
                </span>
              </div>
            )}

            {draftFacility && isFacilityManager && (
              <div className="pointer-events-none absolute inset-x-0 top-4 z-[1300] flex justify-center px-4">
                <FacilityCreationForm
                  draft={draftFacility}
                  typeOptions={facilityFormTypeOptions}
                  statusOptions={facilityStatusOptions}
                  onSubmit={handleFacilityFormSubmit}
                  onCancel={handleCancelAddFacility}
                />
              </div>
            )}

            <div className="pointer-events-none absolute bottom-3 right-3 flex flex-col items-end gap-2 text-[10px] font-medium text-ui-subtext/90">
              <LegendDot color="bg-red-500" label="High" />
              <LegendDot color="bg-orange-500" label="Medium" />
              <LegendDot color="bg-blue-500" label="Low" />
              {showHazards && (
                <LegendDot
                  color="bg-brand-primary/20 border border-brand-primary"
                  label="Hazard"
                />
              )}
              {showFacilities &&
                facilityTypes.map((type) => {
                  const meta =
                    FACILITY_TYPE_META[type] ?? FACILITY_TYPE_META.__fallback;
                  return (
                    <LegendDot
                      key={`facility-${type}`}
                      label={type}
                      style={{ backgroundColor: meta.color }}
                    />
                  );
                })}
              {showFacilities && nearestFacilities.length > 0 && (
                <LegendDot
                  label="Nearest highlight"
                  style={{
                    backgroundColor: "#ffffff",
                    boxShadow: "0 0 0 2px rgba(34, 197, 94, 0.45)",
                  }}
                />
              )}
            </div>

            {isFullScreen && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 px-3 pb-3">
                <div className="pointer-events-auto max-h-[60vh] space-y-3 overflow-y-auto rounded-2xl bg-ui-surface/95 p-3 shadow-2xl backdrop-blur-md">
                  <FocusIncidentCard
                    incident={selectedIncident}
                    availableResponders={availableResponders}
                    onAssign={handleAssignResponder}
                    nearestFacilities={nearestFacilities}
                    onFacilityFocus={focusFacility}
                    variant="sheet"
                  />
                  {sortedIncidents.length > 1 && (
                    <IncidentQueue
                      incidents={sortedIncidents}
                      selectedId={selectedIncidentId}
                      onSelect={focusIncidentFromList}
                      variant="sheet"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {!isFullScreen && (
            <aside className="space-y-4 lg:sticky lg:top-24">
              <FocusIncidentCard
                incident={selectedIncident}
                availableResponders={availableResponders}
                onAssign={handleAssignResponder}
                nearestFacilities={nearestFacilities}
                onFacilityFocus={focusFacility}
              />

              {sortedIncidents.length > 1 && (
                <IncidentQueue
                  incidents={sortedIncidents}
                  selectedId={selectedIncidentId}
                  onSelect={focusIncidentFromList}
                />
              )}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function TogglePill({ active, icon: Icon, label, onClick }) {
  const stateClass = active
    ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
    : "border-ui-border bg-ui-background text-ui-subtext hover:text-ui-text";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center justify-center rounded-full border transition ${stateClass} h-9 w-9 lg:h-auto lg:min-h-[36px] lg:w-auto lg:justify-start lg:gap-2 lg:px-3 lg:py-1.5`}
      aria-pressed={active}
      aria-label={label}
      title={label}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden text-xs font-semibold lg:inline">{label}</span>
    </button>
  );
}
function FacilityAddListener({ enabled, onLocationPick }) {
  useMapEvents({
    click(event) {
      if (!enabled || !onLocationPick) return;
      onLocationPick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

function FacilityCreationForm({
  draft,
  typeOptions = [],
  statusOptions = [],
  onSubmit,
  onCancel,
}) {
  if (!draft) return null;

  const mergedTypeOptions = useMemo(() => {
    if (typeOptions.length) {
      return typeOptions;
    }
    return ["Hospital", "Police Station", "Fire Station", "Evacuation Center"];
  }, [typeOptions]);
  const mergedStatusOptions = useMemo(() => {
    return statusOptions.length ? statusOptions : FACILITY_STATUS_OPTIONS;
  }, [statusOptions]);

  const [formData, setFormData] = useState(() => ({
    type: draft.type ?? mergedTypeOptions[0] ?? "Hospital",
    name: "",
    address: "",
    hotline: "",
    status: draft.status ?? mergedStatusOptions[0] ?? "Open",
    notes: "",
  }));

  useEffect(() => {
    setFormData({
      type: draft.type ?? mergedTypeOptions[0] ?? "Hospital",
      name: "",
      address: "",
      hotline: "",
      status: draft.status ?? mergedStatusOptions[0] ?? "Open",
      notes: "",
    });
  }, [draft, mergedTypeOptions, mergedStatusOptions]);

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!onSubmit) return;
    onSubmit({
      ...formData,
      coordinates: { lat: draft.lat, lng: draft.lng },
    });
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-ui-border bg-ui-surface/95 p-4 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ui-text">
            Add core facility
          </h3>
          <p className="text-[11px] text-ui-subtext">
            Lat {draft.lat.toFixed(5)}, Lng {draft.lng.toFixed(5)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-full border border-ui-border px-2 py-0.5 text-[10px] font-semibold text-ui-subtext hover:text-status-high"
        >
          Cancel
        </button>
      </div>
      <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-ui-subtext">
            Facility type
          </label>
          <input
            list="facility-type-options"
            value={formData.type}
            onChange={handleChange("type")}
            placeholder="Hospital"
            className="w-full rounded-lg border border-ui-border bg-ui-background px-3 py-2 text-sm text-ui-text"
            required
          />
          <datalist id="facility-type-options">
            {mergedTypeOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>
        <div className="grid gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-ui-subtext">
            Name
          </label>
          <input
            value={formData.name}
            onChange={handleChange("name")}
            placeholder="Facility name"
            className="w-full rounded-lg border border-ui-border bg-ui-background px-3 py-2 text-sm text-ui-text"
            required
          />
        </div>
        <div className="grid gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-ui-subtext">
            Address / Landmark
          </label>
          <input
            value={formData.address}
            onChange={handleChange("address")}
            placeholder="Street, barangay, nearby marker"
            className="w-full rounded-lg border border-ui-border bg-ui-background px-3 py-2 text-sm text-ui-text"
            required
          />
        </div>
        <div className="grid gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-ui-subtext">
            Hotline
          </label>
          <input
            value={formData.hotline}
            onChange={handleChange("hotline")}
            placeholder="+63 900 000 0000"
            className="w-full rounded-lg border border-ui-border bg-ui-background px-3 py-2 text-sm text-ui-text"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-ui-subtext">
            Status
          </label>
          <select
            value={formData.status}
            onChange={handleChange("status")}
            className="w-full rounded-lg border border-ui-border bg-ui-background px-3 py-2 text-sm text-ui-text"
          >
            {mergedStatusOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-ui-subtext">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={handleChange("notes")}
            rows={3}
            className="w-full rounded-lg border border-ui-border bg-ui-background px-3 py-2 text-sm text-ui-text"
            placeholder="Optional context (capacity, supplies, etc.)"
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-ui-border px-3 py-1.5 text-sm font-semibold text-ui-subtext hover:text-status-high"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-brand-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-secondary"
          >
            Save facility
          </button>
        </div>
      </form>
    </div>
  );
}

function FacilityFilterChip({ icon: Icon, color, label, active, onClick }) {
  const baseClasses =
    "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition";
  const stateClasses = active
    ? "text-white shadow-sm"
    : "bg-ui-background text-ui-subtext hover:text-ui-text";
  const style = active
    ? { backgroundColor: color, borderColor: color }
    : { borderColor: color, color };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${stateClasses}`}
      style={style}
      aria-pressed={active}
    >
      {Icon && (
        <Icon
          className="h-3.5 w-3.5"
          strokeWidth={2}
          style={{ color: active ? "#ffffff" : color }}
        />
      )}
      <span className="leading-none">{label}</span>
    </button>
  );
}

function LegendDot({ color = "", label, style, icon = null }) {
  const outline = color.includes("border");
  const classes = [
    "inline-flex h-2.5 w-2.5 items-center justify-center rounded-full",
  ];
  if (color) {
    classes.push(color);
  }
  return (
    <span className="flex items-center gap-1">
      <span className={classes.join(" ").trim()} style={style}>
        {icon ? (
          icon
        ) : outline ? (
          <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
        ) : null}
      </span>
      {label}
    </span>
  );
}

function FocusStat({ icon: Icon, iconClassName = "", label, value, badge }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-ui-border bg-ui-background px-3 py-2">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg bg-ui-border/40 ${iconClassName}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-wide text-ui-subtext">
          {label}
        </span>
        <span className="text-sm font-semibold text-ui-text">{value}</span>
        <span className="text-[10px] font-medium text-ui-subtext/80">
          {badge}
        </span>
      </div>
    </div>
  );
}

function FocusIncidentCard({
  incident,
  availableResponders,
  onAssign,
  nearestFacilities = [],
  onFacilityFocus,
  variant = "default",
}) {
  const baseClass =
    variant === "sheet"
      ? "space-y-3 rounded-2xl border border-ui-border/60 bg-ui-surface/95 p-3 shadow-md"
      : "space-y-4 rounded-2xl border border-ui-border bg-ui-background p-4";

  if (!incident) {
    return (
      <div className={baseClass + " text-center text-sm text-ui-subtext"}>
        All clear. No active incidents selected.
      </div>
    );
  }

  return (
    <div className={baseClass}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-ui-text">
            {incident.type}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-ui-subtext">
            <MapPinIcon className="h-4 w-4 text-brand-primary" />
            <span className="truncate">{incident.location}</span>
          </div>
        </div>
        <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
          {incident.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium">
        <MiniBadge
          icon={SignalHigh}
          value={`${incident.citizenReports}`}
          label="Reports"
        />
        <MiniBadge
          icon={Activity}
          value={formatHazardScore(incident.aiHazardScore)}
          label={`${incident.riskBand} risk`}
          accent={getRiskColor(incident.riskBand)}
        />
        <MiniBadge
          icon={Target}
          value={`${incident.impactRadiusKm.toFixed(1)} km`}
          label="Radius"
        />
      </div>

      {incident.aiSummary && (
        <div className="rounded-xl bg-ui-surface p-3 text-sm text-ui-text/90">
          {incident.aiSummary}
        </div>
      )}

      {incident.recommendedAction && (
        <div className="rounded-xl border border-ui-border/60 bg-ui-surface/80 p-3 text-sm text-ui-text/90">
          {incident.recommendedAction}
        </div>
      )}

      {nearestFacilities.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ui-subtext">
            Nearest critical sites
          </p>
          <div className="space-y-1.5">
            {nearestFacilities.map((facility) => {
              const meta =
                FACILITY_TYPE_META[facility.type] ??
                FACILITY_TYPE_META.__fallback;
              return (
                <div
                  key={facility.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-ui-border bg-white/90 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: meta.color }}
                      />
                      <p className="truncate text-sm font-semibold text-ui-text">
                        {facility.name}
                      </p>
                    </div>
                    <p className="text-xs text-ui-subtext">
                      {facility.type}
                      {facility.distanceKm != null && (
                        <>
                          {" - "}
                          {formatDistanceKm(facility.distanceKm)}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {facility.status && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getFacilityStatusBadgeClass(
                          facility.status
                        )}`}
                      >
                        {facility.status}
                      </span>
                    )}
                    <div className="flex gap-1">
                      {facility.dialHref && (
                        <a
                          href={facility.dialHref}
                          className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-semibold text-brand-primary hover:bg-brand-primary hover:text-white"
                        >
                          <Phone className="h-3 w-3" strokeWidth={2} />
                          Call
                        </a>
                      )}
                      {onFacilityFocus && (
                        <button
                          type="button"
                          onClick={() => onFacilityFocus(facility.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-ui-border px-2 py-0.5 text-[10px] font-semibold text-ui-subtext hover:text-brand-primary"
                        >
                          Focus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {availableResponders.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ui-subtext">
            Nearby teams
          </p>
          <div className="space-y-2">
            {availableResponders.slice(0, 4).map((responder) => (
              <div
                key={responder.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-ui-border bg-white/80 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ui-text">
                    {responder.name}
                  </p>
                  <p className="text-xs text-ui-subtext">
                    {responder.status} ·{" "}
                    {formatDistanceKm(responder.distanceKm)}
                    {responder.etaMinutes != null &&
                      ` · ${responder.etaMinutes} min`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onAssign(responder)}
                  className="rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-white shadow"
                >
                  Assign
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniBadge({ icon: Icon, value, label, accent }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-ui-border bg-white/80 px-2 py-2">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full ${
          accent ? "text-white" : "text-brand-primary"
        }`}
        style={accent ? { backgroundColor: accent } : undefined}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-sm font-semibold text-ui-text">{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-ui-subtext">
        {label}
      </span>
    </div>
  );
}

function IncidentQueue({
  incidents,
  selectedId,
  onSelect,
  variant = "default",
}) {
  const baseClass =
    variant === "sheet"
      ? "space-y-2 rounded-2xl border border-ui-border/60 bg-ui-surface/95 p-3 shadow-md"
      : "space-y-2 rounded-2xl border border-ui-border bg-ui-background p-4";

  return (
    <div className={baseClass}>
      <div className="mb-2 flex items-center justify-between text-xs text-ui-subtext">
        <span className="font-semibold uppercase tracking-wide">Queue</span>
        <span>{incidents.length} active</span>
      </div>
      <div className="space-y-2">
        {incidents.slice(0, 6).map((incident) => (
          <button
            key={incident.id}
            type="button"
            onClick={() => onSelect(incident.id)}
            className={`w-full rounded-xl border px-3 py-2 text-left shadow-sm transition ${
              incident.id === selectedId
                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                : "border-ui-border bg-white/90 text-ui-text"
            }`}
          >
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="truncate">{incident.type}</span>
              <span className="text-xs text-ui-subtext">{incident.time}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-ui-subtext">
              <span className="truncate">{incident.location}</span>
              <span>{incident.citizenReports} reports</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
