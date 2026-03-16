"use client";

import type { DocumentFormat } from "@/lib/detection/types";
import type { DocumentMeta } from "@/types";
import { useCallback, useState } from "react";

interface TransformState {
  transformedHtml: string | null;
  rawXml: string | null;
  detectedFormat: DocumentFormat | null;
  documentMeta: DocumentMeta | null;
  isLoading: boolean;
  error: string | null;
}

export function useDocumentTransform() {
  const [state, setState] = useState<TransformState>({
    transformedHtml: null,
    rawXml: null,
    detectedFormat: null,
    documentMeta: null,
    isLoading: false,
    error: null,
  });

  const transform = useCallback(async (xml: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xml }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: data.error || "Transformation failed.",
        }));
        return;
      }
      setState({
        transformedHtml: data.html,
        rawXml: xml,
        detectedFormat: data.format,
        documentMeta: data.meta,
        isLoading: false,
        error: null,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Network error: could not reach the server.",
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      transformedHtml: null,
      rawXml: null,
      detectedFormat: null,
      documentMeta: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return { ...state, transform, reset };
}
