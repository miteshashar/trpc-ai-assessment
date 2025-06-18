import { TRPCClientError } from "@trpc/client";
import { ApiClient } from "./services/ApiClient";
import { displayJsonResults, validateInputs } from "./utils/console";
import { loadPDFFile } from "./utils/file";

async function main() {
  const jdPath = process.argv[2];
  const cvPath = process.argv[3];

  validateInputs(jdPath, cvPath);

  const formData = new FormData();

  try {
    await loadPDFFile(jdPath, "jobDescription", formData);
    await loadPDFFile(cvPath, "cv", formData);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  try {
    console.log("Evaluating candidate against job description...");
    const apiClient = new ApiClient();
    const response = await apiClient.evaluate(formData);

    console.log("Evaluation completed successfully!");
    displayJsonResults(response);
    process.exit(0);
  } catch (error) {
    const trpcError = error as TRPCClientError<any>;
    console.error("Evaluation failed:");
    console.error("Error:", trpcError.message);
    if (trpcError.data?.code) {
      console.error("Code:", trpcError.data.code);
    }
    process.exit(1);
  }
}

void main();
