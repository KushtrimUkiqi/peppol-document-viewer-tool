export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>
            Built with Next.js — Free &amp; Open Source under MIT License
          </p>
          <div className="flex items-center gap-4">
            <span>Supports: BIS Billing · Self-Billing · PINT · XRechnung · ZUGFeRD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}