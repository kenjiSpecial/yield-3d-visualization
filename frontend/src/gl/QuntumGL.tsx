import {
	WebGLRenderer,
	Scene,
	PerspectiveCamera,
	BoxGeometry,
	MeshBasicMaterial,
	Mesh,
	BufferAttribute,
	BufferGeometry,
	GridHelper,
	Vector3,
	RawShaderMaterial,
	DoubleSide,
} from 'three';
import { GUI, GUIController } from 'dat.gui';
import { gsap } from 'gsap';
import { store } from '../store';
import { IYieldCurve } from '../store/app';
import { parseData, createGeometryData } from '../utils/function';
import { IPlot } from '../components/types/type';
import vShader from './shader/graph.vert';
import fShader from './shader/graph.frag';
import { OrbitControls } from 'three-orbitcontrols-ts';

export class QuntumGL {
	private renderer: WebGLRenderer;
	private scene: Scene = new Scene();
	private camera: PerspectiveCamera = new PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		1,
		10000
	);
	private gui?: GUI;
	private isLoop: boolean = false;
	private playAndStopGui?: GUIController;
	private mesh: Mesh | null = null;
	private appState: number = 0;
	private yieldCurveData: IPlot[] = [];
	private state: string = 'whole';
	private obj: { progress: number } = { progress: 0 };
	private targetLookAtPrevPos: Vector3 = new Vector3();
	private orbitcontrol: OrbitControls;

	constructor(canvas: HTMLCanvasElement) {
		this.loop = this.loop.bind(this);

		this.renderer = new WebGLRenderer({
			canvas: canvas,
			antialias: true,
		});
		this.renderer.setClearColor(0xffffff, 1);
		this.camera.position.x = -100;
		this.camera.position.y = 60;
		this.camera.position.z = 160;
		this.camera.lookAt(new Vector3());
		this.orbitcontrol = new OrbitControls(this.camera, this.renderer.domElement);

		if (store.getState().app.isDebug) this.setupDebug();
		this.resize();
	}

	private setupDebug() {
		this.gui = new GUI();
		this.playAndStopGui = this.gui.add(this, 'playAndStop').name('pause');
		// const obj = {
		// 	progress: 0,
		// };
		this.gui.add(this, 'state', ['whole', '2020']).onChange(() => {
			const targetLookAtPrevPos = this.targetLookAtPrevPos.clone();

			if (this.state === 'whole') {
				const targetPos = new Vector3(-100, 60, 160);

				const initPos = new Vector3(
					this.camera.position.x,
					this.camera.position.y,
					this.camera.position.z
				);

				gsap.killTweensOf(this.obj, 'progress');
				this.obj.progress = 0;

				gsap.to(this.obj, {
					progress: 1,
					duration: 1.5,
					ease: 'power2.inOut',
					onUpdate: () => {
						this.camera.position.x =
							initPos.x * (1 - this.obj.progress) + targetPos.x * this.obj.progress;
						this.camera.position.y =
							initPos.y * (1 - this.obj.progress) + targetPos.y * this.obj.progress;
						this.camera.position.z =
							initPos.z * (1 - this.obj.progress) + targetPos.z * this.obj.progress;

						const lookAt = new Vector3();
						lookAt.x = targetLookAtPrevPos.x * (1 - this.obj.progress);
						lookAt.y = targetLookAtPrevPos.y * (1 - this.obj.progress);
						lookAt.z = targetLookAtPrevPos.z * (1 - this.obj.progress);
						this.targetLookAtPrevPos = lookAt.clone();
						this.camera.lookAt(lookAt);
					},
					onComplete: () => {
						this.orbitcontrol.enabled = true;
					},
				});
			} else {
				const targetPos = new Vector3(-70, 20, 100);
				const targetLookAtPos = new Vector3(-30, 0, 95);

				const initPos = new Vector3(
					this.camera.position.x,
					this.camera.position.y,
					this.camera.position.z
				);

				gsap.killTweensOf(this.obj, 'progress');
				this.obj.progress = 0;

				gsap.to(this.obj, {
					progress: 1,
					duration: 1.5,
					ease: 'power2.inOut',
					onStart: () => {
						this.orbitcontrol.enabled = false;
					},
					onUpdate: () => {
						this.camera.position.x =
							initPos.x * (1 - this.obj.progress) + targetPos.x * this.obj.progress;
						this.camera.position.y =
							initPos.y * (1 - this.obj.progress) + targetPos.y * this.obj.progress;
						this.camera.position.z =
							initPos.z * (1 - this.obj.progress) + targetPos.z * this.obj.progress;

						const lookAt = new Vector3();
						lookAt.x =
							targetLookAtPos.x * this.obj.progress +
							targetLookAtPrevPos.x * (1 - this.obj.progress);
						lookAt.y =
							targetLookAtPos.y * this.obj.progress +
							targetLookAtPrevPos.y * (1 - this.obj.progress);
						lookAt.z =
							targetLookAtPos.z * this.obj.progress +
							targetLookAtPrevPos.z * (1 - this.obj.progress);
						this.targetLookAtPrevPos = lookAt.clone();
						this.camera.lookAt(lookAt);
					},
				});

				// this.camera.position.z = 100;
				// this.camera.position.y = 20;
				// this.camera.position.x = -70;
				// this.camera.lookAt(new Vector3(-30, 0, 95));
			}
		});
		// this.gui.add(this, 'appState').listen();
	}

	private createMesh() {
		let geometry = new BoxGeometry(20, 20, 20);
		let mat = new MeshBasicMaterial({ color: 0xffff00 });

		this.mesh = new Mesh(geometry, mat);
		(this.scene as Scene).add(this.mesh);
	}

	private playAndStop() {
		if (this.isLoop) {
			this.pause();
			(this.playAndStopGui as GUIController).name('play');
		} else {
			this.start();
			(this.playAndStopGui as GUIController).name('pause');
		}
	}

	private loop() {
		this.renderer.render(this.scene, this.camera);
	}

	public start() {
		this.isLoop = true;
		gsap.ticker.add(this.loop);
	}

	public pause() {
		this.isLoop = false;
		gsap.ticker.remove(this.loop);
	}

	public updateData(yieldCurve: IYieldCurve[]) {
		this.yieldCurveData = parseData(yieldCurve);
		var geometry = new BufferGeometry();
		const output = createGeometryData(this.yieldCurveData);
		geometry.setAttribute('position', new BufferAttribute(output.position, 3));
		geometry.setAttribute('rate', new BufferAttribute(output.rate, 1));

		const material = new RawShaderMaterial({
			fragmentShader: fShader,
			vertexShader: vShader,
			side: DoubleSide,
		});
		var mesh = new Mesh(geometry, material);

		this.scene.add(mesh);

		const size = 100;
		const divisions = 10;

		const gridHelper = new GridHelper(size, divisions);
		gridHelper.scale.set(1, 1, 2);
		gridHelper.position.y = -0.1;
		this.scene.add(gridHelper);

		this.start();
	}

	onKeyDown(ev: KeyboardEvent) {
		switch (ev.which) {
			case 27:
				this.playAndStop();
				break;
		}
	}

	resize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	destroy() {}
}
