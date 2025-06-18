// Interactive file browser for selecting PDF files
import * as blessed from "blessed";
import { readdirSync, statSync } from "node:fs";
import { join, resolve as pathResolve } from "node:path";
import { homedir } from "node:os";

export class FileSelector {
  private screen!: blessed.Widgets.Screen;
  private box!: blessed.Widgets.BoxElement;
  private fileList!: blessed.Widgets.ListElement;
  private currentDir: string;
  private title: string;
  private resolve!: (value: string) => void;
  private reject!: (reason: Error) => void;

  constructor(title: string) {
    this.title = title;
    this.currentDir = process.cwd();
    this.createUI();
  }

  // Create file browser interface
  private createUI() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: "CV Evaluation Tool",
    });

    this.box = blessed.box({
      top: 0,
      left: 0,
      width: "100%",
      height: 6,
      content: `${this.title}\nLoading directory...`,
      tags: true,
      border: { type: "line" },
      style: {
        fg: "white",
        bg: "blue",
        border: { fg: "#f0f0f0" },
      },
      wrap: false,
    });

    this.fileList = blessed.list({
      top: 6,
      left: 0,
      width: "100%",
      height: "100%-6",
      items: [],
      keys: true,
      vi: true,
      mouse: true,
      border: { type: "line" },
      style: {
        fg: "white",
        border: { fg: "#f0f0f0" },
        selected: { bg: "blue", fg: "white" },
      },
      scrollable: true,
      alwaysScroll: true,
    });

    this.setupEventHandlers();
    this.screen.append(this.box);
    this.screen.append(this.fileList);
    this.fileList.focus();
  }

  // Handle file selection and navigation
  private setupEventHandlers() {
    this.fileList.key(["enter"], () => {
      const selectedIndex = (this.fileList as any).selected || 0;
      const selected = this.fileList.getItem(selectedIndex);
      if (selected) {
        this.handleSelection(selected);
      }
    });

    this.fileList.key(["q", "C-c"], () => {
      this.screen.destroy();
      this.reject(new Error("File selection cancelled"));
    });

    this.fileList.key(["h"], () => {
      this.currentDir = homedir();
      this.updateFileList();
    });

    this.screen.key(["h"], () => {
      this.currentDir = homedir();
      this.updateFileList();
    });
  }

  private handleSelection(item: any) {
    const itemText = item.getText();

    if (itemText === "[DIR] ../") {
      this.currentDir = pathResolve(this.currentDir, "..");
      this.updateFileList();
    } else if (itemText.startsWith("[DIR] ")) {
      let dirName = itemText.slice(6);
      if (dirName.endsWith("/")) {
        dirName = dirName.slice(0, -1);
      }
      this.currentDir = join(this.currentDir, dirName);
      this.updateFileList();
    } else if (itemText.startsWith("[PDF] ")) {
      const fileName = itemText.slice(6);
      const filePath = join(this.currentDir, fileName);
      this.screen.destroy();
      this.resolve(filePath);
    }
  }

  // Scan directory and filter for PDF files and subdirectories
  private updateFileList() {
    try {
      const files = readdirSync(this.currentDir)
        .map((file) => {
          try {
            const fullPath = join(this.currentDir, file);
            const isDir = statSync(fullPath).isDirectory();
            const isPdf = file.toLowerCase().endsWith(".pdf");

            if (isDir) {
              return `[DIR] ${file}/`;
            } else if (isPdf) {
              return `[PDF] ${file}`;
            } else {
              return null;
            }
          } catch (error) {
            return null;
          }
        })
        .filter((item) => item !== null) as string[];

      const pdfFiles = files.filter((f) => f.startsWith("[PDF]")).sort();
      const dirFiles = files.filter((f) => f.startsWith("[DIR]")).sort();
      const sortedFiles: string[] = [];

      if (this.currentDir !== "/") {
        sortedFiles.push("[DIR] ../");
      }

      sortedFiles.push(...pdfFiles);
      sortedFiles.push(...dirFiles);

      this.fileList.setItems(sortedFiles);
      const pdfCount = pdfFiles.length;
      const shortDir =
        this.currentDir.length > 40
          ? "..." + this.currentDir.slice(-37)
          : this.currentDir;
      this.box.setContent(
        `${this.title}\nCurrent Directory: ${shortDir}\nFound ${pdfCount} PDF file(s)\nUse ↑/↓ arrows, Enter to select PDF, 'h' for home, 'q' to quit`,
      );
      this.screen.render();
    } catch (error) {
      this.fileList.setItems([`Error reading directory: ${error}`]);
      this.box.setContent(
        `${this.title}\nError: Cannot access directory\nPress 'h' for home, 'q' to quit`,
      );
      this.screen.render();
    }
  }

  show(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this.updateFileList();
      this.screen.render();
    });
  }
}