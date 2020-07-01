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
	const yieldSize = yieldValues.length;
	const yieldUnit = grid.x / (yieldSize - 1);
	const startX = grid.x * -0.5;
	const yearRate =
		endDate.getFullYear() -
		startDate.getFullYear() +
		(endDate.getMonth() - startDate.getMonth()) / 12 +
		(endDate.getDay() - startDate.getDay()) / 365;
	const dateUnit = grid.z / yearRate;
	const startZ = grid.z * -0.5;
	const lineGeometrylist = {};
	let minY = 0;
	let maxY = 10;
	const dataByType: { z: number; value: number | null }[][] = [];

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
			if (!dataByType[j]) {
				dataByType[j] = [];
			}

			dataByType[j].push({ z: zpos, value: yieldItemData });

			j++;
		}

		const geometry = new BufferGeometry();
		geometry.setAttribute(
			'position',
			new BufferAttribute(new Float32Array(linePositionData), 3)
		);

		lineGeometrylist[dataByDate.date] = geometry;
	}

	// console.log(dataByType);

	for (let ii = 0; ii < yieldValues.length; ii++) {
		const typeData = dataByType[ii];
		const xpos = startX + ii * yieldUnit;

		const linePositionData = [];
		let prev = null;
		let prevz = null;

		for (let j = 0; j < typeData.length; j++) {
			const typeDataItem = typeData[j];
			const yieldItemData = typeDataItem.value;
			const zpos = typeDataItem.z;
			if (prev !== null && yieldItemData !== null) {
				const curYVal = ((yieldItemData - minY) / (maxY - minY)) * scaleYield;
				const prevYVal = ((prev - minY) / (maxY - minY)) * scaleYield;
				linePositionData.push(xpos, prevYVal, zpos, xpos, curYVal, zpos);
			}

			prev = yieldItemData;
			prevz = zpos;
		}

		const geometry = new BufferGeometry();
		geometry.setAttribute(
			'position',
			new BufferAttribute(new Float32Array(linePositionData), 3)
		);
		lineGeometrylist[yieldValues[ii]] = geometry;
	}

	return { lineGeometrylist };
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

	const inc = country == 'japan' || country == 'usa' ? 5 : 1;

	for (let ii = 0; ii < plot.length - inc; ii = inc + ii) {
		const plotItem = plot[ii];
		const nextPlotItem = plot[ii + inc];
		const yieldData = plotItem.yield;
		const nextYieldData = nextPlotItem.yield;
		const z0pos = plotItem.yearRate * dateUnit + startZ;
		const z1pos = nextPlotItem.yearRate * dateUnit + startZ;
		let yi00Data = yieldData[0];
		let yi01Data = nextYieldData[0];
		let x00pos = startX;
		let x01pos = startX;
		// console.log(yieldData);

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
				const curDate = plotItem.date;
				const nextDate = nextPlotItem.date;
				// const type = plotItem.yield;

				positions.push(x00pos, y00Value, z0pos);
				faceData.push({ date: curDate, type: yieldValues[jj] });
				positions.push(x01pos, y01Value, z1pos);
				faceData.push({ date: nextDate, type: yieldValues[jj] });
				positions.push(x10pos, y10Value, z0pos);
				faceData.push({ date: curDate, type: yieldValues[jj + 1] });
				rates.push(rate00, rate01, rate10);

				positions.push(x10pos, y10Value, z0pos);
				faceData.push({ date: curDate, type: yieldValues[jj + 1] });
				positions.push(x01pos, y01Value, z1pos);
				faceData.push({ date: nextDate, type: yieldValues[jj] });
				positions.push(x11pos, y11Value, z1pos);
				faceData.push({ date: nextDate, type: yieldValues[jj + 1] });
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
		faceData: faceData,
		startZ: startZ,
		startX: startX,
		dateUnit: dateUnit,
		yieldUnit: yieldUnit,
	};
}

export function createSupportLine(plot: IPlot[], country: string) {
	const yieldSize = yieldValues.length;
	const yieldUnit = grid.x / (yieldSize - 1);
	const startX = grid.x * -0.5;
	const yearRate =
		endDate.getFullYear() -
		startDate.getFullYear() +
		(endDate.getMonth() - startDate.getMonth()) / 12 +
		(endDate.getDay() - startDate.getDay()) / 365;
	const dateUnit = grid.z / yearRate;
	const startZ = grid.z * -0.5;
	const outputData = {};
	let minY = 0;
	let maxY = 10;
	const linePositionData = [];
	const dx = 0.0;
	const dy = 0;
	const dz = 0.0;
	let cnt = 0;
	const inc = country == 'japan' || country == 'usa' ? 50 : 100;

	for (let ii = 0; ii < plot.length; ii = ii + inc) {}

	for (let ii = 0; ii < plot.length; ii = ii + inc) {
		const dataByDate = plot[ii];
		const yieldData = dataByDate.yield;
		const zpos = dataByDate.yearRate * dateUnit + startZ;

		let prev = null;
		let prevX = null;
		let j = 0;

		for (const yieldItemData of yieldData) {
			const x = startX + j * yieldUnit;
			if (prev !== null && yieldItemData !== null) {
				const curYVal = ((yieldItemData - minY) / (maxY - minY)) * scaleYield;
				const prevYVal = ((prev - minY) / (maxY - minY)) * scaleYield;
				linePositionData.push(prevX, prevYVal + dy, zpos, x, curYVal + dy, zpos);
			}

			if (yieldItemData !== null) {
				prev = yieldItemData;
				prevX = x;
			}
			j++;
		}
	}

	// console.log(linePositionData);
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(linePositionData), 3));

	return geometry;
}
