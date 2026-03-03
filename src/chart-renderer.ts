import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";
import { Dimension } from "./types";

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export interface ChartDataset {
	label: string;
	scores: Record<string, number>;
}

const COLORS = [
	{ bg: "rgba(99, 132, 255, 0.2)", border: "rgba(99, 132, 255, 1)" },
	{ bg: "rgba(255, 99, 132, 0.2)", border: "rgba(255, 99, 132, 1)" },
	{ bg: "rgba(75, 192, 132, 0.2)", border: "rgba(75, 192, 132, 1)" },
	{ bg: "rgba(255, 206, 86, 0.2)", border: "rgba(255, 206, 86, 1)" },
];

export function renderRadarChart(
	container: HTMLElement,
	datasets: ChartDataset[],
	dimensions: Dimension[]
): Chart {
	const canvas = container.createEl("canvas");

	const chartDatasets = datasets.map((ds, i) => {
		const color = COLORS[i % COLORS.length]!;
		return {
			label: ds.label,
			data: dimensions.map((dim) => ds.scores[dim.id] ?? 0),
			backgroundColor: color.bg,
			borderColor: color.border,
			borderWidth: 2,
			pointBackgroundColor: color.border,
			pointRadius: 3,
		};
	});

	return new Chart(canvas, {
		type: "radar",
		data: {
			labels: dimensions.map((d) => d.label),
			datasets: chartDatasets,
		},
		options: {
			responsive: true,
			maintainAspectRatio: true,
			scales: {
				r: {
					min: 0,
					max: 5,
					ticks: {
						stepSize: 1,
						display: false,
					},
					pointLabels: {
						font: { size: 12 },
					},
				},
			},
			plugins: {
				legend: {
					display: datasets.length > 1,
					position: "bottom",
				},
			},
		},
	});
}
