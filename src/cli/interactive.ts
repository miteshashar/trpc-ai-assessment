import { FileSelector } from "./components/FileSelector";
import { ResultsDisplay } from "./components/ResultsDisplay";
import { ApiClient } from "./services/ApiClient";
import { loadPDFFile } from "./utils/fileUtils";

async function main() {
  try {
    console.log("CV Evaluation Tool Starting...");

    const jdSelector = new FileSelector("Select Job Description PDF");
    const jdPath = await jdSelector.show();
    console.log(`Selected Job Description File: ${jdPath}`);

    const cvSelector = new FileSelector("Select CV PDF");
    const cvPath = await cvSelector.show();
    console.log(`Selected CV File: ${cvPath}`);

    const formData = new FormData();
    await loadPDFFile(jdPath, "jobDescription", formData);
    await loadPDFFile(cvPath, "cv", formData);

    console.log("Evaluating candidate against job description...");
    const apiClient = new ApiClient();
    const response = await apiClient.evaluate(formData);

    console.log("Evaluation complete! Displaying results...");
    const resultsDisplay = new ResultsDisplay(response);
    resultsDisplay.show();
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

void main();
