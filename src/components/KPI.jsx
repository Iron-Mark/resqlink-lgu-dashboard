import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

export default function KPI({ label, value, trend }) {
  const isPositive = trend.startsWith("+");
  const trendColor = isPositive ? "text-status-resolved" : "text-status-high";
  const TrendIcon = isPositive ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className="bg-ui-surface p-4 rounded-xl shadow-card flex flex-col justify-between transition-shadow duration-300 hover:shadow-card-hover">
      <div>
        <p className="text-sm text-ui-subtext font-medium">{label}</p>
        <h2 className="text-3xl font-bold text-ui-text tracking-tight">
          {value}
        </h2>
      </div>
      <p
        className={`text-sm font-semibold ${trendColor} flex items-center gap-1`}
      >
        <TrendIcon className="w-4 h-4" />
        {trend.substring(1)}
      </p>
    </div>
  );
}
