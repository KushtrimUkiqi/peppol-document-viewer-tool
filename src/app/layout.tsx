import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PEPPOL Document Viewer — Free e-Invoice Viewer",
  description:
    "View and render PEPPOL e-invoicing XML documents. Supports BIS Billing 3.0, Self-Billing, PINT, XRechnung, and ZUGFeRD formats.",
  keywords: [
    "PEPPOL",
    "e-invoice",
    "XML viewer",
    "BIS Billing",
    "XRechnung",
    "ZUGFeRD",
    "PINT",
    "UBL",
    "CII",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}