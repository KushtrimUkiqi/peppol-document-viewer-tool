import type { DocumentFormat } from "@/lib/detection/types";
import { FORMAT_LABELS, FORMAT_COLORS } from "@/lib/utils/constants";

interface FormatBadgeProps {
  format: DocumentFormat;
  size?: "sm" | "md";
}

export function FormatBadge({ format, size = "md" }: FormatBadgeProps) {
  const label = FORMAT_LABELS[format] ?? format;
  const color = FORMAT_COLORS[format] ?? "bg-gray-100 text-gray-700";
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${color} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {label}
    </span>
  );
}