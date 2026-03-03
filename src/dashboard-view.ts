import { ItemView, WorkspaceLeaf, TFile } from "obsidian";
import type ProjectPulsePlugin from "./main";
import { Dimension, PulseScore } from "./types";
import { getPresetById } from "./presets";
import { readPulseData } from "./frontmatter";

export const DASHBOARD_VIEW_TYPE = "project-pulse-dashboard";

interface ScoredProject {
	file: TFile;
	data: PulseScore;
}

export class DashboardView extends ItemView {
	private plugin: ProjectPulsePlugin;
	private sortColumn = "name";
	private sortAsc = true;
	private folderFilter = "";

	constructor(leaf: WorkspaceLeaf, plugin: ProjectPulsePlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return DASHBOARD_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Project Pulse";
	}

	getIcon(): string {
		return "activity";
	}

	async onOpen(): Promise<void> {
		this.refresh();
	}

	async onClose(): Promise<void> {
		this.contentEl.empty();
	}

	refresh(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("pulse-dashboard");

		const projects = this.getScoredProjects();
		const dimensions = this.getActiveDimensions();

		// Header
		contentEl.createEl("h2", { text: "Project Pulse" });

		// Folder filter
		this.renderFolderFilter(contentEl, projects);

		// Filter by folder
		const filtered = this.filterByFolder(projects);

		if (filtered.length === 0) {
			contentEl.createDiv({ cls: "pulse-empty", text: "No scored projects found." });
			return;
		}

		// Summary cards
		this.renderSummaryCards(contentEl, filtered, dimensions);

		// Sortable table
		this.renderTable(contentEl, filtered, dimensions);
	}

	private getScoredProjects(): ScoredProject[] {
		const files = this.app.vault.getMarkdownFiles();
		const projects: ScoredProject[] = [];

		for (const file of files) {
			const data = readPulseData(this.app, file);
			if (data) {
				projects.push({ file, data });
			}
		}

		return projects;
	}

	private getActiveDimensions(): Dimension[] {
		const { activePreset, customDimensions } = this.plugin.settings;

		if (activePreset === "custom") {
			return customDimensions.filter((d) => d.id && d.label);
		}

		const preset = getPresetById(activePreset);
		return preset?.dimensions ?? [];
	}

	private filterByFolder(projects: ScoredProject[]): ScoredProject[] {
		const { targetFolders } = this.plugin.settings;

		let filtered = projects;

		// Apply target folder settings
		if (targetFolders.length > 0) {
			filtered = filtered.filter((p) =>
				targetFolders.some((folder) => p.file.path.startsWith(folder))
			);
		}

		// Apply UI folder filter
		if (this.folderFilter) {
			filtered = filtered.filter((p) =>
				p.file.path.startsWith(this.folderFilter)
			);
		}

		return filtered;
	}

	private renderFolderFilter(container: HTMLElement, projects: ScoredProject[]): void {
		const folders = new Set<string>();
		for (const p of projects) {
			const parts = p.file.path.split("/");
			if (parts.length > 1) {
				folders.add(parts.slice(0, -1).join("/"));
			}
		}

		if (folders.size === 0) return;

		const row = container.createDiv({ cls: "pulse-filter-row" });
		row.createSpan({ text: "Folder: " });

		const select = row.createEl("select", { cls: "pulse-folder-filter" });
		select.createEl("option", { text: "All", value: "" });
		for (const folder of [...folders].sort()) {
			select.createEl("option", { text: folder, value: folder });
		}
		select.value = this.folderFilter;

		select.addEventListener("change", () => {
			this.folderFilter = select.value;
			this.refresh();
		});
	}

	private renderSummaryCards(
		container: HTMLElement,
		projects: ScoredProject[],
		dimensions: Dimension[]
	): void {
		const row = container.createDiv({ cls: "pulse-summary-row" });

		// Total count
		const countCard = row.createDiv({ cls: "pulse-summary-card" });
		countCard.createDiv({ cls: "pulse-summary-value", text: String(projects.length) });
		countCard.createDiv({ cls: "pulse-summary-label", text: "Scored Projects" });

		// Average score
		const avg = this.computeOverallAverage(projects, dimensions);
		const avgCard = row.createDiv({ cls: "pulse-summary-card" });
		avgCard.createDiv({ cls: "pulse-summary-value", text: avg.toFixed(1) });
		avgCard.createDiv({ cls: "pulse-summary-label", text: "Avg Score" });

		// Most recent
		const mostRecent = projects.reduce((latest, p) =>
			p.data.last_updated > latest.data.last_updated ? p : latest
		);
		const recentCard = row.createDiv({ cls: "pulse-summary-card" });
		recentCard.createDiv({
			cls: "pulse-summary-value",
			text: mostRecent.file.basename,
		});
		recentCard.createDiv({
			cls: "pulse-summary-label",
			text: mostRecent.data.last_updated,
		});
	}

	private computeOverallAverage(projects: ScoredProject[], dimensions: Dimension[]): number {
		if (projects.length === 0) return 0;

		let total = 0;
		let count = 0;

		for (const p of projects) {
			for (const dim of dimensions) {
				const val = p.data.scores[dim.id];
				if (val !== undefined) {
					total += val;
					count++;
				}
			}
		}

		return count > 0 ? total / count : 0;
	}

	private getProjectAverage(data: PulseScore, dimensions: Dimension[]): number {
		let total = 0;
		let count = 0;
		for (const dim of dimensions) {
			const val = data.scores[dim.id];
			if (val !== undefined) {
				total += val;
				count++;
			}
		}
		return count > 0 ? total / count : 0;
	}

	private renderTable(
		container: HTMLElement,
		projects: ScoredProject[],
		dimensions: Dimension[]
	): void {
		const sorted = this.sortProjects(projects, dimensions);

		const table = container.createEl("table", { cls: "pulse-table" });

		// Header
		const thead = table.createEl("thead");
		const headerRow = thead.createEl("tr");

		this.createSortableHeader(headerRow, "Project", "name");
		for (const dim of dimensions) {
			this.createSortableHeader(headerRow, dim.label, dim.id);
		}
		this.createSortableHeader(headerRow, "Avg", "avg");
		this.createSortableHeader(headerRow, "Updated", "updated");

		// Body
		const tbody = table.createEl("tbody");
		for (const project of sorted) {
			const row = tbody.createEl("tr");

			// Project name (clickable)
			const nameCell = row.createEl("td");
			const link = nameCell.createEl("a", {
				cls: "pulse-project-link",
				text: project.file.basename,
			});
			link.addEventListener("click", (e) => {
				e.preventDefault();
				this.app.workspace.getLeaf(false).openFile(project.file);
			});

			// Dimension scores
			for (const dim of dimensions) {
				const val = project.data.scores[dim.id];
				const cell = row.createEl("td");
				if (val !== undefined) {
					cell.createSpan({ cls: "pulse-dots", text: formatDots(val) });
					cell.createSpan({ cls: "pulse-dots-num", text: ` ${val}/5` });
				} else {
					cell.textContent = "—";
				}
			}

			// Average
			const avg = this.getProjectAverage(project.data, dimensions);
			row.createEl("td", { text: avg.toFixed(1) });

			// Last updated
			row.createEl("td", { text: project.data.last_updated });
		}
	}

	private createSortableHeader(row: HTMLElement, label: string, column: string): void {
		const th = row.createEl("th");
		let display = label;
		if (this.sortColumn === column) {
			display += this.sortAsc ? " ↑" : " ↓";
		}
		th.textContent = display;
		th.addEventListener("click", () => {
			if (this.sortColumn === column) {
				this.sortAsc = !this.sortAsc;
			} else {
				this.sortColumn = column;
				this.sortAsc = true;
			}
			this.refresh();
		});
	}

	private sortProjects(projects: ScoredProject[], dimensions: Dimension[]): ScoredProject[] {
		const sorted = [...projects];
		const dir = this.sortAsc ? 1 : -1;

		sorted.sort((a, b) => {
			let cmp = 0;
			if (this.sortColumn === "name") {
				cmp = a.file.basename.localeCompare(b.file.basename);
			} else if (this.sortColumn === "avg") {
				cmp = this.getProjectAverage(a.data, dimensions) - this.getProjectAverage(b.data, dimensions);
			} else if (this.sortColumn === "updated") {
				cmp = a.data.last_updated.localeCompare(b.data.last_updated);
			} else {
				// Dimension column
				const valA = a.data.scores[this.sortColumn] ?? 0;
				const valB = b.data.scores[this.sortColumn] ?? 0;
				cmp = valA - valB;
			}
			return cmp * dir;
		});

		return sorted;
	}
}

function formatDots(value: number): string {
	const filled = "●".repeat(value);
	const empty = "○".repeat(5 - value);
	return filled + empty;
}
