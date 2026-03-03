import { App, TFile } from "obsidian";
import { PulseScore } from "./types";

export function readPulseData(app: App, file: TFile): PulseScore | null {
	const cache = app.metadataCache.getFileCache(file);
	const pulse = cache?.frontmatter?.["pulse"];

	if (!pulse || typeof pulse !== "object") {
		return null;
	}

	return {
		preset: pulse.preset ?? "default",
		scores: pulse.scores ?? {},
		last_updated: pulse.last_updated ?? "",
	};
}

export async function writePulseData(
	app: App,
	file: TFile,
	data: PulseScore
): Promise<void> {
	await app.fileManager.processFrontMatter(file, (frontmatter) => {
		frontmatter["pulse"] = {
			preset: data.preset,
			scores: data.scores,
			last_updated: data.last_updated,
		};
	});
}
