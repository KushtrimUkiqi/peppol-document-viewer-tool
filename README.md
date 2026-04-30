# 🧾 PEPPOL Document Viewer Tool
Please test the tool using this link: https://peppol-viewer.com/
A modern, free-to-host **Next.js** web application that transforms PEPPOL e-invoicing XML documents into beautiful, human-readable HTML.

## ✨ Supported Formats

| Format | Syntax | Description |
|---|---|---|
| **BIS Billing 3.0** | UBL | PEPPOL's standard invoicing format |
| **BIS Self-Billing** | UBL | Self-billing invoice variant |
| **PINT** | UBL | Peppol International Invoicing |
| **XRechnung** | UBL / CII | German e-invoicing standard |
| **ZUGFeRD** | CII | EU hybrid invoice standard |

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/KushtrimUkiqi/peppol-document-viewer-tool.git
cd peppol-document-viewer-tool

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture

```
src/
├── app/              # Next.js App Router pages & API
├── components/       # React UI components (modular)
├── lib/
│   ├── detection/    # Auto-detect invoice format from XML
│   ├── renderer/     # JS-based XML → HTML renderers
│   ├── parser/       # XML parsing & validation
│   └── utils/        # Shared constants & error handling
├── hooks/            # Custom React hooks
└── types/            # Shared TypeScript types
```

### How It Works

1. **Upload** — User drags & drops or selects an XML invoice file
2. **Detect** — The detection engine identifies the format (BIS Billing, XRechnung, etc.)
3. **Transform** — The renderer converts XML into styled HTML
4. **Display** — The viewer shows the rendered invoice with toolbar controls
5. **Export** — Download as HTML or PDF

4. Add a sample invoice in `public/sample-invoices/`

## 📄 License

MIT License — see [LICENSE](LICENSE)
