"use client";

import { useCallback, useRef, useState } from "react";

interface FileUploadProps {
  onFileContent: (content: string) => void;
  disabled?: boolean;
}

export function FileUpload({ onFileContent, disabled }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const readFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) onFileContent(text);
      };
      reader.readAsText(file);
    },
    [onFileContent]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) readFile(file);
    },
    [disabled, readFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) readFile(file);
    },
    [readFile]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all
        ${isDragOver
          ? "border-peppol-400 bg-peppol-50 scale-[1.02]"
          : "border-gray-300 bg-white hover:border-peppol-300 hover:bg-peppol-50/50"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xml,.XML"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-3">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragOver ? "bg-peppol-200 text-peppol-700" : "bg-gray-100 text-gray-400"}`}>
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">
            Drop your XML invoice here
          </p>
          <p className="text-xs text-gray-400 mt-1">
            or <span className="text-peppol-600 font-medium">browse files</span> — .xml supported
          </p>
        </div>
      </div>
    </div>
  );
}