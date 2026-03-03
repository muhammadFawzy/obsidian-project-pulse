import { DimensionPreset } from "./types";

export const PRESETS: DimensionPreset[] = [
	{
		id: "default",
		name: "Default",
		dimensions: [
			{ id: "energy", label: "Energy", description: "How much energy does this project give or take?" },
			{ id: "impact", label: "Impact", description: "How meaningful is the outcome?" },
			{ id: "learning", label: "Learning", description: "How much are you learning?" },
			{ id: "enjoyment", label: "Enjoyment", description: "How fun is it to work on?" },
			{ id: "growth", label: "Growth", description: "Does it stretch your skills or career?" },
		],
	},
	{
		id: "staff-engineer",
		name: "Staff Engineer",
		dimensions: [
			{ id: "impact", label: "Impact", description: "Business or org-level impact" },
			{ id: "complexity", label: "Complexity", description: "Technical and organizational complexity" },
			{ id: "urgency", label: "Urgency", description: "Time sensitivity and stakeholder pressure" },
			{ id: "team-growth", label: "Team Growth", description: "Does it grow the team's capabilities?" },
			{ id: "technical-debt", label: "Technical Debt", description: "Does it reduce or increase tech debt?" },
		],
	},
	{
		id: "freelancer",
		name: "Freelancer",
		dimensions: [
			{ id: "revenue", label: "Revenue", description: "Direct or indirect income potential" },
			{ id: "client-satisfaction", label: "Client Satisfaction", description: "How happy is the client?" },
			{ id: "learning", label: "Learning", description: "New skills or knowledge gained" },
			{ id: "scalability", label: "Scalability", description: "Can this lead to recurring or bigger work?" },
			{ id: "enjoyment", label: "Enjoyment", description: "Do you enjoy working on it?" },
		],
	},
];

export function getPresetById(id: string): DimensionPreset | undefined {
	return PRESETS.find((p) => p.id === id);
}
