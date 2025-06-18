// Interactive terminal UI for displaying CV evaluation results
import * as blessed from "blessed";
import { IEvaluateOutput } from "../../types";

export class ResultsDisplay {
  private screen!: blessed.Widgets.Screen;
  private result: IEvaluateOutput;

  constructor(result: IEvaluateOutput) {
    this.result = result;
    this.createUI();
  }

  // Create terminal UI layout with multiple panels
  private createUI() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: "CV Evaluation Results",
    });

    const headerBox = this.createHeaderBox();
    const strengthsBox = this.createStrengthsBox();
    const weaknessesBox = this.createWeaknessesBox();
    const skillsBox = this.createSkillsBox();
    const exitBox = this.createExitBox();

    this.screen.append(headerBox);
    this.screen.append(strengthsBox);
    this.screen.append(weaknessesBox);
    this.screen.append(skillsBox);
    this.screen.append(exitBox);

    skillsBox.focus();
    this.setupEventHandlers();
  }

  private createHeaderBox(): blessed.Widgets.BoxElement {
    return blessed.box({
      top: 0,
      left: 0,
      width: "100%",
      height: 3,
      content: `Candidate: ${this.result.candidateEvaluation.candidateName} (${this.result.candidateEvaluation.experience} years experience) | Company: ${this.result.jobDescriptionEvaluation.companyName} | Position: ${this.result.jobDescriptionEvaluation.jobOpeningTitle}`,
      tags: true,
      border: { type: "line" },
      style: {
        fg: "white",
        bold: true,
        border: { fg: "#f0f0f0" },
      },
    });
  }

  private createStrengthsBox(): blessed.Widgets.BoxElement {
    return blessed.box({
      top: 3,
      left: 0,
      width: "50%",
      height: 8,
      content: `Strengths:\n${this.result.candidateEvaluation.strengths
        .map((s) => `• ${s}`)
        .join("\n")}`,
      tags: true,
      border: { type: "line" },
      style: {
        fg: "green",
        border: { fg: "green" },
      },
      scrollable: true,
    });
  }

  private createWeaknessesBox(): blessed.Widgets.BoxElement {
    return blessed.box({
      top: 3,
      left: "50%",
      width: "50%",
      height: 8,
      content: `Weaknesses:\n${this.result.candidateEvaluation.weaknesses
        .map((w) => `• ${w}`)
        .join("\n")}`,
      tags: true,
      border: { type: "line" },
      style: {
        fg: "red",
        border: { fg: "red" },
      },
      scrollable: true,
    });
  }

  // Create scrollable skills panel with ratings and reasoning
  private createSkillsBox(): blessed.Widgets.BoxElement {
    const skillRatings = this.result.candidateEvaluation.skillRatings || [];
    const validSkills = skillRatings.filter(
      (skill) =>
        skill && typeof skill.rating === "number" && !isNaN(skill.rating),
    );

    // Sort skills by rating (highest first)
    const sortedSkills = validSkills.sort(
      (a, b) => (b.rating || 0) - (a.rating || 0),
    );

    const skillsContent =
      validSkills.length > 0
        ? "Skills Evaluation (sorted by rating):\n\n" +
          sortedSkills
            .map((skill) => {
              const skillName = skill.skill || "Unknown Skill";
              const rating = skill.rating !== undefined ? skill.rating : "N/A";
              const reasoning = skill.reasoning || "No reasoning provided";
              return `${skillName}: ${rating}/10\n${reasoning}\n`;
            })
            .join("\n")
        : "Skills Evaluation:\n\nNo valid skills data received. Please check the server response.";

    return blessed.box({
      top: 11,
      left: 0,
      width: "100%",
      height: "100%-13",
      content: skillsContent,
      border: { type: "line" },
      style: {
        fg: "white",
        border: { fg: "blue" },
      },
      keys: true,
      vi: true,
      scrollable: true,
      alwaysScroll: true,
      tags: true,
    });
  }

  private createExitBox(): blessed.Widgets.BoxElement {
    return blessed.box({
      bottom: 0,
      left: 0,
      width: "100%",
      height: 1,
      content: 'Use ↑/↓ arrows to scroll skills, "q" to exit',
      style: {
        fg: "gray",
        bg: "black",
      },
    });
  }

  // Handle keyboard navigation and exit
  private setupEventHandlers() {
    this.screen.key(["q", "C-c"], () => {
      this.screen.destroy();
      process.exit(0);
    });
  }

  show() {
    this.screen.render();
  }
}
