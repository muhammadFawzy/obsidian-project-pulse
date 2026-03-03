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
		id: "software-engineer",
		name: "Software Engineer",
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
	{
		id: "student",
		name: "Student",
		dimensions: [
			{ id: "difficulty", label: "Difficulty", description: "How challenging is this project?" },
			{ id: "relevance", label: "Relevance", description: "How relevant is it to your goals or major?" },
			{ id: "deadline-pressure", label: "Deadline Pressure", description: "How tight is the timeline?" },
			{ id: "interest", label: "Interest", description: "How interested are you in the topic?" },
			{ id: "grade-impact", label: "Grade Impact", description: "How much does it affect your grade?" },
		],
	},
	{
		id: "creator",
		name: "Creator",
		dimensions: [
			{ id: "audience-reach", label: "Audience Reach", description: "How many people will this reach?" },
			{ id: "originality", label: "Originality", description: "How unique or novel is this?" },
			{ id: "monetization", label: "Monetization", description: "Can this generate income?" },
			{ id: "enjoyment", label: "Enjoyment", description: "How fun is it to create?" },
			{ id: "effort", label: "Effort", description: "How much work does it require?" },
		],
	},
	{
		id: "manager",
		name: "Manager",
		dimensions: [
			{ id: "team-impact", label: "Team Impact", description: "How much does it help the team?" },
			{ id: "urgency", label: "Urgency", description: "How time-sensitive is this?" },
			{ id: "strategic-alignment", label: "Strategic Alignment", description: "Does it align with org goals?" },
			{ id: "resource-cost", label: "Resource Cost", description: "How many resources does it consume?" },
			{ id: "visibility", label: "Visibility", description: "How visible is this to leadership?" },
		],
	},
];

export function getPresetById(id: string): DimensionPreset | undefined {
	return PRESETS.find((p) => p.id === id);
}
