"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FileUpload } from "@/components/ui/FileUpload";
import { FormatBadge } from "@/components/ui/FormatBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { DocumentViewer } from "@/components/viewer/DocumentViewer";
import { ViewerToolbar } from "@/components/viewer/ViewerToolbar";
import { RawXmlViewer } from "@/components/viewer/RawXmlViewer";
import { useDocumentTransform } from "@/hooks/useDocumentTransform";
import type { DocumentFormat } from "@/lib/detection/types";

const SAMPLE_FILES: { label: string; file: string; format: string }[] = [
  {
    label: "BIS Billing 3.0",
    file: "/sample-invoices/bis-billing-3-invoice.xml",
    format: "bis-billing",
  },
  {
    label: "Self-Billing",
    file: "/sample-invoices/self-billing-invoice.xml",
    format: "self-billing",
  },
  {
    label: "PINT",
    file: "/sample-invoices/pint-invoice.xml",
    format: "pint",
  },
  {
    label: "XRechnung",
    file: "/sample-invoices/xrechnung-invoice.xml",
    format: "xrechnung",
  },
  {
    label: "ZUGFeRD",
    file: "/sample-invoices/zugferd-invoice.xml",
    format: "zugferd",
  },
];

export default function HomePage() {
  const {
    transformedHtml,
    rawXml,
    detectedFormat,
    documentMeta,
    isLoading,
    error,
    transform,
    reset,
  } = useDocumentTransform();

  const [viewMode, setViewMode] = useState<"rendered" | "raw">("rendered");

  const handleFileSelected = async (content: string) => {
    setViewMode("rendered");
    await transform(content);
  };

  const handleSampleClick = async (file: string) => {
    try {
      const response = await fetch(file);
      const content = await response.text();
      await handleFileSelected(content);
    } catch {
      // Error handled by transform hook
    }
  };

  const handleDownloadHtml = () => {
    if (!transformedHtml) return;
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${documentMeta?.invoiceNumber ?? "Document"}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 2rem; color: #1a1a1a; }
  </style>
</head>
<body>
${transformedHtml}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${documentMeta?.invoiceNumber ?? "document"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    if (!transformedHtml) return;
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${documentMeta?.invoiceNumber ?? "Document"}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 2rem; color: #1a1a1a; }
    @page { size: A4; margin: 15mm; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: 600; }
  </style>
</head>
<body>
${transformedHtml}
</body>
</html>`;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(fullHtml);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handlePrint = () => {
    handleDownloadPdf();
  };

  const showViewer = transformedHtml && !isLoading && !error;

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        {!showViewer && (
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-peppol-50 via-white to-blue-50" />
            <div className="absolute inset-0">
              <div className="absolute top-20 left-10 w-72 h-72 bg-peppol-200/30 rounded-full blur-3xl" />
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
            </div>
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 rounded-full bg-peppol-100 px-4 py-1.5 text-sm font-medium text-peppol-700 mb-6">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  Free &amp; Open Source
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                  <span className="text-gradient">PEPPOL</span> Document Viewer
                </h1>
                <p className="mt-4 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto">
                  Transform e-invoicing XML into beautiful, human-readable documents.
                  Supports BIS Billing, Self-Billing, PINT, XRechnung &amp; ZUGFeRD.
                </p>
              </div>

              {/* Upload Area */}
              <div className="max-w-2xl mx-auto">
                <FileUpload onFileContent={handleFileSelected} disabled={isLoading} />

                {isLoading && (
                  <div className="mt-8 flex flex-col items-center gap-3">
                    <LoadingSpinner />
                    <p className="text-sm text-gray-500">Transforming document…</p>
                  </div>
                )}

                {error && (
                  <div className="mt-6">
                    <ErrorAlert message={error} onDismiss={reset} />
                  </div>
                )}
              </div>

              {/* Sample Files */}
              <div className="mt-12 text-center">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
                  Or try a sample invoice
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {SAMPLE_FILES.map((s) => (
                    <button
                      key={s.file}
                      onClick={() => handleSampleClick(s.file)}
                      disabled={isLoading}
                      className="btn-secondary text-xs sm:text-sm"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Viewer */}
        {showViewer && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ViewerToolbar
              format={detectedFormat as DocumentFormat}
              documentMeta={documentMeta}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onDownloadHtml={handleDownloadHtml}
              onDownloadPdf={handleDownloadPdf}
              onPrint={handlePrint}
              onReset={reset}
            />
            <div className="mt-6">
              {viewMode === "rendered" ? (
                <DocumentViewer html={transformedHtml} />
              ) : (
                <RawXmlViewer xml={rawXml ?? ""} />
              )}
            </div>
          </section>
        )}

        {/* Features */}
        {!showViewer && (
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  ),
                  title: "Instant Rendering",
                  desc: "Upload any supported XML and get a beautiful invoice view in milliseconds.",
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  ),
                  title: "5 Formats Supported",
                  desc: "BIS Billing 3.0, Self-Billing, PINT, XRechnung, and ZUGFeRD out of the box.",
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  ),
                  title: "Export PDF & HTML",
                  desc: "Download your rendered invoices as HTML files or print/save them as PDF.",
                },
              ].map((f) => (
                <div key={f.title} className="card p-6 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-peppol-100 text-peppol-600 flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}