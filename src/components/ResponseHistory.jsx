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
} from "lucide-react";

const historyRecords = [
  {
    id: "INC-173",
    type: "Flood",
    severity: "High",
    outcome: "Resolved",
    date: "2025-09-20T08:45:00Z",
    barangay: "Brgy. Malanday",
    assignedResponder: "Miguel Santos",
    peopleAssisted: 48,
    media: ["river-rising.jpg", "evac-route.mp4"],
    aiSummary:
      "Swift evacuation executed before waters breached first-floor homes. Temporary shelter established at Barangay Gym within 20 minutes.",
    aar: {
      worked: "Advance warning from sensors allowed pre-positioning of rescue boats.",
      improve: "Need higher-wattage lighting for night operations.",
      actions: ["Coordinate with engineering for drainage clearing", "Replenish PPE stock"],
    },
  },
  {
    id: "INC-162",
    type: "Fire",
    severity: "Medium",
    outcome: "Contained",
    date: "2025-09-18T19:12:00Z",
    barangay: "Brgy. Concepcion",
    assignedResponder: "Leah Ramirez",
    peopleAssisted: 12,
    media: ["warehouse-fire.jpg"],
    aiSummary:
      "Localized warehouse fire isolated to eastern bay. Foam deployment prevented spread to adjacent LPG storage.",
    aar: {
      worked: "Rapid hydrant connection and clear division of interior vs. exterior teams.",
      improve: "Update mutual-aid call list for after-hours shifts.",
      actions: ["Audit hydrant pressure quarterly"],
    },
  },
  {
    id: "INC-151",
    type: "Medical",
    severity: "Low",
    outcome: "Closed",
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
  },
];

const timeframes = [
  { id: "24h", label: "Last 24h" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "all", label: "All" },
];

const incidentTypes = ["All", "Flood", "Fire", "Medical", "Earthquake", "Rescue"];
const severities = ["All", "Low", "Medium", "High"];
const outcomes = ["All", "Resolved", "Contained", "Closed", "Escalated"];

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
  const historySource = history.length ? history : historyRecords;

  const filteredHistory = useMemo(() => {
    return historySource.filter((record) => {
      const matchesType = filters.type === "All" || record.type === filters.type;
      const matchesSeverity = filters.severity === "All" || record.severity === filters.severity;
      const matchesOutcome = filters.outcome === "All" || record.outcome === filters.outcome;
      const matchesSearch =
        !filters.search.trim() ||
        record.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        record.barangay.toLowerCase().includes(filters.search.toLowerCase()) ||
        (record.assignedResponder ?? "").toLowerCase().includes(filters.search.toLowerCase());

      if (!matchesType || !matchesSeverity || !matchesOutcome || !matchesSearch) {
        return false;
      }

      if (filters.timeframe === "all") return true;
      const now = new Date();
      const created = new Date(record.date);
      const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
      if (filters.timeframe === "24h") return diffHours <= 24;
      if (filters.timeframe === "7d") return diffHours <= 24 * 7;
      if (filters.timeframe === "30d") return diffHours <= 24 * 30;
      return true;
    });
  }, [filters, historySource]);

  const groupedByDay = useMemo(() => {
    const groups = new Map();
    filteredHistory.forEach((record) => {
      const key = new Date(record.date).toISOString().split("T")[0];
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
          Flip through cleared missions, organised by day for quick review.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="search"
            placeholder="Search incident, barangay, or team"
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            className="w-full rounded-xl border border-ui-border bg-ui-background px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-2 text-xs text-ui-subtext">
            <Filter className="h-4 w-4" />
            <div className="flex flex-wrap gap-2">
              {timeframes.map((timeframe) => (
                <button
                  key={timeframe.id}
                  onClick={() => setFilters((prev) => ({ ...prev, timeframe: timeframe.id }))}
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
            options={incidentTypes}
            onChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
          />
          <SelectFilter
            label="Severity"
            value={filters.severity}
            options={severities}
            onChange={(value) => setFilters((prev) => ({ ...prev, severity: value }))}
          />
          <SelectFilter
            label="Outcome"
            value={filters.outcome}
            options={outcomes}
            onChange={(value) => setFilters((prev) => ({ ...prev, outcome: value }))}
          />
        </div>
      </section>

      {orderedDays.length > 0 ? (
        <section className="rounded-2xl bg-ui-surface p-4 shadow space-y-4">
          <div className="flex items-center justify-between text-xs text-ui-subtext">
            <span className="font-semibold uppercase tracking-wide">Calendar view</span>
            <span>{orderedDays.length} day{orderedDays.length > 1 ? "s" : ""}</span>
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
                onToggle={() => setExpandedId((prev) => (prev === record.id ? null : record.id))}
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
          No incidents match the current filters.
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
        className="rounded-xl border border-ui-border bg-ui-background px-3 py-2 text-sm text-ui-text"
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

function CompactHistoryCard({ record, expanded, onToggle, quickNotes, onAddNote, onViewIncident }) {
  const [draftNote, setDraftNote] = useState("");
  const closedTime = new Date(record.date).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const incidentRef = record.incidentId ?? record.id;
  const mediaItems = Array.isArray(record.media) ? record.media : [];
  const afterAction = record.aar ?? { worked: "Not documented", improve: "Not documented", actions: [] };
  const actionItems = Array.isArray(afterAction.actions) ? afterAction.actions : [];

  return (
    <div className="rounded-2xl border border-ui-border bg-ui-background p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center justify-between text-left"
        >
          <div>
            <p className="text-sm font-semibold text-ui-text">{record.id}</p>
            <p className="text-xs text-ui-subtext">
              {record.barangay} - {closedTime}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 font-semibold text-brand-primary">
              {record.type}
            </span>
            <span className="rounded-full bg-status-medium/10 px-2 py-0.5 font-semibold text-status-medium">
              {record.severity}
            </span>
            <span className="rounded-full bg-status-resolved/10 px-2 py-0.5 font-semibold text-status-resolved">
              {record.outcome}
            </span>
          </div>
        </button>
        {onViewIncident && incidentRef && (
          <button
            type="button"
            onClick={() => onViewIncident(incidentRef)}
            className="rounded-lg border border-brand-primary px-3 py-1 text-xs font-semibold text-brand-primary transition hover:bg-brand-primary/10"
          >
            View
          </button>
        )}
      </div>

      <p className={`mt-2 text-xs leading-snug text-ui-text/90 ${expanded ? "" : "line-clamp-3"}`}>
        {record.aiSummary ?? "AI summary not available for this record."}
      </p>

      {expanded && (
        <div className="mt-3 space-y-3 text-sm">
          <div className="grid gap-2 sm:grid-cols-3">
            <InfoTile icon={Clock} label="Closed" value={new Date(record.date).toLocaleString()} />
            <InfoTile icon={Users} label="Assigned" value={record.assignedResponder ?? "Unassigned"} />
            <InfoTile icon={FileText} label="People assisted" value={record.peopleAssisted ?? "--"} />
          </div>

          <div className="space-y-1 rounded-xl border border-ui-border bg-white/80 p-3 text-xs text-ui-text/90">
            <p className="font-semibold uppercase tracking-wide text-ui-subtext">After-action notes</p>
            <p>
              <span className="font-semibold">Worked:</span> {afterAction.worked}
            </p>
            <p>
              <span className="font-semibold">Improve:</span> {afterAction.improve}
            </p>
            <p>
              <span className="font-semibold">Actions:</span> {actionItems.length ? actionItems.join(", ") : "Nothing recorded"}
            </p>
          </div>

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
                  <li key={`${record.id}-note-${index}`} className="rounded-lg bg-white px-3 py-2 shadow-sm">
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
      <Icon className="h-4 w-4 text-brand-primary" />
      <div>
        <p className="text-xs uppercase tracking-wide text-ui-subtext">{label}</p>
        <p className="font-semibold text-ui-text">{value}</p>
      </div>
    </div>
  );
}











