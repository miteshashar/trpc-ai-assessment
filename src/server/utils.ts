import pdf2md from "@opendocsg/pdf2md";

// Convert PDF file to markdown text
const getMarkdownFromPdfFile = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const md = await pdf2md(arrayBuffer);
  // Replace non-ASCII characters with spaces for AI processing
  return md.replace(/[^\x00-\x7F]/g, " ");
};

// Generate SHA-256 hash for given text string
const sha256 = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

// Replace {variable} placeholders in given text string
const replaceVars = (text: string, vars: Record<string, any>) =>
  text.replace(/\{(\w+)\}/g, (_, key) => vars?.[key] || "");

export { getMarkdownFromPdfFile, replaceVars, sha256 };
