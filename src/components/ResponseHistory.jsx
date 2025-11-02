import { useEffect, useMemo, useState } from "react";
import { useIncidentContext } from "../context/IncidentContext";
import { XMarkIcon } from "@heroicons/react/24/outline";
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
  List as ListIcon,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
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

const severityPriority = {
  High: 3,
  Medium: 2,
  Low: 1,
};

const severityAccentClasses = {
  High: { dot: "bg-status-high", text: "text-status-high" },
  Medium: { dot: "bg-status-medium", text: "text-status-medium" },
  Low: { dot: "bg-brand-primary", text: "text-brand-primary" },
  default: { dot: "bg-ui-border", text: "text-ui-subtext" },
};

function getSeverityAccent(severity) {
  return severityAccentClasses[severity] ?? severityAccentClasses.default;
}

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
  const { history, incidents, openIncidentDetail } = useIncidentContext();
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
  const [activeView, setActiveView] = useState("list");
  const [activeRecord, setActiveRecord] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showIncidentListDialog, setShowIncidentListDialog] = useState(false);
  const [selectedDayIncidents, setSelectedDayIncidents] = useState([]);

  const historySource = useMemo(() => {
    if (!history.length) return [];
    return [...history].sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0;
      const bTime = b.date ? new Date(b.date).getTime() : 0;
      return bTime - aTime;
    });
  }, [history]);

  const incidentLookup = useMemo(() => {
    const map = new Map();
    incidents.forEach((incident) => {
      if (incident?.id) {
        map.set(incident.id, incident);
      }
    });
    return map;
  }, [incidents]);

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

      if (
        !matchesType ||
        !matchesSeverity ||
        !matchesOutcome ||
        !matchesSearch
      ) {
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

  const daySummaries = useMemo(() => {
    const map = new Map();
    groupedByDay.forEach((records, day) => {
      let topSeverity = null;
      let topRank = -1;
      let resolvedCount = 0;
      let cancelledCount = 0;
      let hazardTotal = 0;
      let hazardCount = 0;

      records.forEach((record) => {
        const rank = severityPriority[record.severity] ?? -1;
        if (rank > topRank) {
          topRank = rank;
          topSeverity = record.severity ?? null;
        }

        if (record.outcome === "Resolved") resolvedCount += 1;
        if (record.outcome === "Cancelled") cancelledCount += 1;

        if (Number.isFinite(record.aiHazardScore)) {
          hazardTotal += record.aiHazardScore;
          hazardCount += 1;
        }
      });

      const averageHazard = hazardCount
        ? Math.round((hazardTotal / hazardCount) * 100)
        : null;
      const followUpCount = Math.max(
        records.length - resolvedCount - cancelledCount,
        0
      );

      map.set(day, {
        total: records.length,
        topSeverity,
        resolvedCount,
        followUpCount,
        averageHazard,
      });
    });
    return map;
  }, [groupedByDay]);

  const orderedDays = useMemo(() => {
    return Array.from(groupedByDay.keys()).sort(
      (a, b) => new Date(b) - new Date(a)
    );
  }, [groupedByDay]);

  useEffect(() => {
    if (orderedDays.length === 0) {
      setSelectedDate(null);
      setExpandedId(null);
      return;
    }
    setSelectedDate((prev) =>
      prev && orderedDays.includes(prev) ? prev : orderedDays[0]
    );
    setExpandedId(null);
  }, [orderedDays]);

  const handleAddNote = (recordId, note) => {
    if (!note.trim()) return;
    setQuickNotes((prev) => ({
      ...prev,
      [recordId]: [note.trim(), ...(prev[recordId] ?? [])],
    }));
  };

  const handleViewRecord = (record) => {
    if (!record) return;
    const incidentId = record.incidentId ?? record.id;
    if (incidentLookup.has(incidentId)) {
      openIncidentDetail(incidentId, "summary");
      return;
    }
    setActiveRecord(record);
  };

  const handleDayClick = (dateKey, records) => {
    if (!records || records.length === 0) return;
    
    if (records.length === 1) {
      // Single incident - open detail directly
      handleViewRecord(records[0]);
    } else {
      // Multiple incidents - show list dialog
      setSelectedDate(dateKey);
      setSelectedDayIncidents(records);
      setShowIncidentListDialog(true);
    }
  };

  useEffect(() => {
    setExpandedId(null);
  }, [activeView, selectedDate]);

  const dayRecords = selectedDate ? groupedByDay.get(selectedDate) ?? [] : [];

  const renderListView = () => {
    if (!filteredHistory.length) {
      return (
        <div className="rounded-2xl bg-ui-surface p-6 text-center text-sm text-ui-subtext shadow">
          No incidents match the current filters.
        </div>
      );
    }

    return (
      <section className="rounded-2xl bg-ui-surface p-4 shadow space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-ui-subtext">
          <ListIcon className="h-4 w-4" />
          <span>All records</span>
          <span className="ml-auto text-[11px] font-medium text-ui-subtext">
            {filteredHistory.length} record
            {filteredHistory.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="space-y-3">
          {filteredHistory.map((record) => (
            <CompactHistoryCard
              key={record.id}
              record={record}
              expanded={expandedId === record.id}
              onToggle={() =>
                setExpandedId((prev) => (prev === record.id ? null : record.id))
              }
              quickNotes={quickNotes[record.id] ?? []}
              onAddNote={(note) => handleAddNote(record.id, note)}
              onViewIncident={() => handleViewRecord(record)}
            />
          ))}
        </div>
      </section>
    );
  };

  const renderCalendarView = () => {
    if (!orderedDays.length) {
      return (
        <div className="rounded-2xl bg-ui-surface p-6 text-center text-sm text-ui-subtext shadow">
          No incidents match the current filters.
        </div>
      );
    }

    // Generate calendar grid for current month
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get day of week for first day (0 = Sunday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Total days in month
    const daysInMonth = lastDay.getDate();
    
    // Build calendar grid
    const calendarDays = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().split('T')[0];
      const dayRecords = groupedByDay.get(dateKey) || [];
      const summary = daySummaries.get(dateKey);
      
      calendarDays.push({
        date,
        dateKey,
        day,
        records: dayRecords,
        summary,
      });
    }
    
    const monthName = currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <section className="rounded-2xl bg-ui-surface p-3 sm:p-5 shadow space-y-4 sm:space-y-5">
        {/* Month Navigation */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-primary" />
            <div>
              <h3 className="text-base sm:text-xl font-bold text-ui-text">{monthName}</h3>
              <p className="text-[10px] sm:text-xs text-ui-subtext">Click a day to view incidents</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
              className="rounded-lg border border-ui-border bg-white p-2 sm:p-2.5 text-ui-text transition hover:bg-brand-primary hover:text-white hover:border-brand-primary shadow-sm"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-brand-primary bg-brand-primary px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-primary/90 shadow-sm"
            >
              <Clock className="h-3.5 w-3.5" />
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
              className="rounded-lg border border-ui-border bg-white p-2 sm:p-2.5 text-ui-text transition hover:bg-brand-primary hover:text-white hover:border-brand-primary shadow-sm"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-ui-border bg-gradient-to-b from-white to-gray-50/50 shadow-sm">
          {/* Week day headers */}
          <div className="grid grid-cols-7 border-b-2 border-ui-border bg-gradient-to-b from-gray-50 to-white">
            {weekDays.map((day) => (
              <div
                key={day}
                className="border-r border-ui-border/50 px-2 py-3 sm:py-4 text-center text-[11px] sm:text-sm font-bold uppercase tracking-wider text-ui-subtext last:border-r-0"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 1)}</span>
              </div>
            ))}
          </div>

          {/* Calendar days grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((dayData, index) => {
              if (!dayData) {
                // Empty cell for days before month starts
                return (
                  <div
                    key={`empty-${index}`}
                    className="aspect-square sm:aspect-auto border-b border-r border-ui-border/30 bg-gray-50/50 last:border-r-0"
                    style={{ minHeight: '70px' }}
                  />
                );
              }

              const { date, dateKey, day, records, summary } = dayData;
              const isToday = dateKey === new Date().toISOString().split('T')[0];
              const hasRecords = records.length > 0;
              const severityAccent = hasRecords ? getSeverityAccent(summary?.topSeverity) : null;

              return (
                <button
                  key={dateKey}
                  onClick={() => hasRecords && handleDayClick(dateKey, records)}
                  disabled={!hasRecords}
                  className={`group relative aspect-square sm:aspect-auto border-b border-r border-ui-border/30 p-1.5 sm:p-3 text-left transition-all duration-200 last:border-r-0 ${
                    hasRecords 
                      ? 'cursor-pointer hover:bg-brand-primary/5 hover:border-brand-primary/30 hover:shadow-sm active:scale-95' 
                      : 'cursor-default bg-white'
                  } ${isToday ? 'bg-blue-50/50 ring-1 ring-inset ring-blue-200' : 'bg-white'}`}
                  style={{ minHeight: '70px' }}
                >
                  {/* Day number */}
                  <div className="flex items-start justify-between mb-1">
                    <span
                      className={`inline-flex items-center justify-center text-xs sm:text-sm font-semibold transition-all ${
                        isToday
                          ? 'h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-brand-primary text-white shadow-md'
                          : hasRecords
                          ? 'text-ui-text group-hover:text-brand-primary'
                          : 'text-ui-subtext/50'
                      }`}
                    >
                      {day}
                    </span>
                  </div>

                  {/* Incident badge - clean and minimal */}
                  {hasRecords && summary && (
                    <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2">
                      <div 
                        className={`relative inline-flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-full font-bold text-[10px] sm:text-xs text-white shadow-lg transition-all duration-200 group-hover:scale-110 ${
                          summary.topSeverity === 'High' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                          summary.topSeverity === 'Medium' ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                          'bg-gradient-to-br from-blue-500 to-blue-600'
                        }`}
                      >
                        {records.length}
                        {records.length > 1 && (
                          <div className="absolute -top-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-white border border-gray-200 animate-pulse" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Hover tooltip */}
                  {hasRecords && (
                    <div className="absolute inset-x-0 bottom-full mb-2 hidden group-hover:block z-10 pointer-events-none">
                      <div className="bg-gray-900 text-white text-[10px] sm:text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap mx-auto w-fit">
                        {records.length} incident{records.length !== 1 ? 's' : ''} · {summary?.topSeverity || 'Unknown'}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-ui-subtext">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-sm" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 shadow-sm" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm" />
            <span>Low</span>
          </div>
        </div>
      </section>
    );
  };

  return (
    <>
      <div className="space-y-4 pb-16">
        <section className="rounded-2xl bg-ui-surface p-4 shadow space-y-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-brand-primary" />
            <h2 className="text-xl font-semibold text-ui-text">
              Response History
            </h2>
          </div>
          <p className="text-sm text-ui-subtext">
            Review closed and reassigned incidents with the same labels used
            across the dashboard.
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
                      setFilters((prev) => ({
                        ...prev,
                        timeframe: timeframe.id,
                      }))
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
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, type: value }))
              }
            />
            <SelectFilter
              label="Severity"
              value={filters.severity}
              options={severityOptions}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, severity: value }))
              }
            />
            <SelectFilter
              label="Outcome"
              value={filters.outcome}
              options={outcomeOptions}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, outcome: value }))
              }
            />
          </div>
        </section>

        <div className="flex rounded-2xl border border-ui-border bg-ui-background p-1">
          <button
            type="button"
            onClick={() => setActiveView("list")}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              activeView === "list"
                ? "bg-brand-primary text-white shadow-sm"
                : "text-ui-subtext hover:text-ui-text"
            }`}
          >
            <span className="inline-flex items-center justify-center gap-2">
              <ListIcon className="h-4 w-4" />
              List View
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView("calendar")}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              activeView === "calendar"
                ? "bg-brand-primary text-white shadow-sm"
                : "text-ui-subtext hover:text-ui-text"
            }`}
          >
            <span className="inline-flex items-center justify-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Calendar View
            </span>
          </button>
        </div>

        {activeView === "list" ? renderListView() : renderCalendarView()}
      </div>

      {/* Incident List Dialog for multiple incidents */}
      {showIncidentListDialog && (
        <IncidentListDialog
          date={selectedDate}
          incidents={selectedDayIncidents}
          onClose={() => {
            setShowIncidentListDialog(false);
            setSelectedDayIncidents([]);
          }}
          onSelectIncident={(record) => {
            setShowIncidentListDialog(false);
            handleViewRecord(record);
          }}
        />
      )}

      {/* Single Incident Detail Dialog */}
      {activeRecord && (
        <HistoryDetailModal
          record={activeRecord}
          onClose={() => setActiveRecord(null)}
        />
      )}
    </>
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
  const riskClasses = riskBand
    ? getChipClasses(riskBandStyles, riskBand)
    : null;

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
    metricChips.push({
      label: "Dispatch",
      value: `${metrics.dispatchMinutes} min`,
    });
  }
  if (Number.isFinite(metrics?.onSceneMinutes)) {
    metricChips.push({
      label: "On scene",
      value: `${metrics.onSceneMinutes} min`,
    });
  }
  if (Number.isFinite(metrics?.resolutionMinutes)) {
    metricChips.push({
      label: "Resolution",
      value: `${metrics.resolutionMinutes} min`,
    });
  }

  const [draftNote, setDraftNote] = useState("");

  const handleCardToggle = () => {
    if (onToggle) onToggle();
  };

  const handleKeyDown = (event) => {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardToggle();
    }
  };

  const incidentLabel = incidentId ?? id;
  const summaryId = `history-details-${id}`;

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition ${
        expanded
          ? "border-brand-primary/60 shadow-md ring-2 ring-brand-primary/20"
          : "border-ui-border"
      }`}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-controls={summaryId}
      onClick={handleCardToggle}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-primary">
            <span>{incidentLabel}</span>
            {decisionType && (
              <DetailChip
                icon={BadgeCheck}
                label={decisionType}
                toneClass="border border-brand-primary bg-white text-brand-primary"
                dense
              />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-ui-subtext">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{barangay ?? "Location pending"}</span>
            </span>
            <span className="text-ui-border">&bull;</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{closedTime}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {type && (
              <DetailChip
                icon={Activity}
                label={type}
                toneClass="bg-brand-primary/10 text-brand-primary"
              />
            )}
            {severity && (
              <DetailChip
                icon={Shield}
                label={severity}
                toneClass={severityClasses}
              />
            )}
            {outcome && (
              <DetailChip
                icon={BadgeCheck}
                label={outcome}
                toneClass={outcomeClasses}
              />
            )}
            {riskBand && (
              <DetailChip
                icon={Radio}
                label={`${riskBand} risk`}
                toneClass={riskClasses ?? "bg-ui-background text-ui-subtext"}
              />
            )}
          </div>
        </div>
        {onViewIncident && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (onViewIncident) {
                onViewIncident();
              }
            }}
            className="relative z-10 inline-flex items-center gap-1 rounded-lg border border-brand-primary px-3 py-1 text-xs font-semibold text-brand-primary transition hover:bg-brand-primary/10"
          >
            Open
          </button>
        )}
      </div>

      <p
        className={`mt-2 text-sm leading-snug text-ui-text/90 ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {aiSummary ?? "AI summary not available for this record."}
      </p>

      {expanded && (
        <div id={summaryId} className="mt-4 space-y-4 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <InfoTile
              icon={Clock}
              label="Decision logged"
              value={closedStamp}
            />
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
              <InfoTile
                icon={BadgeCheck}
                label="Decision"
                value={decisionType}
              />
            )}
          </div>

          {(hazardDisplay !== "-" || citizenDisplay !== "-" || riskBand) && (
            <div className="grid gap-2 sm:grid-cols-3">
              {hazardDisplay !== "-" && (
                <InfoTile
                  icon={Activity}
                  label="AI hazard"
                  value={hazardDisplay}
                />
              )}
              {citizenDisplay !== "-" && (
                <InfoTile
                  icon={Radio}
                  label="Citizen reports"
                  value={citizenDisplay}
                />
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
                  <MetricPill
                    key={`${id}-${metric.label}`}
                    label={metric.label}
                    value={metric.value}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1 rounded-xl border border-ui-border bg-white/80 p-3 text-xs text-ui-text/90">
            <p className="font-semibold uppercase tracking-wide text-ui-subtext">
              After-action notes
            </p>
            <p>
              <span className="font-semibold">Worked:</span>{" "}
              {afterAction.worked}
            </p>
            <p>
              <span className="font-semibold">Improve:</span>{" "}
              {afterAction.improve}
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
              <span className="font-semibold text-ui-text">Command note:</span>{" "}
              {notes}
            </div>
          )}

          {mediaItems.length > 0 && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-ui-text">
                <Paperclip className="h-4 w-4" /> Attachments
              </div>
              <div className="flex flex-wrap gap-2 text-brand-primary">
                {mediaItems.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-brand-primary/10 px-3 py-1"
                  >
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
                onClick={(event) => event.stopPropagation()}
                rows={2}
                placeholder="Log what stood out..."
                className="w-full rounded-xl border border-ui-border bg-ui-background px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onAddNote(draftNote);
                    setDraftNote("");
                  }}
                  className="flex-1 rounded-lg bg-brand-primary px-3 py-2 text-sm font-semibold text-white"
                >
                  Save note
                </button>
                {onViewIncident && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (onViewIncident) {
                        onViewIncident();
                      }
                    }}
                    className="rounded-lg border border-ui-border px-3 py-2 text-sm font-semibold text-ui-text"
                  >
                    Full view
                  </button>
                )}
              </div>
            </div>
            {quickNotes.length > 0 && (
              <ul className="space-y-2 text-sm text-ui-text/90">
                {quickNotes.map((note, index) => (
                  <li
                    key={`${id}-note-${index}`}
                    className="rounded-lg bg-white px-3 py-2 shadow-sm"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-ui-border bg-ui-background p-3 text-sm">
      <Icon className="mt-0.5 h-4 w-4 text-brand-primary" />
      <div>
        <p className="text-xs uppercase tracking-wide text-ui-subtext">
          {label}
        </p>
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

function DetailChip({ icon: Icon, label, toneClass, dense = false }) {
  if (!Icon || !label) return null;
  const visualClass = toneClass ?? "bg-ui-background text-ui-text";
  const paddingClass = dense ? "px-2 py-0.5" : "px-2.5 py-0.5";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full text-[11px] font-semibold ${paddingClass} ${visualClass}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function HistoryDetailModal({ record, onClose }) {
  if (!record) return null;
  const severityChip = getChipClasses(severityStyles, record.severity);
  const outcomeChip = getChipClasses(outcomeStyles, record.outcome);
  const riskChip = record.riskBand
    ? getChipClasses(riskBandStyles, record.riskBand)
    : null;
  const hazardDisplay = formatPercent(record.aiHazardScore);
  const citizenDisplay = numberOrDash(record.citizenReports);
  const closedStamp = formatFullTimestamp(record.date);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-ui-surface p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-ui-border pb-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className={`rounded-full px-3 py-1 ${severityChip}`}>
                {record.severity ?? "Unknown"}
              </span>
              <span className={`rounded-full px-3 py-1 ${outcomeChip}`}>
                {record.outcome ?? "Outcome"}
              </span>
              {riskChip && (
                <span className={`rounded-full px-3 py-1 ${riskChip}`}>
                  {record.riskBand}
                </span>
              )}
            </div>
            <h2 className="text-xl font-semibold text-ui-text">
              {record.type ?? "Incident"} ·{" "}
              {record.barangay ?? "Unknown location"}
            </h2>
            <p className="text-xs text-ui-subtext">{closedStamp}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-ui-background p-2 text-ui-subtext transition hover:text-ui-text"
            aria-label="Close history detail"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </header>

        <section className="space-y-4 pt-4 text-sm text-ui-text/90">
          <div className="rounded-2xl border border-ui-border bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-ui-subtext">
              AI summary
            </p>
            <p className="mt-2 leading-relaxed">
              {record.aiSummary ?? "AI summary not recorded for this incident."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile icon={Activity} label="AI hazard" value={hazardDisplay} />
            <InfoTile
              icon={Radio}
              label="Citizen reports"
              value={citizenDisplay}
            />
            <InfoTile
              icon={Users}
              label="Lead responder"
              value={record.assignedResponder ?? "Unassigned"}
            />
            <InfoTile
              icon={Clock}
              label="Decision logged"
              value={closedStamp}
            />
          </div>

          {record.metrics && (
            <div className="space-y-2 rounded-2xl border border-ui-border bg-ui-background p-4">
              <p className="text-xs uppercase tracking-wide text-ui-subtext">
                Timing insights
              </p>
              <div className="flex flex-wrap gap-2">
                {Number.isFinite(record.metrics?.dispatchMinutes) && (
                  <MetricPill
                    label="Dispatch"
                    value={`${record.metrics.dispatchMinutes} min`}
                  />
                )}
                {Number.isFinite(record.metrics?.onSceneMinutes) && (
                  <MetricPill
                    label="On scene"
                    value={`${record.metrics.onSceneMinutes} min`}
                  />
                )}
                {Number.isFinite(record.metrics?.resolutionMinutes) && (
                  <MetricPill
                    label="Resolution"
                    value={`${record.metrics.resolutionMinutes} min`}
                  />
                )}
              </div>
            </div>
          )}

          {record.aar && (
            <div className="space-y-2 rounded-2xl border border-ui-border bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-ui-subtext">
                After-action notes
              </p>
              <p>
                <span className="font-semibold">Worked:</span>{" "}
                {record.aar.worked ?? "Not captured."}
              </p>
              <p>
                <span className="font-semibold">Improve:</span>{" "}
                {record.aar.improve ?? "Not captured."}
              </p>
              <p>
                <span className="font-semibold">Actions:</span>{" "}
                {Array.isArray(record.aar.actions) && record.aar.actions.length
                  ? record.aar.actions.join(", ")
                  : "No follow-up actions logged."}
              </p>
            </div>
          )}

          {Array.isArray(record.supportUnits) &&
            record.supportUnits.length > 0 && (
              <div className="space-y-2 rounded-2xl border border-ui-border bg-ui-background p-4">
                <p className="text-xs uppercase tracking-wide text-ui-subtext">
                  Support units
                </p>
                <div className="flex flex-wrap gap-2">
                  {record.supportUnits.map((unit) => (
                    <span
                      key={`${record.id}-unit-${unit}`}
                      className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-ui-text"
                    >
                      {unit}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {record.notes && (
            <div className="rounded-2xl border border-ui-border bg-ui-background p-4 text-sm">
              <p className="text-xs uppercase tracking-wide text-ui-subtext">
                Command note
              </p>
              <p className="mt-2 text-ui-text/90">{record.notes}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function IncidentListDialog({ date, incidents, onClose, onSelectIncident }) {
  if (!incidents || incidents.length === 0) return null;

  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-ui-border bg-gradient-to-b from-white to-gray-50/50 p-5 backdrop-blur-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-brand-primary" />
              <h2 className="text-lg font-bold text-ui-text">{formattedDate}</h2>
            </div>
            <p className="text-sm text-ui-subtext">
              {incidents.length} incident{incidents.length !== 1 ? 's' : ''} reported
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-ui-background p-2 text-ui-subtext transition hover:bg-ui-border hover:text-ui-text"
            aria-label="Close incident list"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </header>

        {/* Incident List */}
        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(85vh - 100px)' }}>
          <div className="space-y-3">
            {incidents.map((incident) => {
              const severityClasses = getChipClasses(severityStyles, incident.severity);
              const outcomeClasses = getChipClasses(outcomeStyles, incident.outcome);
              const timeLabel = formatTimeLabel(incident.date);
              
              return (
                <button
                  key={incident.id}
                  onClick={() => onSelectIncident(incident)}
                  className="group w-full rounded-2xl border border-ui-border bg-white p-4 text-left shadow-sm transition-all hover:border-brand-primary hover:shadow-md active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      {/* Incident ID and badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-brand-primary">
                          {incident.id}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${severityClasses}`}>
                          {incident.severity}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${outcomeClasses}`}>
                          {incident.outcome}
                        </span>
                      </div>

                      {/* Type and Location */}
                      <div className="flex items-center gap-2 text-sm">
                        <Activity className="h-4 w-4 text-ui-subtext" />
                        <span className="font-semibold text-ui-text">{incident.type}</span>
                        <span className="text-ui-subtext">·</span>
                        <MapPin className="h-3.5 w-3.5 text-ui-subtext" />
                        <span className="text-ui-subtext">{incident.barangay}</span>
                      </div>

                      {/* AI Summary */}
                      <p className="line-clamp-2 text-sm text-ui-text/80">
                        {incident.aiSummary ?? "No summary available."}
                      </p>

                      {/* Time and Responder */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-ui-subtext">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {timeLabel}
                        </span>
                        {incident.assignedResponder && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {incident.assignedResponder}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <div className="flex items-center">
                      <ChevronRight className="h-5 w-5 text-ui-subtext transition-transform group-hover:translate-x-1 group-hover:text-brand-primary" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
