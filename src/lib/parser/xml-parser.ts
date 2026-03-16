import type { DocumentFormat } from "@/lib/detection/types";
import type { DocumentMeta } from "@/types";

export function parseXml(xml: string): boolean {
  if (!xml || typeof xml !== "string") return false;
  const trimmed = xml.trim();
  if (!trimmed.startsWith("<?xml") && !trimmed.startsWith("<")) return false;
  const hasRoot = /<[\w:.-]+[\s\S]*?>[\s\S]*<\/[\w:.-]+\s*>\s*$/i.test(trimmed);
  return hasRoot;
}

export function extractMetadata(
  xml: string,
  format: DocumentFormat,
): DocumentMeta {
  const isCII = /CrossIndustryInvoice/i.test(xml);
  if (isCII) return extractCIIMetadata(xml);
  return extractUBLMetadata(xml);
}

function getVal(xml: string, localName: string): string | null {
  const re = new RegExp(`<[\\w-]*:?${localName}[^>]*>([^<]*)<\\/`, "i");
  const match = xml.match(re);
  return match ? match[1].trim() || null : null;
}

function getSection(xml: string, localName: string): string | null {
  const re = new RegExp(
    `<[\\w-]*:?${localName}[^>]*>([\\s\\S]*?)<\\/[\\w-]*:?${localName}>`,
    "i",
  );
  const match = xml.match(re);
  return match ? match[1] : null;
}

function extractUBLMetadata(xml: string): DocumentMeta {
  const supplier = getSection(xml, "AccountingSupplierParty");
  const buyer = getSection(xml, "AccountingCustomerParty");
  const totals = getSection(xml, "LegalMonetaryTotal");

  return {
    invoiceNumber: getVal(xml, "ID"),
    issueDate: getVal(xml, "IssueDate"),
    dueDate: getVal(xml, "DueDate"),
    currency: getVal(xml, "DocumentCurrencyCode"),
    sellerName: supplier ? getVal(supplier, "Name") : null,
    buyerName: buyer ? getVal(buyer, "Name") : null,
    totalAmount: totals ? getVal(totals, "PayableAmount") : null,
  };
}

function extractCIIMetadata(xml: string): DocumentMeta {
  const exchangedDoc = getSection(xml, "ExchangedDocument");
  const agreement = getSection(xml, "ApplicableHeaderTradeAgreement");
  const settlement = getSection(xml, "ApplicableHeaderTradeSettlement");
  const seller = agreement ? getSection(agreement, "SellerTradeParty") : null;
  const buyer = agreement ? getSection(agreement, "BuyerTradeParty") : null;
  const summation = settlement
    ? getSection(settlement, "SpecifiedTradeSettlementHeaderMonetarySummation")
    : null;

  let issueDate: string | null = null;
  if (exchangedDoc) {
    const dateStr = getVal(exchangedDoc, "DateTimeString");
    if (dateStr && /^\d{8}$/.test(dateStr)) {
      issueDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
    }
  }

  let dueDate: string | null = null;
  if (settlement) {
    const paymentTerms = getSection(settlement, "SpecifiedTradePaymentTerms");
    if (paymentTerms) {
      const dueDateStr = getVal(paymentTerms, "DateTimeString");
      if (dueDateStr && /^\d{8}$/.test(dueDateStr)) {
        dueDate = `${dueDateStr.slice(0, 4)}-${dueDateStr.slice(4, 6)}-${dueDateStr.slice(6, 8)}`;
      }
    }
  }

  return {
    invoiceNumber: exchangedDoc ? getVal(exchangedDoc, "ID") : null,
    issueDate,
    dueDate,
    currency: settlement ? getVal(settlement, "InvoiceCurrencyCode") : null,
    sellerName: seller ? getVal(seller, "Name") : null,
    buyerName: buyer ? getVal(buyer, "Name") : null,
    totalAmount: summation ? getVal(summation, "DuePayableAmount") : null,
  };
}
