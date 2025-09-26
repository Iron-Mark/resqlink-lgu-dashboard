import { useMemo, useState } from "react";
import {
  ClipboardCheck,
  CalendarDays,
  ShieldAlert,
  Route,
  BellRing,
  MapPin,
  PlusCircle,
  Users,
} from "lucide-react";
import Responders from "./Responders";
import ResponderForm from "./ResponderForm";
import { useIncidentContext } from "../context/IncidentContext";

const TABS = {
  DIRECTORY: { id: "directory", label: "Directory", icon: Users },
  MISSIONS: { id: "missions", label: "Missions", icon: ShieldAlert },
  SHIFTS: { id: "shifts", label: "Shifts", icon: CalendarDays },
  SAFETY: { id: "safety", label: "Safety", icon: BellRing },
};

const shiftTemplates = [
  {
    id: "shift-1",
    label: "Day Shift",
    window: "06:00 - 14:00",
    leads: ["Miguel Santos", "Amina Cruz"],
  },
  {
    id: "shift-2",
    label: "Swing Shift",
    window: "14:00 - 22:00",
    leads: ["Leah Ramirez"],
  },
  {
    id: "shift-3",
    label: "Night Shift",
    window: "22:00 - 06:00",
    leads: ["Noel Garcia"],
  },
];

const missionQueue = [
  {
    id: "INC-207",
    title: "Flash flood assist",
    location: "Brgy. Malanday",
    severity: "High",
    eta: "8 min",
    requested: ["Miguel Santos", "Paolo Fernandez"],
  },
  {
    id: "INC-212",
    title: "Transformer fire",
    location: "Brgy. Santolan",
    severity: "Medium",
    eta: "12 min",
    requested: ["Leah Ramirez"],
  },
];

const safetySignals = {
  checkIns: [
    { id: "R-003", label: "Paolo Fernandez", due: "Overdue 3 min" },
    { id: "R-002", label: "Leah Ramirez", due: "Due in 6 min" },
  ],
  mayday: [
    {
      id: "alert-11",
      label: "Auto SOS",
      details: "Ramirez triggered panic from ladder truck",
      time: "Today 14:22",
    },
  ],
  trails: [
    {
      id: "trail-1",
      team: "Amina Cruz",
      lastPoints: ["Command Post", "Brgy. San Roque footbridge"],
    },
  ],
};

const TabButton = ({ tab, activeTab, onClick }) => {
  const isActive = tab.id === activeTab;
  return (
    <button
      onClick={() => onClick(tab.id)}
      className={`flex flex-col items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors w-full ${
        isActive
          ? "bg-brand-primary/10 text-brand-primary"
          : "text-ui-subtext hover:bg-ui-fill"
      }`}
    >
      <tab.icon className="h-5 w-5" />
      <span>{tab.label}</span>
    </button>
  );
};

export default function Management() {
  const {
    responders,
    updateResponderStatus,
    addResponder,
    updateResponder,
    deleteResponder,
  } = useIncidentContext();
  const [agencyFilter, setAgencyFilter] = useState("All");
  const [skillFilter, setSkillFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedResponder, setSelectedResponder] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.DIRECTORY.id);

  const agencies = useMemo(
    () => ["All", ...new Set(responders.map((responder) => responder.agency))],
    [responders]
  );

  const skills = useMemo(() => {
    const allSkills = new Set();
    responders.forEach((responder) => {
      (responder.specialization || []).forEach((skill) => allSkills.add(skill));
    });
    return ["All", ...allSkills];
  }, [responders]);

  const filteredResponders = useMemo(() => {
    return responders.filter((responder) => {
      const matchesAgency =
        agencyFilter === "All" || responder.agency === agencyFilter;
      const matchesSkill =
        skillFilter === "All" ||
        (responder.specialization || []).includes(skillFilter);
      const matchesSearch =
        !search.trim() ||
        responder.name.toLowerCase().includes(search.toLowerCase()) ||
        (responder.location || "").toLowerCase().includes(search.toLowerCase());
      return matchesAgency && matchesSkill && matchesSearch;
    });
  }, [responders, agencyFilter, skillFilter, search]);

  const handleStatusChange = (responderId, newStatus) => {
    updateResponderStatus(responderId, newStatus);
  };

  const handleOpenForm = (responder = null) => {
    setSelectedResponder(responder);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedResponder(null);
    setIsFormOpen(false);
  };

  const handleSaveResponder = (responder) => {
    if (responder.id) {
      updateResponder(responder);
    } else {
      addResponder(responder);
    }
    handleCloseForm();
  };

  const handleDeleteResponder = (responderId) => {
    if (window.confirm("Are you sure you want to delete this responder?")) {
      deleteResponder(responderId);
      handleCloseForm();
    }
  };

  return (
    <div className="space-y-4 pb-16">
      <div className="grid grid-cols-4 gap-2 rounded-2xl bg-ui-surface p-2 shadow">
        {Object.values(TABS).map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            activeTab={activeTab}
            onClick={setActiveTab}
          />
        ))}
      </div>

      <div className="space-y-4">
        {activeTab === TABS.DIRECTORY.id && (
          <section className="space-y-4">
            <div className="rounded-2xl bg-ui-surface p-4 shadow space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-ui-text">
                  Responder Directory
                </h2>
                <button
                  onClick={() => handleOpenForm()}
                  className="flex items-center gap-2 rounded-full bg-brand-primary px-3 py-1.5 text-sm font-semibold text-white"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search responders or barangays"
                  className="w-full rounded-xl border border-ui-border bg-ui-background px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={agencyFilter}
                    onChange={(e) => setAgencyFilter(e.target.value)}
                    className="w-full rounded-xl border border-ui-border bg-ui-background px-3 py-2 text-sm"
                  >
                    {agencies.map((agency) => (
                      <option key={agency} value={agency}>
                        {agency === "All" ? "All Agencies" : agency}
                      </option>
                    ))}
                  </select>
                  <select
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    className="w-full rounded-xl border border-ui-border bg-ui-background px-3 py-2 text-sm"
                  >
                    {skills.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill === "All" ? "All Skills" : skill}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <Responders
              responders={filteredResponders}
              onStatusChange={handleStatusChange}
              onEdit={handleOpenForm}
            />
          </section>
        )}

        {activeTab === TABS.MISSIONS.id && (
          <section className="rounded-2xl bg-ui-surface p-4 shadow space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-brand-primary" />
              <h3 className="text-lg font-semibold text-ui-text">
                Active Missions
              </h3>
            </div>
            <div className="space-y-3">
              {missionQueue.map((mission) => (
                <div
                  key={mission.id}
                  className="rounded-xl border border-ui-border bg-ui-background p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ui-text">
                        {mission.title}
                      </p>
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
        )}

        {activeTab === TABS.SHIFTS.id && (
          <section className="rounded-2xl bg-ui-surface p-4 shadow space-y-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-brand-primary" />
              <h3 className="text-lg font-semibold text-ui-text">
                Shift & Duty Planner
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {shiftTemplates.map((shift) => (
                <div
                  key={shift.id}
                  className="rounded-xl border border-ui-border bg-ui-background p-3"
                >
                  <p className="text-sm font-semibold text-ui-text">
                    {shift.label}
                  </p>
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
        )}

        {activeTab === TABS.SAFETY.id && (
          <section className="rounded-2xl bg-ui-surface p-4 shadow space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-brand-primary" />
              <h3 className="text-lg font-semibold text-ui-text">
                Safety Monitor
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-1">
              <div className="rounded-xl border border-ui-border bg-ui-background p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-ui-text">
                  <BellRing className="h-4 w-4" /> Scheduled Check-ins
                </div>
                <ul className="mt-2 space-y-1 text-xs text-ui-subtext">
                  {safetySignals.checkIns.map((item) => (
                    <li key={item.id}>
                      {item.label} • {item.due}
                    </li>
                  ))}
                </ul>
                <button className="mt-3 w-full rounded-lg bg-brand-primary/10 py-2 text-xs font-semibold text-brand-primary">
                  Ping teams
                </button>
              </div>
              <div className="rounded-xl border border-ui-border bg-ui-background p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-status-high">
                  <ShieldAlert className="h-4 w-4" /> Panic / Mayday
                </div>
                <ul className="mt-2 space-y-1 text-xs text-status-high">
                  {safetySignals.mayday.map((item) => (
                    <li key={item.id}>
                      {item.details} • {item.time}
                    </li>
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
                      <span className="font-semibold text-ui-text">
                        {trail.team}
                      </span>
                      <span className="block">
                        Path: {trail.lastPoints.join(" → ")}
                      </span>
                    </li>
                  ))}
                </ul>
                <button className="mt-3 w-full rounded-lg bg-brand-primary/10 py-2 text-xs font-semibold text-brand-primary">
                  Open timeline
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {isFormOpen && (
        <ResponderForm
          responder={selectedResponder}
          onSave={handleSaveResponder}
          onCancel={handleCloseForm}
          onDelete={handleDeleteResponder}
        />
      )}
    </div>
  );
}
