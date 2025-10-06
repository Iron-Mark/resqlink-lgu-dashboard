import { useEffect, useMemo, useState } from "react";
import { useIncidentContext } from "../context/IncidentContext";
import {
  CalendarDays,
  Filter,
  Clock,
  Users,
  FileText,
  Paperclip,
  PenSquare,
  Activity,
  Radio,
  Shield,
  MapPin,
  BadgeCheck,
  Timer,
} from "lucide-react";

const timeframes = [
  { id: "24h", label: "Last 24h" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "all", label: "All" },
];

const severityStyles = {
  High: { bg: "bg-status-high/10", text: "text-status-high" },
  Medium: { bg: "bg-status-medium/10", text: "text-status-medium" },
  Low: { bg: "bg-brand-primary/10", text: "text-brand-primary" },
  default: { bg: "bg-ui-background", text: "text-ui-subtext" },
};

const outcomeStyles = {
  Assigned: { bg: "bg-brand-primary/10", text: "text-brand-primary" },
  Resolved: { bg: "bg-status-resolved/10", text: "text-status-resolved" },
  Contained: { bg: "bg-status-medium/10", text: "text-status-medium" },
  Cancelled: { bg: "bg-status-high/10", text: "text-status-high" },
  Closed: { bg: "bg-ui-background", text: "text-ui-text" },
  Escalated: { bg: "bg-status-high/10", text: "text-status-high" },
  default: { bg: "bg-ui-background", text: "text-ui-subtext" },
};

const riskBandStyles = {
  Red: { bg: "bg-red-100", text: "text-red-600" },
  Amber: { bg: "bg-amber-100", text: "text-amber-600" },
  Blue: { bg: "bg-blue-100", text: "text-blue-600" },
  default: { bg: "bg-ui-background", text: "text-ui-subtext" },
};

function getChipClasses(styleMap, key) {
  const style = styleMap[key] ?? styleMap.default;
  return `${style.bg} ${style.text}`;
}

function formatTimeLabel(isoString) {
  if (!isoString) return "Not logged";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "Not logged";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatFullTimestamp(isoString) {
  if (!isoString) return "Not logged";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "Not logged";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "—";
  return `${Math.round(value * 100)}%`;
}

function numberOrDash(value) {
  if (!Number.isFinite(value)) return "—";
  return `${value}`;
}

export default function ResponseHistory() {
  const { history, openIncidentDetail } = useIncidentContext();
  const [filters, setFilters] = useState({
    timeframe: "7d",
    type: "All",
    severity: "All",
    outcome: "All",
    search: "",
  });
  const [quickNotes, setQuickNotes] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const historySource = useMemo(() => {
    if (!history.length) return [];
    return [...history].sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0;
      const bTime = b.date ? new Date(b.date).getTime() : 0;
      return bTime - aTime;
    });
  }, [history]);

  const typeOptions = useMemo(() => {
    const values = new Set();
    historySource.forEach((record) => {
      if (record.type) values.add(record.type);
    });
    return ["All", ...Array.from(values).sort()];
  }, [historySource]);

  const severityOptions = useMemo(() => {
    const values = new Set();
    historySource.forEach((record) => {
      if (record.severity) values.add(record.severity);
    });
    return ["All", ...Array.from(values).sort()];
  }, [historySource]);

  const outcomeOptions = useMemo(() => {
    const values = new Set();
    historySource.forEach((record) => {
      if (record.outcome) values.add(record.outcome);
    });
    return ["All", ...Array.from(values).sort()];
  }, [historySource]);

  useEffect(() => {
    setFilters((prev) => {
      const nextType = typeOptions.includes(prev.type) ? prev.type : "All";
      const nextSeverity = severityOptions.includes(prev.severity)
        ? prev.severity
        : "All";
      const nextOutcome = outcomeOptions.includes(prev.outcome)
        ? prev.outcome
        : "All";
      if (
        nextType === prev.type &&
        nextSeverity === prev.severity &&
        nextOutcome === prev.outcome
      ) {
        return prev;
      }
      return {
        ...prev,
        type: nextType,
        severity: nextSeverity,
        outcome: nextOutcome,
      };
    });
  }, [typeOptions, severityOptions, outcomeOptions]);

  const filteredHistory = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return historySource.filter((record) => {
      const matchesType =
        filters.type === "All" || record.type === filters.type;
      const matchesSeverity =
        filters.severity === "All" || record.severity === filters.severity;
      const matchesOutcome =
        filters.outcome === "All" || record.outcome === filters.outcome;
      const matchesSearch =
        !query ||
        (record.id && record.id.toLowerCase().includes(query)) ||
        (record.barangay && record.barangay.toLowerCase().includes(query)) ||
        (record.assignedResponder &&
          record.assignedResponder.toLowerCase().includes(query));

      if (!matchesType || !matchesSeverity || !matchesOutcome || !matchesSearch) {
        return false;
      }

      if (filters.timeframe === "all") return true;
      if (!record.date) return false;
      const created = new Date(record.date);
      if (Number.isNaN(created.getTime())) return false;
      const diffHours = (Date.now() - created.getTime()) / (1000 * 60 * 60);
      if (filters.timeframe === "24h") return diffHours <= 24;
      if (filters.timeframe === "7d") return diffHours <= 24 * 7;
      if (filters.timeframe === "30d") return diffHours <= 24 * 30;
      return true;
    });
  }, [filters, historySource]);

  const groupedByDay = useMemo(() => {
    const groups = new Map();
    filteredHistory.forEach((record) => {
      if (!record.date) return;
      const date = new Date(record.date);
      if (Number.isNaN(date.getTime())) return;
      const key = date.toISOString().split("T")[0];
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(record);
    });
    return groups;
  }, [filteredHistory]);

  const orderedDays = useMemo(() => {
    return Array.from(groupedByDay.keys()).sort((a, b) => new Date(b) - new Date(a));
  }, [groupedByDay]);

  useEffect(() => {
    if (orderedDays.length === 0) {
      setSelectedDate(null);
      setExpandedId(null);
      return;
    }
    setSelectedDate((prev) => (prev && orderedDays.includes(prev) ? prev : orderedDays[0]));
    setExpandedId(null);
  }, [orderedDays]);

  const handleAddNote = (recordId, note) => {
    if (!note.trim()) return;
    setQuickNotes((prev) => ({
      ...prev,
      [recordId]: [note.trim(), ...(prev[recordId] ?? [])],
    }));
  };

  const dayRecords = selectedDate ? groupedByDay.get(selectedDate) ?? [] : [];

  return (
    <div className="space-y-4 pb-16">
      <section className="rounded-2xl bg-ui-surface p-4 shadow space-y-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-brand-primary" />
          <h2 className="text-xl font-semibold text-ui-text">Response History</h2>
        </div>
        <p className="text-sm text-ui-subtext">
          Review closed and reassigned incidents with the same labels used across the dashboard.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="search"
            placeholder="Search incident, barangay, or responder"
            value={filters.search}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, search: event.target.value }))
            }
            className="w-full rounded-xl border border-ui-border bg-ui-background px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-2 text-xs text-ui-subtext">
            <Filter className="h-4 w-4" />
            <div className="flex flex-wrap gap-2">
              {timeframes.map((timeframe) => (
                <button
                  key={timeframe.id}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, timeframe: timeframe.id }))
                  }
                  className={`rounded-full px-3 py-1 text-sm transition ${
                    filters.timeframe === timeframe.id
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "bg-ui-background text-ui-subtext"
                  }`}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <SelectFilter
            label="Type"
            value={filters.type}
            options={typeOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
          />
          <SelectFilter
            label="Severity"
            value={filters.severity}
            options={severityOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, severity: value }))}
          />
          <SelectFilter
            label="Outcome"
            value={filters.outcome}
            options={outcomeOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, outcome: value }))}
          />
        </div>
      </section>

      {orderedDays.length > 0 ? (
        <section className="rounded-2xl bg-ui-surface p-4 shadow space-y-4">
          <div className="flex items-center justify-between text-xs text-ui-subtext">
            <span className="font-semibold uppercase tracking-wide">Calendar view</span>
            <span>{orderedDays.length} day{orderedDays.length === 1 ? "" : "s"}</span>
          </div>
          <div className="-mx-4 overflow-x-auto px-4">
            <div className="flex gap-2 pb-2">
              {orderedDays.map((day) => {
                const date = new Date(day);
                const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
                const dayNum = date.getDate();
                const month = date.toLocaleDateString(undefined, { month: "short" });
                const count = groupedByDay.get(day)?.length ?? 0;
                const isActive = selectedDate === day;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`min-w-[72px] flex-1 rounded-2xl border px-2 py-2 text-center transition ${
                      isActive
                        ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                        : "border-ui-border bg-ui-background text-ui-text"
                    }`}
                  >
                    <div className="text-xs uppercase tracking-wide">{weekday}</div>
                    <div className="text-lg font-semibold">{dayNum}</div>
                    <div className="text-[10px] text-ui-subtext">{month}</div>
                    <div className="mt-1 text-[10px] font-medium">{count} record{count !== 1 ? "s" : ""}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {dayRecords.map((record) => (
              <CompactHistoryCard
                key={record.id}
                record={record}
                expanded={expandedId === record.id}
                onToggle={() =>
                  setExpandedId((prev) => (prev === record.id ? null : record.id))
                }
                quickNotes={quickNotes[record.id] ?? []}
                onAddNote={(note) => handleAddNote(record.id, note)}
                onViewIncident={
                  openIncidentDetail
                    ? () => openIncidentDetail(record.incidentId ?? record.id)
                    : undefined
                }
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="rounded-2xl bg-ui-surface p-6 text-center text-sm text-ui-subtext shadow">
          {historySource.length === 0
            ? "No resolved or reassigned incidents yet. They will appear here once logged."
            : "No incidents match the current filters."}
        </div>
      )}
    </div>
  );
}

function SelectFilter({ label, value, options, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-ui-subtext">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-ui-border bg-ui-background px-3 py-2 text-sm text-ui-text"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CompactHistoryCard({
  record,
  expanded,
  onToggle,
  quickNotes,
  onAddNote,
  onViewIncident,
}) {
  const {
    id,
    incidentId,
    type,
    severity,
    outcome,
    decisionType,
    barangay,
    date,
    aiSummary,
    assignedResponder,
    peopleAssisted,
    media = [],
    citizenReports,
    aiHazardScore,
    riskBand,
    metrics,
    supportUnits = [],
    notes,
    aar = {},
  } = record;

  const closedTime = formatTimeLabel(date);
  const closedStamp = formatFullTimestamp(date);
  const hazardDisplay = formatPercent(aiHazardScore);
  const citizenDisplay = numberOrDash(citizenReports);
  const severityClasses = getChipClasses(severityStyles, severity);
  const outcomeClasses = getChipClasses(outcomeStyles, outcome);
  const riskClasses = riskBand ? getChipClasses(riskBandStyles, riskBand) : null;

  const afterAction = {
    worked: aar.worked ?? "Field notes not captured.",
    improve: aar.improve ?? "Improvement items pending.",
    actions: Array.isArray(aar.actions) ? aar.actions : [],
  };
  const mediumActions = afterAction.actions.length
    ? afterAction.actions.join(", ")
    : "Nothing recorded";
  const mediaItems = media.filter(Boolean);

  const metricChips = [];
  if (Number.isFinite(metrics?.dispatchMinutes)) {
    metricChips.push({ label: "Dispatch", value: `${metrics.dispatchMinutes} min` });
  }
  if (Number.isFinite(metrics?.onSceneMinutes)) {
    metricChips.push({ label: "On scene", value: `${metrics.onSceneMinutes} min` });
  }
  if (Number.isFinite(metrics?.resolutionMinutes)) {
    metricChips.push({ label: "Resolution", value: `${metrics.resolutionMinutes} min` });
  }

  const [draftNote, setDraftNote] = useState("");

  return (
    <div className="rounded-2xl border border-ui-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 flex-col text-left"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-primary">
            <span>{incidentId ?? id}</span>
            {decisionType && (
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-primary px-2 py-0.5 text-[11px] font-semibold text-brand-primary">
                <BadgeCheck className="h-3 w-3" />
                {decisionType}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-ui-subtext">
            <MapPin className="h-3.5 w-3.5" />
            <span>{barangay ?? "Location pending"}</span>
            <span className="text-ui-border">•</span>
            <span>{closedTime}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 font-semibold text-brand-primary">
              {type}
            </span>
            <span className={`rounded-full px-2 py-0.5 font-semibold ${severityClasses}`}>
              {severity ?? "Unknown"}
            </span>
            <span className={`rounded-full px-2 py-0.5 font-semibold ${outcomeClasses}`}>
              {outcome ?? "—"}
            </span>
            {riskClasses && (
              <span className={`rounded-full px-2 py-0.5 font-semibold ${riskClasses}`}>
                {riskBand}
              </span>
            )}
          </div>
        </button>
        {onViewIncident && (
          <button
            type="button"
            onClick={onViewIncident}
            className="rounded-lg border border-brand-primary px-3 py-1 text-xs font-semibold text-brand-primary transition hover:bg-brand-primary/10"
          >
            View
          </button>
        )}
      </div>

      <p className={`mt-2 text-xs leading-snug text-ui-text/90 ${expanded ? "" : "line-clamp-3"}`}>
        {aiSummary ?? "AI summary not available for this record."}
      </p>

      {expanded && (
        <div className="mt-3 space-y-3 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <InfoTile icon={Clock} label="Decision logged" value={closedStamp} />
            <InfoTile
              icon={Users}
              label="Lead responder"
              value={assignedResponder ?? "Unassigned"}
            />
            <InfoTile
              icon={FileText}
              label="People assisted"
              value={numberOrDash(peopleAssisted)}
            />
            {decisionType && (
              <InfoTile icon={BadgeCheck} label="Decision" value={decisionType} />
            )}
          </div>

          {(hazardDisplay !== "—" || citizenDisplay !== "—" || riskBand) && (
            <div className="grid gap-2 sm:grid-cols-3">
              {hazardDisplay !== "—" && (
                <InfoTile icon={Activity} label="AI hazard" value={hazardDisplay} />
              )}
              {citizenDisplay !== "—" && (
                <InfoTile icon={Radio} label="Citizen reports" value={citizenDisplay} />
              )}
              {riskBand && (
                <InfoTile icon={Shield} label="Risk band" value={riskBand} />
              )}
            </div>
          )}

          {metricChips.length > 0 && (
            <div className="space-y-2 rounded-xl border border-ui-border bg-white/80 p-3 text-xs text-ui-text/90">
              <div className="flex items-center gap-2 font-semibold text-ui-text">
                <Timer className="h-4 w-4" /> Timing insights
              </div>
              <div className="flex flex-wrap gap-2">
                {metricChips.map((metric) => (
                  <MetricPill key={`${id}-${metric.label}`} label={metric.label} value={metric.value} />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1 rounded-xl border border-ui-border bg-white/80 p-3 text-xs text-ui-text/90">
            <p className="font-semibold uppercase tracking-wide text-ui-subtext">After-action notes</p>
            <p>
              <span className="font-semibold">Worked:</span> {afterAction.worked}
            </p>
            <p>
              <span className="font-semibold">Improve:</span> {afterAction.improve}
            </p>
            <p>
              <span className="font-semibold">Actions:</span> {mediumActions}
            </p>
          </div>

          {supportUnits.length > 0 && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-ui-text">
                <Users className="h-4 w-4" /> Support units
              </div>
              <div className="flex flex-wrap gap-1.5">
                {supportUnits.map((unit) => (
                  <span
                    key={`${id}-${unit}`}
                    className="rounded-full bg-ui-background px-3 py-1 text-[11px] font-medium text-ui-text"
                  >
                    {unit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {notes && (
            <div className="rounded-xl bg-ui-background px-3 py-2 text-xs text-ui-text/90">
              <span className="font-semibold text-ui-text">Command note:</span> {notes}
            </div>
          )}

          {mediaItems.length > 0 && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-ui-text">
                <Paperclip className="h-4 w-4" /> Attachments
              </div>
              <div className="flex flex-wrap gap-2 text-brand-primary">
                {mediaItems.map((item) => (
                  <span key={item} className="rounded-full bg-brand-primary/10 px-3 py-1">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-ui-text">
              <PenSquare className="h-4 w-4" /> Quick notes
            </div>
            <div className="space-y-2">
              <textarea
                value={draftNote}
                onChange={(event) => setDraftNote(event.target.value)}
                rows={2}
                placeholder="Log what stood out..."
                className="w-full rounded-xl border border-ui-border bg-ui-background px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  onAddNote(draftNote);
                  setDraftNote("");
                }}
                className="w-full rounded-lg bg-brand-primary px-3 py-2 text-sm font-semibold text-white"
              >
                Save note
              </button>
            </div>
            {quickNotes.length > 0 && (
              <ul className="space-y-2 text-sm text-ui-text/90">
                {quickNotes.map((note, index) => (
                  <li key={`${id}-note-${index}`} className="rounded-lg bg-white px-3 py-2 shadow-sm">
                    {note}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-ui-border bg-ui-background p-3 text-sm">
      <Icon className="mt-0.5 h-4 w-4 text-brand-primary" />
      <div>
        <p className="text-xs uppercase tracking-wide text-ui-subtext">{label}</p>
        <p className="font-semibold text-ui-text">{value}</p>
      </div>
    </div>
  );
}

function MetricPill({ label, value }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-3 py-1 text-[11px] font-semibold text-brand-primary">
      {label}
      <span className="font-bold text-brand-primary/80">{value}</span>
    </span>
  );
}

