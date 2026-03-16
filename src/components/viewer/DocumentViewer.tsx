"use client";

import { useRef, useEffect } from "react";

interface DocumentViewerProps {
  html: string;
}

export function DocumentViewer({ html }: DocumentViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1a1a2e;
      padding: 2rem;
      line-height: 1.6;
      background: #fff;
    }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 0.875rem; }
    th { background: #f8fafc; font-weight: 600; color: #374151; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
    tr:hover td { background: #f9fafb; }
    h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; color: #0f172a; }
    h2 { font-size: 1.125rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
    h3 { font-size: 0.95rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #334155; }
    .invoice-header { margin-bottom: 2rem; }
    .invoice-header .subtitle { color: #64748b; font-size: 0.875rem; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 1.5rem 0; }
    .party-block { background: #f8fafc; border-radius: 0.75rem; padding: 1.25rem; border: 1px solid #e2e8f0; }
    .party-block h3 { margin-top: 0; color: #0f172a; }
    .party-block p { margin: 0.25rem 0; font-size: 0.875rem; color: #475569; }
    .totals-row { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.875rem; }
    .totals-row.grand-total { font-size: 1.125rem; font-weight: 700; color: #0f172a; border-top: 2px solid #1e293b; padding-top: 0.75rem; margin-top: 0.5rem; }
    .field-label { font-weight: 600; color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .field-value { color: #1e293b; font-size: 0.875rem; }
    .badge { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    .payment-info { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 0.75rem; padding: 1.25rem; margin-top: 1.5rem; }
    .notes { background: #fffbeb; border: 1px solid #fde68a; border-radius: 0.75rem; padding: 1rem; margin-top: 1rem; font-size: 0.875rem; color: #92400e; }
    @media (max-width: 640px) {
      .parties { grid-template-columns: 1fr; }
      body { padding: 1rem; }
    }
  </style>
</head>
<body>
${html}
</body>
</html>`;

    const doc = iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(fullHtml);
      doc.close();
    }

    // Auto-resize iframe
    const resizeObserver = new ResizeObserver(() => {
      if (iframe.contentDocument?.body) {
        iframe.style.height =
          iframe.contentDocument.body.scrollHeight + 40 + "px";
      }
    });

    const checkAndObserve = () => {
      if (iframe.contentDocument?.body) {
        resizeObserver.observe(iframe.contentDocument.body);
        iframe.style.height =
          iframe.contentDocument.body.scrollHeight + 40 + "px";
      }
    };

    iframe.addEventListener("load", checkAndObserve);
    setTimeout(checkAndObserve, 100);

    return () => {
      resizeObserver.disconnect();
      iframe.removeEventListener("load", checkAndObserve);
    };
  }, [html]);

  return (
    <div className="card-elevated overflow-hidden">
      <iframe
        ref={iframeRef}
        className="invoice-frame w-full"
        sandbox="allow-same-origin"
        title="Invoice Document"
      />
    </div>
  );
}