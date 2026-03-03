import { Plugin } from "obsidian";
import { ProjectPulseSettings, DEFAULT_SETTINGS } from "./types";
import { ProjectPulseSettingTab } from "./settings";
import { ScoringModal } from "./scoring-modal";

export default class ProjectPulsePlugin extends Plugin {
	settings: ProjectPulseSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addSettingTab(new ProjectPulseSettingTab(this.app, this));

		this.addCommand({
			id: "score-project",
			name: "Score this project",
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveFile();
				if (file) {
					if (!checking) {
						new ScoringModal(this.app, this, file).open();
					}
					return true;
				}
				return false;
			},
		});

		// Phase 3: dashboard sidebar view
		// Phase 4: pulse-radar code block processor
	}

	onunload(): void {
		// cleanup
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
