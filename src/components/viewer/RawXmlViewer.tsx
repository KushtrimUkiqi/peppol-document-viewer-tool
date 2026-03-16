"use client";

import { useMemo, useState } from "react";

interface RawXmlViewerProps {
  xml: string;
}

function highlightXml(xml: string): string {
  return xml
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /(&lt;\/?)([\w:.-]+)/g,
      '$1<span class="tag">$2</span>'
    )
    .replace(
      /([\w:.-]+)(=)(".*?")/g,
      '<span class="attr-name">$1</span>$2<span class="attr-value">$3</span>'
    )
    .replace(
      /(&lt;!--[\s\S]*?--&gt;)/g,
      '<span class="comment">$1</span>'
    );
}

export function RawXmlViewer({ xml }: RawXmlViewerProps) {
  const [copied, setCopied] = useState(false);

  const highlighted = useMemo(() => highlightXml(xml), [xml]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card-elevated overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-mono text-gray-500">XML Source</span>
        <button
          onClick={handleCopy}
          className="btn-ghost text-xs"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="xml-viewer overflow-x-auto p-4 max-h-[700px] overflow-y-auto text-xs leading-5">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}