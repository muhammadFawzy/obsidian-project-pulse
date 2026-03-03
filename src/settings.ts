import { App, PluginSettingTab, Setting } from "obsidian";
import type ProjectPulsePlugin from "./main";
import { PRESETS } from "./presets";

export class ProjectPulseSettingTab extends PluginSettingTab {
	plugin: ProjectPulsePlugin;

	constructor(app: App, plugin: ProjectPulsePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Preset selector
		const presetOptions: Record<string, string> = {};
		for (const preset of PRESETS) {
			presetOptions[preset.id] = preset.name;
		}
		presetOptions["custom"] = "Custom";

		new Setting(containerEl)
			.setName("Dimension preset")
			.setDesc("Choose a built-in preset or define custom dimensions.")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(presetOptions)
					.setValue(this.plugin.settings.activePreset)
					.onChange(async (value) => {
						this.plugin.settings.activePreset = value;
						await this.plugin.saveSettings();
						this.display(); // re-render to show/hide custom section
					})
			);

		// Custom dimensions (only when "custom" is selected)
		if (this.plugin.settings.activePreset === "custom") {
			new Setting(containerEl)
				.setName("Custom dimensions")
				.setHeading();

			this.plugin.settings.customDimensions.forEach((dim, index) => {
				new Setting(containerEl)
					.setName(`Dimension ${index + 1}`)
					.addText((text) =>
						text
							.setPlaceholder("Label")
							.setValue(dim.label)
							.onChange(async (value) => {
								dim.label = value;
								dim.id = value.toLowerCase().replace(/\s+/g, "-");
								await this.plugin.saveSettings();
							})
					)
					.addText((text) =>
						text
							.setPlaceholder("Description (optional)")
							.setValue(dim.description ?? "")
							.onChange(async (value) => {
								dim.description = value || undefined;
								await this.plugin.saveSettings();
							})
					)
					.addButton((btn) =>
						btn.setButtonText("Remove").onClick(async () => {
							this.plugin.settings.customDimensions.splice(index, 1);
							await this.plugin.saveSettings();
							this.display();
						})
					);
			});

			new Setting(containerEl).addButton((btn) =>
				btn.setButtonText("Add dimension").onClick(async () => {
					this.plugin.settings.customDimensions.push({
						id: "",
						label: "",
					});
					await this.plugin.saveSettings();
					this.display();
				})
			);
		}

		// Target folders
		new Setting(containerEl)
			.setName("Target folders")
			.setDesc(
				"Comma-separated folder paths to scan for projects. Leave empty to scan all."
			)
			.addText((text) =>
				text
					.setPlaceholder("Projects, Work/active")
					.setValue(this.plugin.settings.targetFolders.join(", "))
					.onChange(async (value) => {
						this.plugin.settings.targetFolders = value
							.split(",")
							.map((f) => f.trim())
							.filter((f) => f.length > 0);
						await this.plugin.saveSettings();
					})
			);
	}
}
