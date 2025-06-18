// Console output utilities for CLI
import { IEvaluateOutput } from "../../types";

// Validate command line arguments for regular CLI mode
export function validateInputs(jdPath?: string, cvPath?: string): void {
  if (!jdPath || !cvPath) {
    console.error(
      "Usage: yarn cli <path/to/job-description.pdf> <path/to/cv.pdf>\n" +
        "Please provide paths to both the job description and CV PDF files.",
    );
    process.exit(1);
  }
}

// Display evaluation results in formatted console output
export function displayJsonResults(result: IEvaluateOutput): void {
  const skillRatings = result.candidateEvaluation.skillRatings || [];
  const validSkills = skillRatings.filter(
    (skill) =>
      skill && typeof skill.rating === "number" && !isNaN(skill.rating),
  );

  // Sort skills by rating descending
  const sortedSkills = validSkills.sort(
    (a, b) => (b.rating || 0) - (a.rating || 0),
  );

  console.log("\n" + "=".repeat(80));
  console.log("CV EVALUATION RESULTS");
  console.log("=".repeat(80));

  console.log(`\nCandidate: ${result.candidateEvaluation.candidateName}`);
  console.log(`Experience: ${result.candidateEvaluation.experience} years`);
  console.log(`Company: ${result.jobDescriptionEvaluation.companyName}`);
  console.log(`Position: ${result.jobDescriptionEvaluation.jobOpeningTitle}`);

  console.log("\nSTRENGTHS:");
  result.candidateEvaluation.strengths.forEach((strength, index) => {
    console.log(`  ${index + 1}. ${strength}`);
  });

  console.log("\nWEAKNESSES:");
  result.candidateEvaluation.weaknesses.forEach((weakness, index) => {
    console.log(`  ${index + 1}. ${weakness}`);
  });

  console.log("\nSKILL RATINGS (sorted by rating):");
  sortedSkills.forEach((skill, index) => {
    console.log(`\n  ${index + 1}. ${skill.skill}: ${skill.rating}/10`);
    console.log(`     ${skill.reasoning}`);
  });

  console.log("\n" + "=".repeat(80));
  console.log("Raw JSON Response:");
  console.log("=".repeat(80));
  console.log(JSON.stringify(result, null, 2));
}
