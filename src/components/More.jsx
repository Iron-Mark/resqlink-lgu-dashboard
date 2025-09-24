import { useState } from "react";
import {
  Settings,
  Languages,
  Bell,
  Moon,
  Text,
  Shield,
  FileText,
  Info,
  HelpCircle,
  RadioTower,
  LifeBuoy,
} from "lucide-react";

export default function More() {
  const [preferences, setPreferences] = useState({
    language: "English",
    theme: "System",
    textSize: "Medium",
    notifications: true,
    offlineMode: false,
    locationSharing: true,
  });

  const handleToggle = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 pb-16">
      <section className="rounded-2xl bg-ui-surface p-4 shadow space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-brand-primary" />
          <h2 className="text-xl font-semibold text-ui-text">System Settings</h2>
        </div>
        <div className="space-y-3 text-sm">
          <SettingSelect
            icon={Languages}
            label="Language"
            value={preferences.language}
            options={[
              { value: "English", label: "English" },
              { value: "Filipino", label: "Filipino" },
            ]}
            onChange={(value) => setPreferences((prev) => ({ ...prev, language: value }))}
          />
          <SettingSelect
            icon={Moon}
            label="Theme"
            value={preferences.theme}
            options={[
              { value: "Light", label: "Light" },
              { value: "Dark", label: "Dark" },
              { value: "System", label: "Follow system" },
            ]}
            onChange={(value) => setPreferences((prev) => ({ ...prev, theme: value }))}
          />
          <SettingSelect
            icon={Text}
            label="Text size"
            value={preferences.textSize}
            options={[
              { value: "Small", label: "Small" },
              { value: "Medium", label: "Medium" },
              { value: "Large", label: "Large" },
            ]}
            onChange={(value) => setPreferences((prev) => ({ ...prev, textSize: value }))}
          />
          <ToggleRow
            icon={Bell}
            label="Notifications"
            description="Mission alerts, broadcasts, and check-in reminders"
            active={preferences.notifications}
            onToggle={() => handleToggle("notifications")}
          />
          <ToggleRow
            icon={RadioTower}
            label="Offline mode"
            description="Enable when command center runs on limited connectivity"
            active={preferences.offlineMode}
            onToggle={() => handleToggle("offlineMode")}
          />
          <ToggleRow
            icon={Shield}
            label="Location sharing"
            description="Allow responders to broadcast trails for safety"
            active={preferences.locationSharing}
            onToggle={() => handleToggle("locationSharing")}
          />
        </div>
      </section>

      <section className="rounded-2xl bg-ui-surface p-4 shadow space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-brand-primary" />
          <h3 className="text-lg font-semibold text-ui-text">Privacy & Legal</h3>
        </div>
        <div className="space-y-2 text-sm text-brand-primary">
          <button className="block w-full text-left">Terms of Use</button>
          <button className="block w-full text-left">Privacy Policy</button>
          <button className="block w-full text-left">Data Retention & Disclosure</button>
        </div>
      </section>

      <section className="rounded-2xl bg-ui-surface p-4 shadow space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-brand-primary" />
          <h3 className="text-lg font-semibold text-ui-text">About & FAQ</h3>
        </div>
        <div className="space-y-2 text-sm text-ui-text/90">
          <FAQRow
            question="What is ResQLink LGU Command Center?"
            answer="Mission control for citizen reports, responder tracking, and coordination."
          />
          <FAQRow
            question="Who can access management tools?"
            answer="Only authorized LGU supervisors with role-based credentials."
          />
          <FAQRow
            question="How do we request support?"
            answer="Email support@resqlink.ph or call the mutual-aid hotline."
          />
        </div>
      </section>

      <section className="rounded-2xl bg-ui-surface p-4 shadow space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-brand-primary" />
          <h3 className="text-lg font-semibold text-ui-text">Future Modules</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <PlaceholderTile icon={LifeBuoy} title="Mutual Aid" description="Coordinate with nearby LGUs and partner agencies." />
          <PlaceholderTile icon={Bell} title="Broadcast Center" description="Schedule and monitor outbound alerts across channels." />
          <PlaceholderTile icon={FileText} title="Resource Library" description="Plans, SOPs, and hazard playbooks in one place." />
        </div>
      </section>
    </div>
  );
}

function SettingSelect({ icon: Icon, label, value, options, onChange }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-ui-border bg-ui-background px-3 py-2 text-sm">
      <span className="flex items-center gap-2 text-ui-text">
        <Icon className="h-4 w-4 text-brand-primary" />
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-transparent bg-white px-2 py-1 text-xs text-ui-text"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleRow({ icon: Icon, label, description, active, onToggle }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-ui-border bg-ui-background px-3 py-2 text-sm">
      <div>
        <div className="flex items-center gap-2 text-ui-text">
          <Icon className="h-4 w-4 text-brand-primary" />
          {label}
        </div>
        {description && <p className="text-xs text-ui-subtext">{description}</p>}
      </div>
      <button
        onClick={onToggle}
        className={`flex h-6 w-12 items-center rounded-full border transition ${
          active ? "border-brand-primary bg-brand-primary" : "border-ui-border bg-white"
        }`}
      >
        <span
          className={`mx-1 h-4 w-4 rounded-full bg-white transition ${
            active ? "translate-x-6" : "translate-x-0"
          }`}
        ></span>
      </button>
    </div>
  );
}

function FAQRow({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-ui-border bg-ui-background p-3">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-ui-text"
      >
        {question}
        <span className="text-brand-primary">{open ? "−" : "+"}</span>
      </button>
      {open && <p className="mt-2 text-sm text-ui-text/90">{answer}</p>}
    </div>
  );
}

function PlaceholderTile({ icon: Icon, title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-brand-primary/40 bg-brand-primary/5 p-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-brand-primary">
        <Icon className="h-4 w-4" /> {title}
      </div>
      <p className="mt-1 text-xs text-brand-primary/80">{description}</p>
    </div>
  );
}
