import pdf2md from "@opendocsg/pdf2md";

const getMarkdownFromPdfFile = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  // Convert the PDF file to Markdown using pdf2md
  const md = await pdf2md(arrayBuffer);
  // Replace non-ASCII characters with spaces before returning
  return md.replace(/[^\x00-\x7F]/g, " ");
};

const sha256 = async (text: string): Promise<string> => {
  // Create a hash from the text using SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

export { getMarkdownFromPdfFile, sha256 };
