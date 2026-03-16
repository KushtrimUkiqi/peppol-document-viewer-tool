export type DocumentFormat =
  | "bis-billing"
  | "self-billing"
  | "pint"
  | "xrechnung"
  | "zugferd"
  | "unknown";

export interface DetectionResult {
  format: DocumentFormat;
  label: string;
  syntax: "UBL" | "CII" | "unknown";
  confidence: number;
}