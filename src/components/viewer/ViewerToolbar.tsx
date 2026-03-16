"use client";

import { FormatBadge } from "@/components/ui/FormatBadge";
import type { DocumentFormat } from "@/lib/detection/types";
import type { DocumentMeta } from "@/types";

interface ViewerToolbarProps {
  format: DocumentFormat;
  documentMeta: DocumentMeta | null;
  viewMode: "rendered" | "raw";
  onViewModeChange: (mode: "rendered" | "raw") => void;
  onDownloadHtml: () => void;
  onDownloadPdf: () => void;
  onPrint: () => void;
  onReset: () => void;
}

export function ViewerToolbar({
  format,
  documentMeta,
  viewMode,
  onViewModeChange,
  onDownloadHtml,
  onDownloadPdf,
  onPrint,
  onReset,
}: ViewerToolbarProps) {
  return (
    <div className="card p-4 no-print">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: format & meta */}
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={onReset} className="btn-ghost !px-2" title="Back to upload">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div className="w-px h-6 bg-gray-200" />
          <FormatBadge format={format} />
          {documentMeta?.invoiceNumber && (
            <span className="text-sm text-gray-500">
              #{documentMeta.invoiceNumber}
            </span>
          )}
          {documentMeta?.issueDate && (
            <span className="text-xs text-gray-400">
              {documentMeta.issueDate}
            </span>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => onViewModeChange("rendered")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "rendered"
                  ? "bg-peppol-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Rendered
            </button>
            <button
              onClick={() => onViewModeChange("raw")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "raw"
                  ? "bg-peppol-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              XML
            </button>
          </div>

          <div className="w-px h-6 bg-gray-200" />

          {/* Download HTML */}
          <button onClick={onDownloadHtml} className="btn-ghost text-xs" title="Download as HTML">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
            HTML
          </button>

          {/* Download PDF */}
          <button onClick={onDownloadPdf} className="btn-ghost text-xs" title="Download as PDF (Print)">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            PDF
          </button>

          {/* Print */}
          <button onClick={onPrint} className="btn-ghost text-xs" title="Print invoice">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m0 0a48.159 48.159 0 018.5 0m-8.5 0V6.75a2.25 2.25 0 012.25-2.25h3a2.25 2.25 0 012.25 2.25v2.534" />
            </svg>
            Print
          </button>
        </div>
      </div>
    </div>
  );
}