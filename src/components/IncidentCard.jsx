import { MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function IncidentCard({ incident, onClick }) {
  const severityConfig = {
    High: {
      chip: "bg-status-high/10 text-status-high",
      border: "border-status-high",
    },
    Medium: {
      chip: "bg-status-medium/10 text-status-medium",
      border: "border-status-medium",
    },
    Low: {
      chip: "bg-status-low/10 text-status-low",
      border: "border-status-low",
    },
  };

  const { chip, border } =
    severityConfig[incident.severity] || severityConfig.Low;

  return (
    <div
      className={`p-3 rounded-lg bg-ui-surface shadow-card flex items-start gap-4 cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:scale-[1.02] border-l-4 ${border}`}
      onClick={onClick}
    >
      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
        <img
          src={incident.mediaUrl}
          alt={incident.type}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-1">
          <p className="font-bold text-ui-text">{incident.type}</p>
          <span
            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${chip}`}
          >
            {incident.severity}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-ui-subtext">
          <MapPinIcon className="w-4 h-4 flex-shrink-0" />
          <p className="truncate">{incident.location}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-ui-subtext mt-1">
          <ClockIcon className="w-4 h-4 flex-shrink-0" />
          <span>{incident.time}</span>
        </div>
      </div>
    </div>
  );
}
