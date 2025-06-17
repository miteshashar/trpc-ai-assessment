import { createTRPCClient, httpLink, TRPCClientError } from "@trpc/client";
import { existsSync, openAsBlob } from "node:fs";
import { basename } from "node:path";
import { AppRouter } from "../server/appRouter";

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: "http://localhost:3000",
    }),
  ],
});

async function validatePDF(
  buffer: ArrayBuffer,
  fileName: string,
): Promise<void> {
  if (new TextDecoder("utf-8").decode(buffer.slice(0, 5)) !== "%PDF-") {
    throw new Error(`The provided ${fileName} file is not a valid PDF.`);
  }
}

async function loadPDFFile(
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

async function main() {
  const formData = new FormData();
  const jdPath = process.argv[2];
  const cvPath = process.argv[3];

  if (!jdPath || !cvPath) {
    console.error(
      "Usage: yarn dev:client <path/to/job-description.pdf> <path/to/cv.pdf>\n" +
        "Please provide paths to both the job description and CV PDF files.",
    );
    process.exit(1);
  }

  try {
    await loadPDFFile(jdPath, "jobDescription", formData);
    await loadPDFFile(cvPath, "cv", formData);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
  try {
    console.log("Evaluating candidate against job description...");
    const response = await trpc.evaluate.mutate(formData);
    console.log("Evaluation completed successfully:");
    console.log(JSON.stringify(response, null, 2));
    process.exit(0);
  } catch (error) {
    const trpcError = error as TRPCClientError<AppRouter>;
    console.error("Evaluation failed:");
    console.error("Error:", trpcError.message);
    if (trpcError.data?.code) {
      console.error("Code:", trpcError.data.code);
    }
    process.exit(1);
  }
}

void main();
