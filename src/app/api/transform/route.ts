import { NextRequest, NextResponse } from "next/server";
import { detectFormat } from "@/lib/detection";
import { renderDocument } from "@/lib/renderer";
import { parseXml, extractMetadata } from "@/lib/parser/xml-parser";
import { TransformError } from "@/lib/utils/errors";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { xml } = body as { xml: string };

    if (!xml || typeof xml !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid XML content." },
        { status: 400 }
      );
    }

    // 1. Parse & validate
    const doc = parseXml(xml);
    if (!doc) {
      return NextResponse.json(
        { error: "Invalid XML: could not parse the document." },
        { status: 400 }
      );
    }

    // 2. Detect format
    const detection = detectFormat(xml);
    if (!detection) {
      return NextResponse.json(
        {
          error:
            "Unrecognized document format. Supported: BIS Billing 3, Self-Billing, PINT, XRechnung, ZUGFeRD.",
        },
        { status: 422 }
      );
    }

    // 3. Extract metadata
    const meta = extractMetadata(xml, detection.format);

    // 4. Render
    const html = renderDocument(xml, detection.format);

    return NextResponse.json({
      html,
      format: detection.format,
      formatLabel: detection.label,
      syntax: detection.syntax,
      meta,
    });
  } catch (err) {
    if (err instanceof TransformError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    console.error("Transform error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during transformation." },
      { status: 500 }
    );
  }
}