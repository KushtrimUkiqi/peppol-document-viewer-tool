import type { DetectionResult } from "./types";

export function detectFormat(xml: string): DetectionResult | null {
  const isCII = /CrossIndustryInvoice/i.test(xml);
  const isUBL = /<[\w-]*:?(?:Invoice|CreditNote)[\s>]/i.test(xml);

  if (isCII) return detectCIIFormat(xml);
  if (isUBL) return detectUBLFormat(xml);
  return null;
}

function detectUBLFormat(xml: string): DetectionResult {
  const customizationId = getElementValue(xml, "CustomizationID") ?? "";

  if (/selfbilling/i.test(customizationId)) {
    return {
      format: "self-billing",
      label: "Self-Billing",
      syntax: "UBL",
      confidence: 1,
    };
  }
  if (/pint/i.test(customizationId)) {
    return { format: "pint", label: "PINT", syntax: "UBL", confidence: 1 };
  }
  if (/xrechnung/i.test(customizationId)) {
    return {
      format: "xrechnung",
      label: "XRechnung",
      syntax: "UBL",
      confidence: 1,
    };
  }
  if (/peppol|billing|en16931/i.test(customizationId)) {
    return {
      format: "bis-billing",
      label: "BIS Billing 3.0",
      syntax: "UBL",
      confidence: 1,
    };
  }
  return {
    format: "bis-billing",
    label: "BIS Billing 3.0",
    syntax: "UBL",
    confidence: 0.5,
  };
}

function detectCIIFormat(xml: string): DetectionResult {
  const guidelineId = getGuidelineId(xml) ?? "";

  if (/xrechnung/i.test(guidelineId)) {
    return {
      format: "xrechnung",
      label: "XRechnung",
      syntax: "CII",
      confidence: 1,
    };
  }
  if (/zugferd|factur-x/i.test(guidelineId)) {
    return {
      format: "zugferd",
      label: "ZUGFeRD",
      syntax: "CII",
      confidence: 1,
    };
  }
  return {
    format: "zugferd",
    label: "ZUGFeRD",
    syntax: "CII",
    confidence: 0.5,
  };
}

function getElementValue(xml: string, localName: string): string | null {
  const re = new RegExp(`<[\\w-]*:?${localName}[^>]*>([^<]*)<\\/`, "i");
  const match = xml.match(re);
  return match ? match[1].trim() : null;
}

function getGuidelineId(xml: string): string | null {
  const section = xml.match(
    /<[\w-]*:?GuidelineSpecifiedDocumentContextParameter[^>]*>([\s\S]*?)<\/[\w-]*:?GuidelineSpecifiedDocumentContextParameter>/i,
  );
  if (!section) return null;
  return getElementValue(section[1], "ID");
}
