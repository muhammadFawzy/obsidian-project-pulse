import { MarkdownPostProcessorContext, TFile } from "obsidian";
import type ProjectPulsePlugin from "./main";
import { Dimension } from "./types";
import { getPresetById } from "./presets";
import { readPulseData } from "./frontmatter";

export function registerCodeBlock(plugin: ProjectPulsePlugin): void {
	plugin.registerMarkdownCodeBlockProcessor(
		"pulse",
		(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
			const filePath = ctx.sourcePath;
			const file = plugin.app.vault.getAbstractFileByPath(filePath);

			if (!(file instanceof TFile)) {
				el.createDiv({ cls: "pulse-empty", text: "Could not resolve file." });
				return;
			}

			const data = readPulseData(plugin.app, file);

			if (!data) {
				el.createDiv({ cls: "pulse-empty", text: "No pulse data found. Score this project first." });
				return;
			}

			const dimensions = getActiveDimensions(plugin);
			const container = el.createDiv({ cls: "pulse-scorecard" });

			for (const dim of dimensions) {
				const val = data.scores[dim.id];
				if (val === undefined) continue;

				const row = container.createDiv({ cls: "pulse-scorecard-row" });
				row.createSpan({ cls: "pulse-scorecard-label", text: dim.label });
				row.createSpan({ cls: "pulse-dots", text: formatDots(val) });
				row.createSpan({ cls: "pulse-dots-num", text: `${val}/5` });
			}
		}
	);
}

function getActiveDimensions(plugin: ProjectPulsePlugin): Dimension[] {
	const { activePreset, customDimensions } = plugin.settings;

	if (activePreset === "custom") {
		return customDimensions.filter((d) => d.id && d.label);
	}

	const preset = getPresetById(activePreset);
	return preset?.dimensions ?? [];
}

function formatDots(value: number): string {
	const filled = "●".repeat(value);
	const empty = "○".repeat(5 - value);
	return filled + empty;
}
