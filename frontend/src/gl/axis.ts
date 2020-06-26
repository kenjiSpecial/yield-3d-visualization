import {
	EventDispatcher,
	Scene,
	PlaneGeometry,
	Texture,
	Mesh,
	MeshBasicMaterial,
	RGBAFormat,
	PerspectiveCamera,
	LineBasicMaterial,
	Vector3,
	BufferGeometry,
	Line,
} from 'three';
import { grid, endDate, startDate, yieldValues } from '../utils/constants';

export class Axis extends EventDispatcher {
	private meshes: Mesh[] = [];
	constructor(scene: Scene) {
		super();

		const axisMargin = 10;
		const yearRate =
			endDate.getFullYear() -
			startDate.getFullYear() +
			(endDate.getMonth() - startDate.getMonth()) / 12 +
			(endDate.getMonth() - startDate.getMonth()) / 30;
		const dateUnit = grid.z / yearRate;
		for (let ii = 0; ii < 7; ii++) {
			const mesh = this.createMesh(`${1990 + 5 * ii}`);
			mesh.position.x = grid.x * -0.5;
			mesh.position.z = grid.z * -0.5 + dateUnit * ii * 5;
			mesh.position.y = -1;
			scene.add(mesh);
			this.meshes.push(mesh);
		}

		for (let ii = -1; ii < 32; ii++) {
			var material = new LineBasicMaterial({
				color: ii % 5 == 0 ? 0x000000 : 0x999999,
			});

			const startX = grid.x * -0.5;
			const endX = grid.x * 0.5;
			const z =
				ii == -1
					? grid.z * -0.5 - axisMargin
					: ii == 31
					? grid.z * 0.5
					: grid.z * -0.5 + dateUnit * ii;

			var points = [];
			points.push(new Vector3(startX, 0, z));
			points.push(new Vector3(endX, 0, z));

			var geometry = new BufferGeometry().setFromPoints(points);

			var line = new Line(geometry, material);
			scene.add(line);
		}

		const yieldSize = yieldValues.length;
		const yieldUnit = grid.x / (yieldSize - 1);
		for (let ii = 0; ii < yieldSize; ii++) {
			var material = new LineBasicMaterial({
				color: 0x33333,
			});

			const startZ = grid.z * -0.5 - axisMargin;
			const endZ = grid.z * 0.5;
			const x = grid.x * -0.5 + yieldUnit * ii;

			var points = [];
			points.push(new Vector3(x, 0, startZ));
			points.push(new Vector3(x, 0, endZ));

			var geometry = new BufferGeometry().setFromPoints(points);

			var line = new Line(geometry, material);
			scene.add(line);

			const mesh = this.createMesh(yieldValues[ii]);
			mesh.position.set(x, -1, startZ);
			scene.add(mesh);
			this.meshes.push(mesh);

			const meshF = this.createMesh(yieldValues[ii]);
			meshF.position.set(x, -1, endZ);
			scene.add(meshF);
			this.meshes.push(meshF);
		}
	}

	private createMesh(text: string = '2020') {
		const canvas = document.createElement('canvas');
		const width = 128;
		const height = 64;
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		// document.body.appendChild(canvas);
		// canvas.style.zIndex = '9999';
		// canvas.style.position = 'absolute';
		// canvas.style.top = '0';
		// canvas.style.left = '0';
		ctx.font = '50px Arial';
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';
		ctx.fillText(text, width / 2, height / 2);

		const plane = new PlaneGeometry(1, 1);
		const texture = new Texture(canvas);
		texture.needsUpdate = true;
		texture.format = RGBAFormat;
		const mat = new MeshBasicMaterial({ map: texture });
		mat.transparent = true;
		const mesh = new Mesh(plane, mat);
		const scale = 0.03;
		mesh.scale.set(width * scale, height * scale, 1);
		return mesh;
	}
	public update(camera: PerspectiveCamera) {
		this.meshes.forEach((mesh: Mesh) => {
			mesh.lookAt(camera.position);
		});
	}
}
