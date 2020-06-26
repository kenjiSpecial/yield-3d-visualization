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
	Vector2,
	Raycaster,
	SphereGeometry,
} from 'three';
import { GUI, GUIController } from 'dat.gui';
import { gsap } from 'gsap';
import { store } from '../store';
import { IYieldCurve } from '../store/app';
import { parseData, createGeometryData } from '../utils/function';
import { IPlot } from '../components/types/type';
import { OrbitControls } from 'three-orbitcontrols-ts';
import { Axis } from './axis';
import { YieldCurveObject } from './YieldCurveLine';

export class QuntumGL {
	private renderer: WebGLRenderer;
	private scene: Scene = new Scene();
	private lineScene: Scene = new Scene();
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
	private state: string = 'whole';
	private obj: { progress: number } = { progress: 0 };
	private targetLookAtPrevPos: Vector3 = new Vector3();
	private orbitcontrol: OrbitControls;
	private selectedCountry: string = 'brazil';
	private prevSelectedCountry: string = 'brazil';
	private yieldCurveObjectList: { [key: string]: YieldCurveObject } = {};
	private axis: Axis;
	private mouse: Vector2;
	private raycaster: Raycaster;
	private width: number = 0;
	private height: number = 0;
	private debugMesh: Mesh | null = null;

	constructor(canvas: HTMLCanvasElement) {
		this.loop = this.loop.bind(this);

		this.renderer = new WebGLRenderer({
			canvas: canvas,
			antialias: true,
		});
		this.renderer.setClearColor(0xffffff, 1);
		this.renderer.autoClear = false;
		// this.camera.position.x = -100;
		this.camera.position.y = 60;
		this.camera.position.z = 240;
		this.camera.lookAt(new Vector3(0, 0, 60));
		this.orbitcontrol = new OrbitControls(this.camera, this.renderer.domElement);
		if (store.getState().app.isDebug) this.setupDebug();
		this.axis = new Axis(this.scene);
		this.mouse = new Vector2(9999, 9999);
		this.raycaster = new Raycaster();
		this.setEvents();
		this.resize();
	}

	private setupDebug() {
		console.log('hello');
		this.gui = new GUI();
		this.playAndStopGui = this.gui.add(this, 'playAndStop').name('pause');
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
			}
		});

		this.gui
			.add(this, 'selectedCountry', [
				'japan',
				'usa',
				'india',
				'germany',
				'brazil',
				'australia',
			])
			.onChange(() => {
				this.updateCountry();
			});

		const sphere = new SphereGeometry(2, 4, 4);
		const mat = new MeshBasicMaterial({ color: 0xff0000 });
		this.debugMesh = new Mesh(sphere, mat);
		this.debugMesh.scale.set(0.1, 0.1, 0.1);
		console.log(this.debugMesh);
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
		this.raycaster.setFromCamera(this.mouse, this.camera);

		this.axis.update(this.camera);

		this.updateIntersect();

		this.renderer.clear(true, true, true);
		this.renderer.render(this.scene, this.camera);
		this.renderer.clearDepth();
		this.renderer.render(this.lineScene, this.camera);
	}

	private updateIntersect() {
		const intersects = this.raycaster.intersectObject(
			this.yieldCurveObjectList[this.selectedCountry].mesh
		);
		if (intersects.length > 0) {
			const intersect = intersects[0];

			if (this.debugMesh) {
				this.debugMesh.position.set(
					intersect.point.x,
					intersect.point.y + 0.1,
					intersect.point.z
				);
				this.scene.add(this.debugMesh);
			}

			this.yieldCurveObjectList[this.selectedCountry].findIntersect(
				intersect,
				this.lineScene
			);
		} else {
			if (this.debugMesh) {
				this.scene.remove(this.debugMesh);
			}
		}
	}

	private updateCountry() {
		this.scene.remove(this.yieldCurveObjectList[this.prevSelectedCountry]);
		this.scene.add(this.yieldCurveObjectList[this.selectedCountry]);
		this.prevSelectedCountry = this.selectedCountry;
	}

	public start() {
		this.isLoop = true;
		gsap.ticker.add(this.loop);
	}

	public pause() {
		this.isLoop = false;
		gsap.ticker.remove(this.loop);
	}

	public addData(yieldCurveData: { [key: string]: IYieldCurve[] }) {
		for (const key in yieldCurveData) {
			this.yieldCurveObjectList[key] = new YieldCurveObject(key, yieldCurveData[key]);
		}

		this.scene.add(this.yieldCurveObjectList[this.selectedCountry]);

		this.start();
	}

	onKeyDown(ev: KeyboardEvent) {
		switch (ev.which) {
			case 27:
				this.playAndStop();
				break;
		}
	}

	onMouseMove(ev: MouseEvent) {
		this.mouse.x = (ev.clientX / this.width) * 2 - 1;
		this.mouse.y = (ev.clientY / this.height) * -2 + 1;
	}

	resize() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.width, this.height);
	}

	setEvents() {
		this.onMouseMove = this.onMouseMove.bind(this);
		this.renderer.domElement.addEventListener('mousemove', this.onMouseMove);
	}

	destroy() {}
}
