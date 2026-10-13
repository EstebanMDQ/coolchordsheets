import { Notice, Plugin } from "obsidian";
import { parseChordSheet } from "./parser";
import { renderSheet } from "./render";
import {
  applySettings,
  ChordSheetSettingTab,
  clearSettings,
  DEFAULT_SETTINGS,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  type ChordSheetSettings,
} from "./settings";

export const LANGUAGE = "chordsheet";

export default class ChordSheetPlugin extends Plugin {
  settings: ChordSheetSettings = { ...DEFAULT_SETTINGS };

  async onload(): Promise<void> {
    await this.loadSettings();
    applySettings(document, this.settings);

    try {
      this.registerMarkdownCodeBlockProcessor(LANGUAGE, (source, el) => this.renderBlock(source, el));
    } catch (err) {
      new Notice(`Cool Chord Sheets: could not register the "${LANGUAGE}" code block. ${describe(err)}`);
    }

    this.addSettingTab(new ChordSheetSettingTab(this.app, this));
  }

  onunload(): void {
    for (const doc of this.documents()) clearSettings(doc);
  }

  /** The main document plus the document of every pop-out window with an open leaf. */
  private documents(): Set<Document> {
    const docs = new Set<Document>([document]);
    this.app.workspace.iterateAllLeaves((leaf) => docs.add(leaf.view.containerEl.ownerDocument));
    return docs;
  }

  renderBlock(source: string, el: HTMLElement): void {
    // Pop-out windows have their own document, so settings must be applied there too.
    applySettings(el.ownerDocument, this.settings);
    try {
      const sheet = parseChordSheet(source);
      renderSheet(sheet, el.ownerDocument, el);
    } catch (err) {
      el.empty();
      el.createEl("pre", { text: source });
      el.createDiv({ cls: "ccs-render-error", text: `Chord sheet could not be rendered: ${describe(err)}` });
    }
  }

  async loadSettings(): Promise<void> {
    const stored = (await this.loadData()) as Partial<ChordSheetSettings> | null;
    this.settings = { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
    const size = Number(this.settings.fontSize);
    this.settings.fontSize = Number.isFinite(size)
      ? Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, Math.round(size)))
      : DEFAULT_SETTINGS.fontSize;
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    for (const doc of this.documents()) applySettings(doc, this.settings);
  }
}

function describe(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
