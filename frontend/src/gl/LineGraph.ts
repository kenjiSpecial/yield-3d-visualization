// canvas 2D graph

import { IPlot } from '../components/types/type';
import { yieldValues, startDate, endDate } from '../utils/constants';

const marginTop = 20;
const marginBot = 30;
const marginLeft = 40;
const marginRight = 30;
const leftYieldMax = 12;

const strokeCol = '#ccc';

export class LineGraph {
	private parent: HTMLElement;
	private container: HTMLDivElement;
	private leftGraph: {
		container: HTMLDivElement;
		dataEl: HTMLDivElement;
		titleEl: HTMLDivElement;
		canvas: HTMLCanvasElement;
		ctx: CanvasRenderingContext2D;
	};
	private dateGraph: {
		container: HTMLDivElement;
		dataEl: HTMLDivElement;
		titleEl: HTMLDivElement;
		canvas: HTMLCanvasElement;
		ctx: CanvasRenderingContext2D;
	};
	private leftWidth: number = 450;
	private dateWidth: number = 250;
	private height: number = 200;
	private prevCountry?: string;
	private prevDate?: string;
	private prevYieldCurve?: string;

	constructor() {
		this.parent = document.getElementsByClassName('canvas-container')[0] as HTMLElement;
		this.container = document.createElement('div');
		this.container.classList.add('graphs-container');
		this.parent.appendChild(this.container);

		this.leftGraph = this.createGraph('残存期間', this.leftWidth, this.height);
		this.dateGraph = this.createGraph('日付', this.dateWidth, this.height);
	}

	createGraph(text: string, width: number, height: number) {
		const container = document.createElement('div');
		const titleEl = document.createElement('div');
		const canvas = document.createElement('canvas');

		this.container.appendChild(container);

		container.appendChild(titleEl);
		titleEl.innerText = text;

		canvas.width = width;
		canvas.height = height;
		container.appendChild(canvas);
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

		const dataEl = document.createElement('div');
		dataEl.innerText = '';
		container.appendChild(dataEl);

		return { container, canvas, ctx, dataEl, titleEl };
	}

	public updateData(country: string, date: string, yieldCurve: string, plotData: IPlot[]) {
		if (country !== this.prevCountry) {
			this.reset();
		}
		this.prevCountry = country;

		this.updateDate(date, yieldCurve, plotData);
		this.updateLeft(yieldCurve, date, plotData);

		this.prevYieldCurve = yieldCurve;
	}

	private updateLeft(yieldCurve: string, date: string, plotData: IPlot[]) {
		this.prevYieldCurve = yieldCurve;
		this.leftGraph.titleEl.innerHTML = `残存期間: ${yieldCurve}`;

		let leftIndex = -9999;
		this.leftGraph.ctx.clearRect(0, 0, this.leftWidth, this.height);
		const yearRateRange =
			endDate.getFullYear() -
			startDate.getFullYear() +
			(endDate.getMonth() - startDate.getMonth()) / 12 +
			(endDate.getDay() - startDate.getDay()) / 365;

		const side = this.leftWidth - marginLeft - marginRight;
		this.leftGraph.ctx.strokeStyle = strokeCol;
		this.leftGraph.ctx.beginPath();
		this.leftGraph.ctx.textBaseline = 'top';
		for (let ii = 0; ii < yearRateRange; ii++) {
			const xpos = Math.floor((ii / yearRateRange) * side + marginLeft) + 0.5;
			this.leftGraph.ctx.moveTo(xpos, marginTop);
			this.leftGraph.ctx.lineTo(xpos, this.height - marginBot);

			if (ii % 10 === 0) {
				if (ii == 0) {
					this.leftGraph.ctx.textAlign = 'left';
				} else {
					this.leftGraph.ctx.textAlign = 'center';
				}

				this.leftGraph.ctx.fillText(
					`${(90 + ii) % 100}`,
					xpos,
					this.height - marginBot + 12
				);
			}
		}
		this.leftGraph.ctx.textAlign = 'right';
		for (let ii = 0; ii < 3; ii++) {
			const y =
				ii == 0
					? marginTop
					: ii === 1
					? (this.height - marginBot - marginTop) / 2 + marginTop
					: this.height - marginBot;
			this.leftGraph.ctx.moveTo(marginLeft, y);
			this.leftGraph.ctx.lineTo(this.leftWidth - marginRight, y);

			const text = ii === 0 ? '12%' : ii === 1 ? '6%' : '0%';
			if (ii == 0) {
				this.leftGraph.ctx.textBaseline = 'bottom';
			} else {
				this.leftGraph.ctx.textBaseline = 'middle';
			}

			this.leftGraph.ctx.fillText(text, marginLeft - 5, y);
		}

		this.leftGraph.ctx.stroke();

		for (let ii = 0; ii < yieldValues.length; ii++) {
			if (yieldValues[ii] === yieldCurve) {
				leftIndex = ii;
				break;
			}
		}
		if (leftIndex === -9999) {
			return;
		}

		const leftData: { [key: string]: { yearRate: number; yield: null | number } } = {};
		for (let ii = 0; ii < plotData.length; ii++) {
			const plotItemData = plotData[ii];
			leftData[plotItemData.date] = {
				yearRate: plotItemData.yearRate,
				yield: plotItemData.yield[leftIndex],
			};
		}

		this.leftGraph.ctx.beginPath();
		let targetPosX = -9999;
		let targetPosY = -9999;
		let targetVal = -9999;
		let isCtxMoveTo = true;
		for (const key in leftData) {
			const yearRateRange =
				endDate.getFullYear() -
				startDate.getFullYear() +
				(endDate.getMonth() - startDate.getMonth()) / 12 +
				(endDate.getDay() - startDate.getDay()) / 365;
			if (leftData[key].yield !== null) {
				const xpos = this.getposX(
					leftData[key].yearRate / yearRateRange,
					this.leftWidth - marginLeft - marginRight,
					marginLeft,
					marginRight
				);
				const ypos = this.getposY(
					leftData[key].yield / leftYieldMax,
					this.height - marginTop - marginBot,
					marginTop,
					marginBot
				);
				// console.log(xpos, ypos);

				if (isCtxMoveTo) {
					this.leftGraph.ctx.moveTo(xpos, ypos);
				} else {
					this.leftGraph.ctx.lineTo(xpos, ypos);
				}

				isCtxMoveTo = false;
				if (key === date) {
					targetPosX = xpos;
					targetPosY = ypos;
					targetVal = leftData[key].yield;
				}
			} else {
				isCtxMoveTo = true;
			}
		}
		this.leftGraph.ctx.strokeStyle = '#000000';
		this.leftGraph.ctx.stroke();

		this.leftGraph.ctx.stroke();

		this.leftGraph.ctx.beginPath();
		this.leftGraph.ctx.moveTo(marginLeft, targetPosY);
		this.leftGraph.ctx.lineTo(targetPosX, targetPosY);
		this.leftGraph.ctx.strokeStyle = '#cccccc';
		this.leftGraph.ctx.stroke();

		this.leftGraph.ctx.beginPath();
		this.leftGraph.ctx.moveTo(targetPosX, this.height - marginBot);
		this.leftGraph.ctx.lineTo(targetPosX, targetPosY);
		this.leftGraph.ctx.strokeStyle = '#cccccc';
		this.leftGraph.ctx.stroke();

		this.leftGraph.ctx.beginPath();
		this.leftGraph.ctx.fillStyle = '#990000';
		this.leftGraph.ctx.arc(targetPosX, targetPosY, 4, 0, 2 * Math.PI);
		this.leftGraph.ctx.fill();

		this.leftGraph.ctx.fillStyle = '#000000';
		this.leftGraph.ctx.textBaseline = 'middle';
		this.leftGraph.ctx.fillText(`${targetVal}%`, marginLeft - 2, targetPosY);

		this.leftGraph.ctx.textAlign = 'center';
		this.leftGraph.ctx.textBaseline = 'top';
		this.leftGraph.ctx.fillText(date, targetPosX, this.height - marginBot + 2);
	}

	private updateDate(date: string, yieldCurve: string, plotData: IPlot[]) {
		this.prevDate = date;

		this.dateGraph.titleEl.innerText = `日付: ${date}`;

		let data: IPlot | null;
		for (let ii = 0; ii < plotData.length; ii++) {
			const plotItemData = plotData[ii];
			if (plotItemData.date === date) {
				data = plotItemData;
				break;
			}
		}

		this.dateGraph.ctx.clearRect(0, 0, this.dateWidth, this.height);
		this.dateGraph.ctx.textBaseline = 'top';

		const side = this.dateWidth - marginLeft - marginRight;
		this.dateGraph.ctx.beginPath();
		for (let ii = 0; ii < yieldValues.length; ii++) {
			const xpos = Math.floor((ii / (yieldValues.length - 1)) * side + marginLeft) + 0.5;
			this.dateGraph.ctx.moveTo(xpos, marginTop);
			this.dateGraph.ctx.lineTo(xpos, this.height - marginBot);

			if (ii === 0 || ii === 5 || ii === 10) {
				if (ii == 0) {
					this.dateGraph.ctx.textAlign = 'left';
				} else {
					this.dateGraph.ctx.textAlign = 'center';
				}
				this.dateGraph.ctx.fillText(yieldValues[ii], xpos, this.height - marginBot + 12);
			}
		}
		this.dateGraph.ctx.strokeStyle = strokeCol;

		this.dateGraph.ctx.textAlign = 'right';
		for (let ii = 0; ii < 3; ii++) {
			const y =
				ii == 0
					? marginTop
					: ii === 1
					? (this.height - marginBot - marginTop) / 2 + marginTop
					: this.height - marginBot;
			this.dateGraph.ctx.moveTo(marginLeft, y);
			this.dateGraph.ctx.lineTo(this.dateWidth - marginRight, y);

			const text = ii === 0 ? '12%' : ii === 1 ? '6%' : '0%';
			if (ii == 0) {
				this.dateGraph.ctx.textBaseline = 'bottom';
			} else {
				this.dateGraph.ctx.textBaseline = 'middle';
			}

			this.dateGraph.ctx.fillText(text, marginLeft - 5, y);
		}

		this.dateGraph.ctx.strokeStyle = strokeCol;
		this.dateGraph.ctx.stroke();

		if (data) {
			const yieldSize = data.yield.length - 1;

			this.dateGraph.ctx.beginPath();
			this.dateGraph.ctx.strokeStyle = '#000';
			let isInit = true;
			let yieldCurvePosX = -9999;
			let yieldCurvePosY = -9999;
			let yieldCurveVal = -9999;
			for (let ii = 0; ii < data.yield.length; ii++) {
				if (data.yield[ii] === null) {
					continue;
				}

				const x = this.getposX(
					ii / yieldSize,
					this.dateWidth - marginLeft - marginRight,
					marginLeft,
					marginRight
				);
				const y = this.getposY(
					data.yield[ii] / leftYieldMax,
					this.height - marginTop - marginBot,
					marginTop,
					marginBot
				);
				if (isInit) {
					this.dateGraph.ctx.moveTo(x, y);
					isInit = false;
				} else this.dateGraph.ctx.lineTo(x, y);

				if (yieldValues[ii] === yieldCurve) {
					yieldCurvePosX = x;
					yieldCurvePosY = y;
					yieldCurveVal = data.yield[ii];
				}
			}
			this.dateGraph.ctx.stroke();

			this.dateGraph.ctx.beginPath();
			this.dateGraph.ctx.moveTo(marginLeft, yieldCurvePosY);
			this.dateGraph.ctx.lineTo(yieldCurvePosX, yieldCurvePosY);
			this.dateGraph.ctx.strokeStyle = '#cccccc';
			this.dateGraph.ctx.stroke();

			this.dateGraph.ctx.beginPath();
			this.dateGraph.ctx.fillStyle = '#990000';
			this.dateGraph.ctx.arc(yieldCurvePosX, yieldCurvePosY, 4, 0, 2 * Math.PI);
			this.dateGraph.ctx.fill();

			this.dateGraph.ctx.fillStyle = '#000000';
			this.dateGraph.ctx.textBaseline = 'middle';
			this.dateGraph.ctx.fillText(
				`${yieldCurveVal.toFixed(2)}%`,
				marginLeft - 2,
				yieldCurvePosY
			);

			this.dateGraph.ctx.textAlign = 'center';
			this.dateGraph.ctx.textBaseline = 'top';
			this.dateGraph.ctx.fillText(yieldCurve, yieldCurvePosX, this.height - marginBot + 2);
		}
	}

	private getposX(val: number, side: number, marginLeft: number, marginRight: number) {
		const x = val * side + marginLeft;
		return x;
	}

	private getposY(val: number, side: number, marginTop: number, marginBot: number) {
		const height = val * side;
		const y = side - height + marginTop;
		return y;
	}

	private reset() {
		this.prevDate = '';
		this.prevYieldCurve = '';
	}
}
