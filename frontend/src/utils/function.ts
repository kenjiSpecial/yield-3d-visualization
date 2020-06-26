import { store } from '../store';
import { IYieldCurve } from '../store/app';
import { startDate, grid, initStartYield, scaleYield, endDate, yieldValues } from './constants';
import { IPlot } from '../components/types/type';
import { BufferGeometry, BufferAttribute } from 'three';

export function getUrlParameter(name: string) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	var regex = new RegExp('[\\?&]' + name);
	var results = regex.exec(location.search);
	return results === null ? false : true;
}

export function parseData(yieldCurve: IYieldCurve[]) {
	const output: IPlot[] = [];

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
				date: yieldCurveItem.date,
				yearRate: yearRate,
				yield: [
					yieldCurveItem.m1 === null || isNaN(Number(yieldCurveItem.m1))
						? null
						: Number(yieldCurveItem.m1),
					yieldCurveItem.m2 === null || isNaN(Number(yieldCurveItem.m2))
						? null
						: Number(yieldCurveItem.m2),
					yieldCurveItem.m3 === null || isNaN(Number(yieldCurveItem.m3))
						? null
						: Number(yieldCurveItem.m3),
					yieldCurveItem.m6 === null || isNaN(Number(yieldCurveItem.m6))
						? null
						: Number(yieldCurveItem.m6),
					yieldCurveItem.y1 === null || isNaN(Number(yieldCurveItem.y1))
						? null
						: Number(yieldCurveItem.y1),
					yieldCurveItem.y3 === null || isNaN(Number(yieldCurveItem.y3))
						? null
						: Number(yieldCurveItem.y3),
					yieldCurveItem.y5 === null || isNaN(Number(yieldCurveItem.y5))
						? null
						: Number(yieldCurveItem.y5),
					yieldCurveItem.y7 === null || isNaN(Number(yieldCurveItem.y7))
						? null
						: Number(yieldCurveItem.y7),
					yieldCurveItem.y10 === null || isNaN(Number(yieldCurveItem.y10))
						? null
						: Number(yieldCurveItem.y10),
					yieldCurveItem.y20 === null || isNaN(Number(yieldCurveItem.y20))
						? null
						: Number(yieldCurveItem.y20),
					yieldCurveItem.y30 === null || isNaN(Number(yieldCurveItem.y30))
						? null
						: Number(yieldCurveItem.y30),
				],
			};

			output.push(data);
		}
	}
	output.sort((a: IPlot, b: IPlot) => {
		return a.yearRate - b.yearRate;
	});

	return output;
}

export function createLineGeometryData(plot: IPlot[], country: string) {
	// const date = [];
	const yieldSize = yieldValues.length;
	const yieldUnit = grid.x / (yieldSize - 1);
	const startX = grid.x * -0.5;

	let minY = 0;
	let maxY = 10;

	const yearRate =
		endDate.getFullYear() -
		startDate.getFullYear() +
		(endDate.getMonth() - startDate.getMonth()) / 12 +
		(endDate.getDay() - startDate.getDay()) / 365;
	const dateUnit = grid.z / yearRate;
	const startZ = grid.z * -0.5;
	// const faceData: { date: string; type: string }[] = [];

	// const inc = country == 'japan' || country == 'usa' ? 5 : 1;

	const outputData = {};

	for (const key in plot) {
		const dataByDate = plot[key];
		const yieldData = dataByDate.yield;
		const zpos = dataByDate.yearRate * dateUnit + startZ;

		const linePositionData = [];
		let prev = null;
		let prevX = null;
		let j = 0;
		for (const yieldItemData of yieldData) {
			const x = startX + j * yieldUnit;
			if (prev !== null && yieldItemData !== null) {
				const curYVal = ((yieldItemData - minY) / (maxY - minY)) * scaleYield;
				const prevYVal = ((prev - minY) / (maxY - minY)) * scaleYield;
				linePositionData.push(prevX, prevYVal, zpos, x, curYVal, zpos);
			}

			if (yieldItemData !== null) {
				prev = yieldItemData;
				prevX = x;
			}
			j++;
		}
		if (country == 'brazil') {
			// console.log(linePositionData);
		}
		const geometry = new BufferGeometry();
		geometry.setAttribute(
			'position',
			new BufferAttribute(new Float32Array(linePositionData), 3)
		);

		outputData[dataByDate.date] = geometry;
	}

	return outputData;
}

export function createGeometryData(plot: IPlot[], country: string) {
	const positions = [];
	const rates = [];

	const yieldSize = yieldValues.length;
	const yieldUnit = grid.x / (yieldSize - 1);
	const startX = grid.x * -0.5;

	let minY = 0;
	let maxY = 10;

	const yearRate =
		endDate.getFullYear() -
		startDate.getFullYear() +
		(endDate.getMonth() - startDate.getMonth()) / 12 +
		(endDate.getDay() - startDate.getDay()) / 365;
	const dateUnit = grid.z / yearRate;
	const startZ = grid.z * -0.5;
	const faceData: { date: string; type: string }[] = [];

	const inc = country == 'japan' || country == 'usa' ? 5 : 10;

	for (let ii = 0; ii < plot.length - inc; ii = ii + inc) {
		const plotItem = plot[ii];
		const curDate = plotItem.date;
		const nextPlotItem = plot[ii + inc];
		const nextDate = nextPlotItem.date;
		const yieldData = plotItem.yield;
		const nextYieldData = nextPlotItem.yield;
		const z0pos = plotItem.yearRate * dateUnit + startZ;
		const z1pos = nextPlotItem.yearRate * dateUnit + startZ;

		let startBtPt;
		let startBtPtY;
		let startBtValue;
		let startBtRate;
		let startBtType;
		let startTpPt;
		let startTpPtY;
		let startTpValue;
		let startTpRate;
		let startTpType;

		for (let j = yieldData.length - 1; j > -1; j--) {
			if (yieldData[j] !== null) {
				startTpPt = startX + j * yieldUnit;
				startTpValue = yieldData[j] as number;
				startTpRate = (startTpValue - minY) / (maxY - minY);
				startTpPtY = startTpRate * scaleYield;
				startTpType = yieldValues[j];
				break;
			}
		}

		for (let j = 0; j < nextYieldData.length; j++) {
			if (nextYieldData[j] !== null) {
				startBtPt = startX + j * yieldUnit;
				startBtValue = nextYieldData[j] as number;
				startBtRate = (startBtValue - minY) / (maxY - minY);
				startBtPtY = startBtRate * scaleYield;
				startBtType = yieldValues[j];
				break;
			}
		}

		let x0;
		let x1;
		let y0 = null;
		let y1 = null;
		let type0 = '';
		let type1 = '';
		for (let j = 0; j < yieldData.length; j++) {
			x1 = startX + j * yieldUnit;
			y1 = yieldData[j];
			type1 = yieldValues[j];

			if (y1 != null && y0 != null) {
				const rate0 = (y0 - minY) / (maxY - minY);
				const y0Val = rate0 * scaleYield;

				const rate1 = (y1 - minY) / (maxY - minY);
				const y1Val = rate1 * scaleYield;

				positions.push(x0, y0Val, z0pos, x1, y1Val, z0pos, startBtPt, startBtPtY, z1pos);
				rates.push(rate0, rate1, startBtRate);
				faceData.push({ date: curDate, type: type0 });
				faceData.push({ date: curDate, type: type1 });
				faceData.push({ date: nextDate, type: startBtType as string });
			}

			if (y1 != null) {
				x0 = x1;
				y0 = y1;
				type0 = type1;
			}
		}

		y0 = null;
		y1 = null;

		for (let j = 0; j < nextYieldData.length; j++) {
			x1 = startX + j * yieldUnit;
			y1 = nextYieldData[j];
			type1 = yieldValues[j];

			if (y1 != null && y0 != null) {
				const rate0 = (y0 - minY) / (maxY - minY);
				const y0Val = rate0 * scaleYield;

				const rate1 = (y1 - minY) / (maxY - minY);
				const y1Val = rate1 * scaleYield;

				positions.push(x1, y1Val, z1pos, x0, y0Val, z1pos, startTpPt, startTpPtY, z0pos);
				rates.push(rate1, rate0, startTpRate);
				faceData.push({ date: nextDate, type: type1 });
				faceData.push({ date: nextDate, type: type0 });
				faceData.push({ date: curDate, type: startTpType as string });
			}

			if (y1 != null) {
				x0 = x1;
				y0 = y1;
				type0 = type1;
			}
		}
	}

	return {
		position: new Float32Array(positions),
		rate: new Float32Array(rates),
		faceData: faceData,
	};
}
