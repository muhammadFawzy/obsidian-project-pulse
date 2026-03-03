import { Plugin } from "obsidian";
import { ProjectPulseSettings, DEFAULT_SETTINGS } from "./types";
import { ProjectPulseSettingTab } from "./settings";
import { ScoringModal } from "./scoring-modal";
import { DashboardView, DASHBOARD_VIEW_TYPE } from "./dashboard-view";
import { registerCodeBlock } from "./code-block";

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

		// Dashboard view
		this.registerView(
			DASHBOARD_VIEW_TYPE,
			(leaf) => new DashboardView(leaf, this)
		);

		this.addCommand({
			id: "open-dashboard",
			name: "Open dashboard",
			callback: () => this.activateDashboard(),
		});

		this.addRibbonIcon("activity", "Project Pulse", () => {
			this.activateDashboard();
		});

		registerCodeBlock(this);
	}

	onunload(): void {
		this.app.workspace.detachLeavesOfType(DASHBOARD_VIEW_TYPE);
	}

	private async activateDashboard(): Promise<void> {
		this.app.workspace.detachLeavesOfType(DASHBOARD_VIEW_TYPE);

		const leaf = this.app.workspace.getRightLeaf(false);
		if (leaf) {
			await leaf.setViewState({
				type: DASHBOARD_VIEW_TYPE,
				active: true,
			});
			this.app.workspace.revealLeaf(leaf);
		}
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
