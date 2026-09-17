import React from "react";
import { Loader2 } from "lucide-react";

export default function StatsCard({
  title,
  value,
  icon,
  color = "bg-green-600",
  subtitle = "",
  loading = false,
  onClick,
}) {
  const Icon = icon;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition ${
        onClick
          ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5"
          : "hover:shadow-md"
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        {/* Content */}
        <div className="min-w-0">
          <p className="text-slate-500 text-sm font-medium truncate">
            {title}
          </p>

          <div className="mt-2 min-h-[40px] flex items-center">
            {loading ? (
              <Loader2 className="w-7 h-7 text-slate-400 animate-spin" />
            ) : (
              <h2 className="text-3xl font-bold text-slate-900">
                {value ?? 0}
              </h2>
            )}
          </div>

          {subtitle && !loading && (
            <p className="text-xs text-slate-500 mt-2">
              {subtitle}
            </p>
          )}
        </div>

        {/* Icon */}
        <div
          className={`${color} w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-sm`}
        >
          {Icon && (
            <Icon
              size={28}
              className="text-white"
              strokeWidth={2}
            />
          )}
        </div>
      </div>
    </div>
  );
}