import { useState } from "react";
import {
  User,
  Shield,
  Radio,
  MapPin,
  ClipboardList,
  Save,
  Trash2,
  X,
} from "lucide-react";

export default function ResponderForm({
  responder: initialResponder,
  onSave,
  onCancel,
  onDelete,
}) {
  const isNew = !initialResponder?.id;
  const [responder, setResponder] = useState(
    initialResponder || {
      name: "",
      agency: "Rescue",
      status: "Available",
      location: "",
      specialization: [],
      certifications: [],
      members: 1,
    }
  );

  const [newSkill, setNewSkill] = useState("");
  const [newCert, setNewCert] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setResponder((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagChange = (field, value) => {
    setResponder((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleAddTag = (field, value, setter) => {
    if (value && !responder[field].includes(value)) {
      setResponder((prev) => ({ ...prev, [field]: [...prev[field], value] }));
    }
    setter("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(responder);
  };

  const commonSkills = [
    "Medical",
    "Fire",
    "Flood",
    "Search & Rescue",
    "Evacuation",
  ];
  const commonCerts = ["First Responder", "HazMat", "Paramedic", "USAR"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-ui-surface p-5 shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ui-text">
            {isNew ? "Add New Responder" : "Edit Responder"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-ui-subtext transition hover:text-ui-text"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <InputField
          icon={User}
          label="Name"
          name="name"
          value={responder.name}
          onChange={handleChange}
          placeholder="e.g., Juan Dela Cruz"
          required
        />

        <InputField
          icon={Shield}
          label="Agency"
          name="agency"
          value={responder.agency}
          onChange={handleChange}
          placeholder="e.g., Rescue, BFP, EMS"
          required
        />

        <InputField
          icon={MapPin}
          label="Location / Base"
          name="location"
          value={responder.location}
          onChange={handleChange}
          placeholder="e.g., Brgy. Malanday Station"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            icon={Radio}
            label="Status"
            name="status"
            value={responder.status}
            onChange={handleChange}
            options={["Available", "En Route", "On Scene", "Off Duty"]}
          />
          <InputField
            icon={User}
            label="Members"
            name="members"
            type="number"
            value={responder.members}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <TagField
          label="Specializations"
          field="specialization"
          tags={responder.specialization}
          commonTags={commonSkills}
          newTag={newSkill}
          setNewTag={setNewSkill}
          onTagChange={handleTagChange}
          onAddTag={handleAddTag}
          placeholder="Add new skill"
        />

        <TagField
          label="Certifications"
          field="certifications"
          tags={responder.certifications}
          commonTags={commonCerts}
          newTag={newCert}
          setNewTag={setNewCert}
          onTagChange={handleTagChange}
          onAddTag={handleAddTag}
          placeholder="Add new certification"
        />

        <div className="flex items-center gap-3 pt-4">
          {!isNew && (
            <button
              type="button"
              onClick={() => onDelete(responder.id)}
              className="flex items-center justify-center gap-2 rounded-lg bg-status-high/10 px-4 py-2.5 text-sm font-semibold text-status-high"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Save className="h-4 w-4" />
            {isNew ? "Add Responder" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function InputField({ icon: Icon, label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ui-subtext mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ui-subtext" />
        <input
          {...props}
          className="w-full rounded-lg border border-ui-border bg-ui-background pl-9 pr-3 py-2 text-sm text-ui-text placeholder:text-ui-subtext/50"
        />
      </div>
    </div>
  );
}

function SelectField({ icon: Icon, label, options, ...props }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ui-subtext mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ui-subtext" />
        <select
          {...props}
          className="w-full appearance-none rounded-lg border border-ui-border bg-ui-background pl-9 pr-3 py-2 text-sm text-ui-text"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function TagField({
  label,
  field,
  tags,
  commonTags,
  newTag,
  setNewTag,
  onTagChange,
  onAddTag,
  placeholder,
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-ui-subtext mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {commonTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onTagChange(field, tag)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              tags.includes(tag)
                ? "bg-brand-primary text-white"
                : "bg-ui-background text-ui-subtext"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-ui-border bg-ui-background px-3 py-1.5 text-sm"
        />
        <button
          type="button"
          onClick={() => onAddTag(field, newTag, setNewTag)}
          className="rounded-lg bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold text-brand-primary"
        >
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-brand-primary/20 pl-2 pr-1 py-0.5 text-xs text-brand-primary"
            >
              {tag}
              <button type="button" onClick={() => onTagChange(field, tag)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
