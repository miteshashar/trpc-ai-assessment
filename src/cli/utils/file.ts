// File utilities for PDF handling
import { existsSync, openAsBlob } from "node:fs";
import { basename } from "node:path";

// Validate that file buffer contains a valid PDF
export async function validatePDF(
  buffer: ArrayBuffer,
  fileName: string,
): Promise<void> {
  if (new TextDecoder("utf-8").decode(buffer.slice(0, 5)) !== "%PDF-") {
    throw new Error(`The provided ${fileName} file is not a valid PDF.`);
  }
}

// Load PDF file and add to FormData for API submission
export async function loadPDFFile(
  filePath: string,
  formDataKey: string,
  formData: FormData,
): Promise<void> {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  try {
    const blob = await openAsBlob(filePath, { type: "application/pdf" });
    const buffer = await blob.arrayBuffer();
    await validatePDF(buffer, formDataKey);
    formData.set(formDataKey, blob, basename(filePath));
  } catch (error) {
    throw new Error(`Error reading ${formDataKey} file: ${error}`);
  }
}