import type { DocumentFormat } from "@/lib/detection/types";
import { TransformError } from "@/lib/utils/errors";

export function renderDocument(xml: string, format: DocumentFormat): string {
  try {
    const isCII = /CrossIndustryInvoice/i.test(xml);
    return isCII ? renderCII(xml) : renderUBL(xml);
  } catch (err) {
    throw new TransformError(
      `Failed to render ${format} document: ${err instanceof Error ? err.message : "Unknown error"}`,
    );
  }
}

// ── Helpers ──

function esc(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function getVal(xml: string, localName: string): string {
  const re = new RegExp(`<[\\w-]*:?${localName}[^>]*>([^<]*)<\\/`, "i");
  const m = xml.match(re);
  return m ? m[1].trim() : "";
}

function getSection(xml: string, localName: string): string {
  const re = new RegExp(
    `<[\\w-]*:?${localName}[^>]*>([\\s\\S]*?)<\\/[\\w-]*:?${localName}>`,
    "i",
  );
  const m = xml.match(re);
  return m ? m[1] : "";
}

function getAllSections(xml: string, localName: string): string[] {
  const re = new RegExp(
    `<[\\w-]*:?${localName}[^>]*>([\\s\\S]*?)<\\/[\\w-]*:?${localName}>`,
    "gi",
  );
  const results: string[] = [];
  let m;
  while ((m = re.exec(xml)) !== null) {
    results.push(m[1]);
  }
  return results;
}

function getAttr(xml: string, localName: string, attr: string): string {
  const re = new RegExp(`<[\\w-]*:?${localName}[^>]*?${attr}="([^"]*)"`, "i");
  const m = xml.match(re);
  return m ? m[1].trim() : "";
}

function renderPartyBlock(
  title: string,
  section: string,
  isCII: boolean,
): string {
  if (!section) return "";

  let name: string,
    street: string,
    city: string,
    postal: string,
    country: string,
    taxId: string,
    regName: string;

  if (isCII) {
    name = getVal(section, "Name");
    const addr = getSection(section, "PostalTradeAddress");
    street = getVal(addr, "LineOne");
    city = getVal(addr, "CityName");
    postal = getVal(addr, "PostcodeCode");
    country = getVal(addr, "CountryID");
    const taxReg = getSection(section, "SpecifiedTaxRegistration");
    taxId = taxReg ? getVal(taxReg, "ID") : "";
    regName = "";
  } else {
    const party = getSection(section, "Party");
    const src = party || section;
    name = getVal(src, "Name");
    regName = getVal(getSection(src, "PartyLegalEntity"), "RegistrationName");
    const addr = getSection(src, "PostalAddress");
    street = getVal(addr, "StreetName");
    city = getVal(addr, "CityName");
    postal = getVal(addr, "PostalZone");
    country = getVal(getSection(addr, "Country"), "IdentificationCode");
    const taxScheme = getSection(src, "PartyTaxScheme");
    taxId = taxScheme ? getVal(taxScheme, "CompanyID") : "";
  }

  const displayName = regName || name;
  const addressParts = [
    street,
    [postal, city].filter(Boolean).join(" "),
    country,
  ].filter(Boolean);

  return `<div class="party-block">
  <h3>${esc(title)}</h3>
  <p><strong>${esc(displayName)}</strong></p>
  ${addressParts.map((p) => `<p>${esc(p)}</p>`).join("\n  ")}
  ${taxId ? `<p class="field-label" style="margin-top:0.75rem">Tax ID</p><p class="field-value">${esc(taxId)}</p>` : ""}
</div>`;
}

// ── UBL Renderer ──

function renderUBL(xml: string): string {
  const id = getVal(xml, "ID");
  const issueDate = getVal(xml, "IssueDate");
  const dueDate = getVal(xml, "DueDate");
  const currency = getVal(xml, "DocumentCurrencyCode");
  const typeCode =
    getVal(xml, "InvoiceTypeCode") || getVal(xml, "CreditNoteTypeCode");
  const note = getVal(xml, "Note");

  const supplier = getSection(xml, "AccountingSupplierParty");
  const buyer = getSection(xml, "AccountingCustomerParty");

  // Line Items
  const lineTag = xml.includes("InvoiceLine")
    ? "InvoiceLine"
    : "CreditNoteLine";
  const lines = getAllSections(xml, lineTag);

  const lineRows = lines
    .map((line) => {
      const lineId = getVal(line, "ID");
      const qtyTag = xml.includes("InvoiceLine")
        ? "InvoicedQuantity"
        : "CreditedQuantity";
      const qty = getVal(line, qtyTag);
      const unit = getAttr(line, qtyTag, "unitCode");
      const amount = getVal(line, "LineExtensionAmount");
      const itemSection = getSection(line, "Item");
      const itemName = getVal(itemSection, "Name");
      const itemDesc = getVal(itemSection, "Description");
      const price = getVal(getSection(line, "Price"), "PriceAmount");
      const display = itemName || itemDesc || "—";
      return `<tr>
  <td>${esc(lineId)}</td>
  <td>${esc(display)}</td>
  <td>${esc(qty)}${unit ? ` ${esc(unit)}` : ""}</td>
  <td>${esc(price)}</td>
  <td>${esc(amount)} ${esc(currency)}</td>
</tr>`;
    })
    .join("\n");

  // Totals
  const totals = getSection(xml, "LegalMonetaryTotal");
  const lineExtensionAmount = getVal(totals, "LineExtensionAmount");
  const taxExclusiveAmount = getVal(totals, "TaxExclusiveAmount");
  const taxInclusiveAmount = getVal(totals, "TaxInclusiveAmount");
  const payableAmount = getVal(totals, "PayableAmount");

  // Tax
  const taxTotal = getSection(xml, "TaxTotal");
  const taxAmount = taxTotal ? getVal(taxTotal, "TaxAmount") : "";

  // Payment
  const paymentMeans = getSection(xml, "PaymentMeans");
  const paymentId = paymentMeans ? getVal(paymentMeans, "PaymentID") : "";
  const iban = paymentMeans
    ? getVal(getSection(paymentMeans, "PayeeFinancialAccount"), "ID")
    : "";

  const typeLabel =
    typeCode === "380"
      ? "Commercial Invoice"
      : typeCode === "381"
        ? "Credit Note"
        : typeCode || "Invoice";

  return `<div class="invoice-header">
  <h1>Invoice #${esc(id)}</h1>
  <p class="subtitle">Issue Date: ${esc(issueDate)}${dueDate ? ` · Due Date: ${esc(dueDate)}` : ""}${currency ? ` · Currency: ${esc(currency)}` : ""}</p>
  <span class="badge badge-info">${esc(typeLabel)}${typeCode ? ` (${esc(typeCode)})` : ""}</span>
</div>

<div class="parties">
  ${renderPartyBlock("Seller", supplier, false)}
  ${renderPartyBlock("Buyer", buyer, false)}
</div>

<h2>Line Items</h2>
<table>
  <thead>
    <tr><th>#</th><th>Description</th><th>Quantity</th><th>Unit Price</th><th>Amount</th></tr>
  </thead>
  <tbody>
    ${lineRows || '<tr><td colspan="5" style="text-align:center;color:#94a3b8">No line items found</td></tr>'}
  </tbody>
</table>

<h2>Totals</h2>
${lineExtensionAmount ? `<div class="totals-row"><span>Line Extension (Subtotal)</span><span>${esc(lineExtensionAmount)} ${esc(currency)}</span></div>` : ""}
${taxAmount ? `<div class="totals-row"><span>Tax</span><span>${esc(taxAmount)} ${esc(currency)}</span></div>` : ""}
${taxInclusiveAmount ? `<div class="totals-row"><span>Tax Inclusive</span><span>${esc(taxInclusiveAmount)} ${esc(currency)}</span></div>` : ""}
<div class="totals-row grand-total"><span>Total Payable</span><span>${esc(payableAmount)} ${esc(currency)}</span></div>

${
  paymentMeans
    ? `<div class="payment-info">
  <h3>Payment Information</h3>
  ${paymentId ? `<p><span class="field-label">Payment Reference:</span> <span class="field-value">${esc(paymentId)}</span></p>` : ""}
  ${iban ? `<p><span class="field-label">IBAN:</span> <span class="field-value">${esc(iban)}</span></p>` : ""}
</div>`
    : ""
}

${note ? `<div class="notes"><strong>Note:</strong> ${esc(note)}</div>` : ""}`;
}

// ── CII Renderer ──

function renderCII(xml: string): string {
  const exchangedDoc = getSection(xml, "ExchangedDocument");
  const id = getVal(exchangedDoc, "ID");
  const typeCode = getVal(exchangedDoc, "TypeCode");

  // Date (CII format: YYYYMMDD in DateTimeString)
  let issueDate = "";
  const dateStr = getVal(exchangedDoc, "DateTimeString");
  if (dateStr && /^\d{8}$/.test(dateStr)) {
    issueDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }

  const note = getVal(exchangedDoc, "Content");

  const transaction = getSection(xml, "SupplyChainTradeTransaction");
  const agreement = getSection(transaction, "ApplicableHeaderTradeAgreement");
  const delivery = getSection(transaction, "ApplicableHeaderTradeDelivery");
  const settlement = getSection(transaction, "ApplicableHeaderTradeSettlement");

  const currency = getVal(settlement, "InvoiceCurrencyCode");

  const seller = getSection(agreement, "SellerTradeParty");
  const buyer = getSection(agreement, "BuyerTradeParty");

  // Due date
  let dueDate = "";
  const paymentTerms = getSection(settlement, "SpecifiedTradePaymentTerms");
  if (paymentTerms) {
    const dueDateStr = getVal(paymentTerms, "DateTimeString");
    if (dueDateStr && /^\d{8}$/.test(dueDateStr)) {
      dueDate = `${dueDateStr.slice(0, 4)}-${dueDateStr.slice(4, 6)}-${dueDateStr.slice(6, 8)}`;
    }
  }

  // Line Items
  const lines = getAllSections(transaction, "IncludedSupplyChainTradeLineItem");

  const lineRows = lines
    .map((line) => {
      const lineDoc = getSection(line, "AssociatedDocumentLineDocument");
      const lineId = lineDoc ? getVal(lineDoc, "LineID") : "";
      const product = getSection(line, "SpecifiedTradeProduct");
      const productName = product ? getVal(product, "Name") : "";
      const lineAgreement = getSection(line, "SpecifiedLineTradeAgreement");
      const price = lineAgreement
        ? getVal(
            getSection(lineAgreement, "NetPriceProductTradePrice"),
            "ChargeAmount",
          )
        : "";
      const lineDelivery = getSection(line, "SpecifiedLineTradeDelivery");
      const qty = lineDelivery ? getVal(lineDelivery, "BilledQuantity") : "";
      const unit = lineDelivery
        ? getAttr(lineDelivery, "BilledQuantity", "unitCode")
        : "";
      const lineSettlement = getSection(line, "SpecifiedLineTradeSettlement");
      const lineSummation = lineSettlement
        ? getSection(
            lineSettlement,
            "SpecifiedTradeSettlementLineMonetarySummation",
          )
        : "";
      const lineTotal = lineSummation
        ? getVal(lineSummation, "LineTotalAmount")
        : "";

      return `<tr>
  <td>${esc(lineId)}</td>
  <td>${esc(productName || "—")}</td>
  <td>${esc(qty)}${unit ? ` ${esc(unit)}` : ""}</td>
  <td>${esc(price)}</td>
  <td>${esc(lineTotal)} ${esc(currency)}</td>
</tr>`;
    })
    .join("\n");

  // Totals
  const summation = getSection(
    settlement,
    "SpecifiedTradeSettlementHeaderMonetarySummation",
  );
  const lineTotalAmount = getVal(summation, "LineTotalAmount");
  const taxBasisTotal = getVal(summation, "TaxBasisTotalAmount");
  const taxTotal =
    getVal(getSection(settlement, "ApplicableTradeTax"), "CalculatedAmount") ||
    getVal(summation, "TaxTotalAmount");
  const grandTotal = getVal(summation, "GrandTotalAmount");
  const duePayable = getVal(summation, "DuePayableAmount");

  // Payment
  const paymentMeans = getSection(
    settlement,
    "SpecifiedTradeSettlementPaymentMeans",
  );
  const iban = paymentMeans
    ? getVal(
        getSection(paymentMeans, "PayeePartyCreditorFinancialAccount"),
        "IBANID",
      )
    : "";

  const typeLabel =
    typeCode === "380"
      ? "Commercial Invoice"
      : typeCode === "381"
        ? "Credit Note"
        : typeCode || "Invoice";

  return `<div class="invoice-header">
  <h1>Invoice #${esc(id)}</h1>
  <p class="subtitle">Issue Date: ${esc(issueDate)}${dueDate ? ` · Due Date: ${esc(dueDate)}` : ""}${currency ? ` · Currency: ${esc(currency)}` : ""}</p>
  <span class="badge badge-info">${esc(typeLabel)}${typeCode ? ` (${esc(typeCode)})` : ""}</span>
</div>

<div class="parties">
  ${renderPartyBlock("Seller", seller, true)}
  ${renderPartyBlock("Buyer", buyer, true)}
</div>

<h2>Line Items</h2>
<table>
  <thead>
    <tr><th>#</th><th>Description</th><th>Quantity</th><th>Unit Price</th><th>Amount</th></tr>
  </thead>
  <tbody>
    ${lineRows || '<tr><td colspan="5" style="text-align:center;color:#94a3b8">No line items found</td></tr>'}
  </tbody>
</table>

<h2>Totals</h2>
${lineTotalAmount ? `<div class="totals-row"><span>Line Total (Subtotal)</span><span>${esc(lineTotalAmount)} ${esc(currency)}</span></div>` : ""}
${taxTotal ? `<div class="totals-row"><span>Tax</span><span>${esc(taxTotal)} ${esc(currency)}</span></div>` : ""}
${grandTotal ? `<div class="totals-row"><span>Grand Total</span><span>${esc(grandTotal)} ${esc(currency)}</span></div>` : ""}
<div class="totals-row grand-total"><span>Total Payable</span><span>${esc(duePayable || grandTotal)} ${esc(currency)}</span></div>

${
  paymentMeans
    ? `<div class="payment-info">
  <h3>Payment Information</h3>
  ${iban ? `<p><span class="field-label">IBAN:</span> <span class="field-value">${esc(iban)}</span></p>` : ""}
</div>`
    : ""
}

${note ? `<div class="notes"><strong>Note:</strong> ${esc(note)}</div>` : ""}`;
}
