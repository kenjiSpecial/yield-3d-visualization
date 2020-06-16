import { store } from '../store';
import { IYieldCurve } from '../store/app';
import { startDate, grid, initStartYield, scaleYield, endDate } from './constants';
import { IPlot } from '../components/types/type';

export function getUrlParameter(name: string) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	var regex = new RegExp('[\\?&]' + name);
	var results = regex.exec(location.search);
	return results === null ? false : true;
}

export function parseData(yieldCurve: IYieldCurve[]) {
	// console.log(yieldCurve);
	const output: IPlot[] = [];
	console.log(yieldCurve[0]);

	for (let ii = 0; ii < yieldCurve.length; ii++) {
		const yieldCurveItem = yieldCurve[ii];
		const date = new Date(yieldCurveItem.date);
		const fullYear = date.getFullYear();
		const yearIndex = fullYear - startDate.getFullYear();
		const curYear = new Date(fullYear, 0, 1);
		const nextYear = new Date(fullYear + 1, 0, 1);

		const monthDayRate =
			(date.getTime() - curYear.getTime()) / (nextYear.getTime() - curYear.getTime());

		const yearRate = yearIndex + monthDayRate;
		// console.log({ dateRate });
		if (
			yieldCurveItem.m1 !== null ||
			yieldCurveItem.m2 !== null ||
			yieldCurveItem.m3 !== null ||
			yieldCurveItem.m6 !== null ||
			yieldCurveItem.y1 !== null ||
			yieldCurveItem.y3 !== null ||
			yieldCurveItem.y5 !== null ||
			yieldCurveItem.y7 !== null ||
			yieldCurveItem.y10 !== null ||
			yieldCurveItem.y20 !== null ||
			yieldCurveItem.y30 !== null
		) {
			const data = {
				yearRate: yearRate,
				yield: [
					yieldCurveItem.m1 === null ? null : Number(yieldCurveItem.m1),
					yieldCurveItem.m2 === null ? null : Number(yieldCurveItem.m2),
					yieldCurveItem.m3 === null ? null : Number(yieldCurveItem.m3),
					yieldCurveItem.m6 === null ? null : Number(yieldCurveItem.m6),
					yieldCurveItem.y1 === null ? null : Number(yieldCurveItem.y1),
					yieldCurveItem.y3 === null ? null : Number(yieldCurveItem.y3),
					yieldCurveItem.y5 === null ? null : Number(yieldCurveItem.y5),
					yieldCurveItem.y7 === null ? null : Number(yieldCurveItem.y7),
					yieldCurveItem.y10 === null ? null : Number(yieldCurveItem.y10),
					yieldCurveItem.y20 === null ? null : Number(yieldCurveItem.y20),
					yieldCurveItem.y30 === null ? null : Number(yieldCurveItem.y30),
				],
			};

			output.push(data);
		}
	}

	// console.log(data);
	output.sort((a: IPlot, b: IPlot) => {
		return a.yearRate - b.yearRate;
	});

	return output;
}

export function createGeometryData(plot: IPlot[]) {
	const positions = [];
	const rates = [];

	const yieldSize = 11;
	const yieldUnit = grid.x / (yieldSize - 1);
	const startX = grid.x * -0.5;

	let minY = 9999;
	let maxY = -9999;

	for (const plotItem of plot) {
		for (const yiledItem of plotItem.yield) {
			if (yiledItem !== null) {
				if (minY > yiledItem) {
					minY = yiledItem;
				}
				if (maxY < yiledItem) {
					maxY = yiledItem;
				}
			}
		}
	}

	// const dateSize = maxZ - minZ;
	// const dateSize = g
	const yearRate =
		endDate.getFullYear() -
		startDate.getFullYear() +
		(endDate.getMonth() - startDate.getMonth()) / 12 +
		(endDate.getMonth() - startDate.getMonth()) / 30;
	const dateUnit = grid.z / yearRate;
	const startZ = grid.z * -0.5;

	for (let ii = 0; ii < plot.length - 1; ii++) {
		const plotItem = plot[ii];
		const nextPlotItem = plot[ii + 1];
		const yieldData = plotItem.yield;
		const nextYieldData = nextPlotItem.yield;
		const z0pos = plotItem.yearRate * dateUnit + startZ;
		const z1pos = nextPlotItem.yearRate * dateUnit + startZ;
		let yi00Data = yieldData[0];
		let yi01Data = nextYieldData[0];
		let x00pos = startX;
		let x01pos = startX;
		console.log(yieldData);

		for (let jj = 0; jj < yieldData.length - 1; jj++) {
			const yi10Data = yieldData[jj + 1];
			const x10pos = startX + yieldUnit * (jj + 1);
			const yi11Data = nextYieldData[jj + 1];
			const x11pos = startX + yieldUnit * (jj + 1);

			if (yi00Data == null || yi10Data == null || yi01Data == null || yi11Data == null) {
			} else {
				const rate00 = (yi00Data - minY) / (maxY - minY);
				const y00Value = rate00 * scaleYield;
				const rate10 = (yi10Data - minY) / (maxY - minY);
				const y10Value = rate10 * scaleYield;
				const rate01 = (yi01Data - minY) / (maxY - minY);
				const y01Value = rate01 * scaleYield;
				const rate11 = (yi11Data - minY) / (maxY - minY);
				const y11Value = rate11 * scaleYield;

				positions.push(x00pos, y00Value, z0pos);
				positions.push(x01pos, y01Value, z1pos);
				positions.push(x10pos, y10Value, z0pos);
				rates.push(rate00, rate01, rate10);

				positions.push(x10pos, y10Value, z0pos);
				positions.push(x01pos, y01Value, z1pos);
				positions.push(x11pos, y11Value, z1pos);
				rates.push(rate10, rate01, rate11);
			}

			if (yi10Data !== null) {
				x00pos = x10pos;
				yi00Data = yi10Data;
			}

			if (yi11Data !== null) {
				x01pos = x11pos;
				yi01Data = yi11Data;
			}
		}
	}

	return {
		position: new Float32Array(positions),
		rate: new Float32Array(rates),
	};
}
