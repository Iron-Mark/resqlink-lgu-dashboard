import { useMemo, useState } from "react";
import {
  ClipboardCheck,
  CalendarDays,
  ShieldAlert,
  Route,
  BellRing,
  MapPin,
} from "lucide-react";
import Responders, { defaultResponders } from "./Responders";

const shiftTemplates = [
  {
    id: "shift-1",
    label: "Day Shift",
    window: "06:00 - 14:00",
    leads: ["Team Alpha", "Team Delta"],
  },
  {
    id: "shift-2",
    label: "Swing Shift",
    window: "14:00 - 22:00",
    leads: ["Team Bravo"],
  },
  {
    id: "shift-3",
    label: "Night Shift",
    window: "22:00 - 06:00",
    leads: ["Team Echo"],
  },
];

const missionQueue = [
  {
    id: "INC-207",
    title: "Flash flood assist",
    location: "Brgy. Malanday",
    severity: "High",
    eta: "8 min",
    requested: ["Team Alpha", "Team Charlie"],
  },
  {
    id: "INC-212",
    title: "Transformer fire",
    location: "Brgy. Santolan",
    severity: "Medium",
    eta: "12 min",
    requested: ["Team Bravo"],
  },
];

const safetySignals = {
  checkIns: [
    { id: "R-003", label: "Team Charlie", due: "Overdue 3 min" },
    { id: "R-002", label: "Team Bravo", due: "Due in 6 min" },
  ],
  mayday: [
    {
      id: "alert-11",
      label: "Auto SOS",
      details: "Bravo triggered panic from ladder truck",
      time: "Today 14:22",
    },
  ],
  trails: [
    {
      id: "trail-1",
      team: "Team Delta",
      lastPoints: ["Command Post", "Brgy. San Roque footbridge"],
    },
  ],
};

export default function Management() {
  const [directory, setDirectory] = useState(defaultResponders);
  const [agencyFilter, setAgencyFilter] = useState("All");
  const [skillFilter, setSkillFilter] = useState("All");
  const [search, setSearch] = useState("");

  const agencies = useMemo(
    () => ["All", ...new Set(defaultResponders.map((responder) => responder.agency))],
    []
  );

  const skills = useMemo(() => {
    const allSkills = new Set();
    defaultResponders.forEach((responder) => {
      responder.specialization.forEach((skill) => allSkills.add(skill));
    });
    return ["All", ...allSkills];
  }, []);

  const filteredResponders = useMemo(() => {
    return directory.filter((responder) => {
      const matchesAgency = agencyFilter === "All" || responder.agency === agencyFilter;
      const matchesSkill =
        skillFilter === "All" || responder.specialization.includes(skillFilter);
      const matchesSearch =
        !search.trim() ||
        responder.name.toLowerCase().includes(search.toLowerCase()) ||
        responder.location.toLowerCase().includes(search.toLowerCase());
      return matchesAgency && matchesSkill && matchesSearch;
    });
  }, [directory, agencyFilter, skillFilter, search]);

  const handleStatusChange = (responderId, newStatus) => {
    setDirectory((prev) =>
      prev.map((responder) =>
        responder.id === responderId ? { ...responder, status: newStatus, lastActive: "Just now" } : responder
      )
    );
  };

  return (
    <div className="space-y-6 pb-16">
      <section className="rounded-2xl bg-ui-surface p-4 shadow space-y-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-brand-primary" />
          <h2 className="text-xl font-semibold text-ui-text">Assignment Command</h2>
        </div>
        <p className="text-sm text-ui-subtext">
          Align responders, manage shifts, and monitor safety in one place. Filters apply live to the directory below.
        </p>

        <div className="flex flex-col gap-3">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search responders or barangays"
            className="w-full rounded-xl border border-ui-border bg-ui-background px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            {agencies.map((agency) => (
              <button
                key={agency}
                onClick={() => setAgencyFilter(agency)}
                className={`rounded-full px-3 py-1 text-sm transition ${
                  agencyFilter === agency
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "bg-ui-background text-ui-subtext"
                }`}
              >
                {agency}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <button
                key={skill}
                onClick={() => setSkillFilter(skill)}
                className={`rounded-full px-3 py-1 text-sm transition ${
                  skillFilter === skill
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "bg-ui-background text-ui-subtext"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </section>

      <Responders responders={filteredResponders} onStatusChange={handleStatusChange} />

      <section className="rounded-2xl bg-ui-surface p-4 shadow space-y-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-brand-primary" />
          <h3 className="text-lg font-semibold text-ui-text">Active Missions</h3>
        </div>
        <div className="space-y-3">
          {missionQueue.map((mission) => (
            <div
              key={mission.id}
              className="rounded-xl border border-ui-border bg-ui-background p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ui-text">{mission.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-ui-subtext">
                    <MapPin className="h-3.5 w-3.5" /> {mission.location}
                  </div>
                </div>
                <span className="rounded-full bg-status-medium/10 px-2 py-0.5 text-xs font-semibold text-status-medium">
                  {mission.severity}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-ui-subtext">
                <span>ETA {mission.eta}</span>
                <span>Requested: {mission.requested.join(", ")}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 rounded-lg bg-brand-primary py-2 text-sm font-semibold text-white">
                  Assign Team
                </button>
                <button className="flex-1 rounded-lg bg-ui-background py-2 text-sm font-semibold text-ui-text">
                  View Map
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-ui-surface p-4 shadow space-y-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-brand-primary" />
          <h3 className="text-lg font-semibold text-ui-text">Shift & Duty Planner</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {shiftTemplates.map((shift) => (
            <div key={shift.id} className="rounded-xl border border-ui-border bg-ui-background p-3">
              <p className="text-sm font-semibold text-ui-text">{shift.label}</p>
              <p className="text-xs text-ui-subtext">{shift.window}</p>
              <div className="mt-2 space-y-1 text-xs text-ui-subtext">
                {shift.leads.map((lead) => (
                  <p key={lead}>• {lead}</p>
                ))}
              </div>
              <button className="mt-3 w-full rounded-lg bg-brand-primary/10 py-2 text-xs font-semibold text-brand-primary">
                Manage roster
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-ui-surface p-4 shadow space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-brand-primary" />
          <h3 className="text-lg font-semibold text-ui-text">Safety Monitor</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-ui-border bg-ui-background p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-ui-text">
              <BellRing className="h-4 w-4" /> Scheduled Check-ins
            </div>
            <ul className="mt-2 space-y-1 text-xs text-ui-subtext">
              {safetySignals.checkIns.map((item) => (
                <li key={item.id}>{item.label} — {item.due}</li>
              ))}
            </ul>
            <button className="mt-3 w-full rounded-lg bg-brand-primary/10 py-2 text-xs font-semibold text-brand-primary">
              Ping teams
            </button>
          </div>
          <div className="rounded-xl border border-ui-border bg-ui-background p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-ui-text">
              <ShieldAlert className="h-4 w-4" /> Panic / Mayday
            </div>
            <ul className="mt-2 space-y-1 text-xs text-status-high">
              {safetySignals.mayday.map((item) => (
                <li key={item.id}>{item.details} — {item.time}</li>
              ))}
            </ul>
            <button className="mt-3 w-full rounded-lg bg-status-high/10 py-2 text-xs font-semibold text-status-high">
              Review incident
            </button>
          </div>
          <div className="rounded-xl border border-ui-border bg-ui-background p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-ui-text">
              <Route className="h-4 w-4" /> Last-known Trails
            </div>
            <ul className="mt-2 space-y-1 text-xs text-ui-subtext">
              {safetySignals.trails.map((trail) => (
                <li key={trail.id}>
                  <span className="font-semibold text-ui-text">{trail.team}</span>
                  <span className="block">Path: {trail.lastPoints.join(" → ")}</span>
                </li>
              ))}
            </ul>
            <button className="mt-3 w-full rounded-lg bg-brand-primary/10 py-2 text-xs font-semibold text-brand-primary">
              Open timeline
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
