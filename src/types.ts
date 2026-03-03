export interface Dimension {
	id: string;
	label: string;
	description?: string;
}

export interface DimensionPreset {
	id: string;
	name: string;
	dimensions: Dimension[];
}

export interface PulseScore {
	preset: string;
	scores: Record<string, number>;
	last_updated: string;
}

export interface ProjectPulseSettings {
	activePreset: string;
	customDimensions: Dimension[];
	targetFolders: string[];
}

export const DEFAULT_SETTINGS: ProjectPulseSettings = {
	activePreset: "default",
	customDimensions: [],
	targetFolders: [],
};
