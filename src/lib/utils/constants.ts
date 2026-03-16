import type { DocumentFormat } from "@/lib/detection/types";

export const FORMAT_LABELS: Record<DocumentFormat, string> = {
  "bis-billing": "BIS Billing 3.0",
  "self-billing": "Self-Billing",
  pint: "PINT",
  xrechnung: "XRechnung",
  zugferd: "ZUGFeRD",
  unknown: "Unknown",
};

export const FORMAT_COLORS: Record<DocumentFormat, string> = {
  "bis-billing": "bg-blue-100 text-blue-700",
  "self-billing": "bg-purple-100 text-purple-700",
  pint: "bg-emerald-100 text-emerald-700",
  xrechnung: "bg-amber-100 text-amber-700",
  zugferd: "bg-rose-100 text-rose-700",
  unknown: "bg-gray-100 text-gray-700",
};
