import { App, Modal, TFile } from "obsidian";
import type ProjectPulsePlugin from "./main";
import { Dimension } from "./types";
import { getPresetById } from "./presets";
import { readPulseData, writePulseData } from "./frontmatter";

export class ScoringModal extends Modal {
	private plugin: ProjectPulsePlugin;
	private file: TFile;
	private sliders: Map<string, HTMLInputElement> = new Map();

	constructor(app: App, plugin: ProjectPulsePlugin, file: TFile) {
		super(app);
		this.plugin = plugin;
		this.file = file;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.addClass("pulse-modal");

		contentEl.createEl("h2", { text: `Score: ${this.file.basename}` });

		const dimensions = this.getActiveDimensions();
		const existing = readPulseData(this.app, this.file);

		for (const dim of dimensions) {
			const row = contentEl.createDiv({ cls: "pulse-slider-row" });

			const labelEl = row.createDiv({ cls: "pulse-slider-label" });
			labelEl.createSpan({ text: dim.label });
			if (dim.description) {
				labelEl.setAttribute("title", dim.description);
			}

			const slider = row.createEl("input", { cls: "pulse-slider" });
			slider.type = "range";
			slider.min = "1";
			slider.max = "5";
			slider.step = "1";
			slider.value = String(existing?.scores[dim.id] ?? 3);

			const valueDisplay = row.createSpan({ cls: "pulse-slider-value" });
			valueDisplay.textContent = slider.value;

			slider.addEventListener("input", () => {
				valueDisplay.textContent = slider.value;
			});

			this.sliders.set(dim.id, slider);
		}

		const btnRow = contentEl.createDiv({ cls: "pulse-btn-row" });
		const saveBtn = btnRow.createEl("button", {
			text: "Save",
			cls: "pulse-save-btn mod-cta",
		});
		saveBtn.addEventListener("click", () => void this.save());
	}

	onClose(): void {
		this.contentEl.empty();
		this.sliders.clear();
	}

	private getActiveDimensions(): Dimension[] {
		const { activePreset, customDimensions } = this.plugin.settings;

		if (activePreset === "custom") {
			return customDimensions.filter((d) => d.id && d.label);
		}

		const preset = getPresetById(activePreset);
		return preset?.dimensions ?? [];
	}

	private async save(): Promise<void> {
		const scores: Record<string, number> = {};
		for (const [id, slider] of this.sliders) {
			scores[id] = parseInt(slider.value, 10);
		}

		const now = new Date().toISOString();

		await writePulseData(this.app, this.file, {
			preset: this.plugin.settings.activePreset,
			scores,
			last_updated: now,
		});

		this.close();
	}
}
