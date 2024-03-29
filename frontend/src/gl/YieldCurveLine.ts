import {
	Object3D,
	BufferGeometry,
	RawShaderMaterial,
	DoubleSide,
	BufferAttribute,
	Mesh,
	Intersection,
	Face3,
	LineSegments,
	LineBasicMaterial,
	Scene,
	Vector3,
} from 'three';
import { IYieldCurve } from '../store/app';
import {
	parseData,
	createGeometryData,
	createLineGeometryData,
	createSupportLine,
} from '../utils/function';
import { IPlot } from '../components/types/type';
import vShader from './shader/graph.vert';
import fShader from './shader/graph.frag';
import { YIELD_CURVE_LINE } from '../utils/constants';

export class YieldCurveObject extends Object3D {
	private geometry: BufferGeometry = new BufferGeometry();
	private yieldCurveData: IYieldCurve[];
	private plotCurveData: IPlot[];
	private geoData: {
		position: Float32Array;
		rate: Float32Array;
		faceData: { date: string; type: string }[];
		startZ: number;
		startX: number;
		dateUnit: number;
		yieldUnit: number;
	};
	private country: string;
	private selectedType: string = '';
	private selectedDate: string = '';
	private lineMesh?: Mesh;
	private supportLineMesh: Mesh;
	private supportLineGeometry: BufferGeometry;
	public mesh: Mesh;
	private lineGeometrylist: { [key: string]: BufferGeometry };
	private line?: LineSegments;
	private typeLine?: LineSegments;

	constructor(country: string, yieldCurveData: IYieldCurve[], scene: Scene) {
		super();

		this.country = country;
		this.yieldCurveData = yieldCurveData;
		this.plotCurveData = parseData(this.yieldCurveData);
		this.geoData = createGeometryData(this.plotCurveData, country);
		const { lineGeometrylist } = createLineGeometryData(this.plotCurveData, country);
		this.lineGeometrylist = lineGeometrylist;
		this.supportLineGeometry = createSupportLine(this.plotCurveData, country);

		this.geometry.setAttribute('position', new BufferAttribute(this.geoData.position, 3));
		this.geometry.setAttribute('rate', new BufferAttribute(this.geoData.rate, 1));

		const material = new RawShaderMaterial({
			fragmentShader: fShader,
			vertexShader: vShader,
			side: DoubleSide,
			uniforms: {
				startZ: { value: this.geoData.startZ },
				startX: { value: this.geoData.startX },
				dateUnit: { value: this.geoData.dateUnit },
				yieldUnit: { value: this.geoData.yieldUnit },
			},
		});

		this.mesh = new Mesh(this.geometry, material);

		this.add(this.mesh);

		this.supportLineMesh = new LineSegments(
			this.supportLineGeometry,
			new LineBasicMaterial({ color: 0xff0000 })
		);

		// if (country == 'usa') scene.add(this.supportLineMesh);
	}

	private updateDateMesh(lineScene: Scene) {
		if (this.line) {
			this.line.geometry = this.lineGeometrylist[this.selectedDate];
		} else {
			this.line = new LineSegments(
				this.lineGeometrylist[this.selectedDate],
				new LineBasicMaterial({ color: 0x000000 })
			);
			lineScene.add(this.line);
		}
	}

	private updateTypeMesh(lineScene: Scene) {
		if (this.typeLine) {
			this.typeLine.geometry = this.lineGeometrylist[this.selectedType];
		} else {
			this.typeLine = new LineSegments(
				this.lineGeometrylist[this.selectedType],
				new LineBasicMaterial({ color: 0x000000 })
			);
			lineScene.add(this.typeLine);
		}
	}

	public findIntersect(intersection: Intersection, lineScene: Scene) {
		const intersectedFace = intersection.face as Face3;
		let faceIndex = -9999;
		let minDistance = 999999;

		for (let ii = 0; ii < 3; ii++) {
			const target =
				ii === 0 ? intersectedFace.a : ii === 1 ? intersectedFace.b : intersectedFace.c;
			const dist = intersection.point.distanceTo(
				new Vector3(
					this.geoData.position[3 * target],
					this.geoData.position[3 * target + 1],
					this.geoData.position[3 * target + 2]
				)
			);

			if (dist < minDistance) {
				minDistance = dist;
				faceIndex = target;
			}
		}

		const faceData = this.geoData.faceData[faceIndex];
		if (this.selectedDate !== faceData.date) {
			this.selectedDate = faceData.date;
			this.updateDateMesh(lineScene);
		}
		if (this.selectedType !== faceData.type) {
			this.selectedType = faceData.type;
			this.updateTypeMesh(lineScene);
		}

		//
		this.dispatchEvent({
			type: YIELD_CURVE_LINE.UPDATE,
			country: this.country,
			date: faceData.date,
			yieldCurve: faceData.type,
		});
	}

	public getPlotData() {
		return this.plotCurveData;
	}

	public removeCurve(lineScene: Scene) {
		if (this.typeLine) {
			lineScene.remove(this.typeLine);
		}

		if (this.line) {
			lineScene.remove(this.line);
		}
	}

	public addCurve(lineScene: Scene) {
		if (this.typeLine) {
			lineScene.add(this.typeLine);
		}

		if (this.line) {
			lineScene.add(this.line);
		}
	}
}
