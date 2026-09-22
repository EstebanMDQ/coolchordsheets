import { App, PluginSettingTab, Setting } from "obsidian";
import type ChordSheetPlugin from "./main";

export interface ChordSheetSettings {
  fontSize: number;
  showHolds: boolean;
  showUneven: boolean;
}

export const DEFAULT_SETTINGS: ChordSheetSettings = {
  fontSize: 16,
  showHolds: false,
  showUneven: true,
};

export const FONT_SIZE_MIN = 10;
export const FONT_SIZE_MAX = 32;

/** Applies settings as a CSS variable and body classes so open charts update without a re-render. */
export function applySettings(doc: Document, settings: ChordSheetSettings): void {
  doc.body.style.setProperty("--ccs-font-size", `${settings.fontSize}px`);
  doc.body.classList.toggle("ccs-show-holds", settings.showHolds);
  doc.body.classList.toggle("ccs-show-uneven", settings.showUneven);
}

export function clearSettings(doc: Document): void {
  doc.body.style.removeProperty("--ccs-font-size");
  doc.body.classList.remove("ccs-show-holds", "ccs-show-uneven");
}

export class ChordSheetSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: ChordSheetPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Chord font size")
      .setDesc(`Pixels, ${FONT_SIZE_MIN} to ${FONT_SIZE_MAX}.`)
      .addSlider((slider) =>
        slider
          .setLimits(FONT_SIZE_MIN, FONT_SIZE_MAX, 1)
          .setValue(this.plugin.settings.fontSize)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.fontSize = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Show holds")
      .setDesc("Draw a small dot where a chord is held for an extra slot.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.showHolds).onChange(async (value) => {
          this.plugin.settings.showHolds = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Mark uneven bars")
      .setDesc("Dotted top edge on bars whose slot count does not fit the time signature.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.showUneven).onChange(async (value) => {
          this.plugin.settings.showUneven = value;
          await this.plugin.saveSettings();
        })
      );
  }
}
