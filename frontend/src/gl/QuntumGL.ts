import {
	WebGLRenderer,
	Scene,
	PerspectiveCamera,
	MeshBasicMaterial,
	Mesh,
	Vector3,
	Vector2,
	Raycaster,
	SphereGeometry,
} from 'three';
import { GUI, GUIController } from 'dat.gui';
import { gsap } from 'gsap';
import { store } from '../store';
import { IYieldCurve } from '../store/app';
import { CustomOrbitControls } from './OrbitControl';
import { Axis } from './axis';
import { YieldCurveObject } from './YieldCurveLine';
import { CUSTOM_ORBIT_CONTROLS, YIELD_CURVE_LINE } from '../utils/constants';
import { LineGraph } from './LineGraph';

export class QuntumGL {
	private renderer: WebGLRenderer;
	private scene: Scene = new Scene();
	private tempScene: Scene = new Scene();
	private lineScene: Scene = new Scene();
	private camera: PerspectiveCamera = new PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		1,
		10000
	);
	private gui?: GUI;
	private mesh: Mesh | null = null;
	private appState: number = 0;
	private state: string = 'whole';
	private obj: { progress: number } = { progress: 0 };
	private targetLookAtPrevPos: Vector3 = new Vector3();
	private orbitcontrol: CustomOrbitControls;
	private selectedCountry: string = 'usa';
	private prevSelectedCountry: string = 'usa';
	private yieldCurveObjectList: { [key: string]: YieldCurveObject } = {};
	private axis: Axis;
	private mouse: Vector2;
	private raycaster: Raycaster;
	private width: number = 0;
	private height: number = 0;
	private debugMesh: Mesh | null = null;
	private shouldRender: boolean = false;
	private lineGraph: LineGraph = new LineGraph();

	constructor(canvas: HTMLCanvasElement) {
		this.loop = this.loop.bind(this);
		this.onUpdateYieldCurveLineHandler = this.onUpdateYieldCurveLineHandler.bind(this);
		this.renderer = new WebGLRenderer({
			canvas: canvas,
			antialias: true,
		});
		this.renderer.setClearColor(0xffffff, 1);
		this.renderer.autoClear = false;
		this.camera.position.y = 30;
		this.camera.position.z = 240;
		this.camera.lookAt(new Vector3(0, 30, 0));
		this.orbitcontrol = new CustomOrbitControls(this.camera, this.renderer.domElement);
		if (store.getState().app.isDebug) this.setupDebug();
		this.axis = new Axis(this.scene);
		this.mouse = new Vector2(9999, 9999);
		this.raycaster = new Raycaster();
		this.setEvents();
		this.resize();
	}

	private setupDebug() {
		this.gui = new GUI();
		this.gui.add(this, 'state', ['whole', 'front', 'side', '2020']).onChange(() => {
			const targetLookAtPrevPos = this.targetLookAtPrevPos.clone();

			const initPos = new Vector3(
				this.camera.position.x,
				this.camera.position.y,
				this.camera.position.z
			);
			let targetPos = new Vector3();
			let targetLookAtPos = new Vector3();
			let initfunciton = () => {};
			let compfunciton = () => {};

			if (this.state === 'whole') {
				targetPos.set(-100, 60, 160);
				targetLookAtPos.set(0, 0, 0);
				compfunciton = () => {
					this.orbitcontrol.enabled = true;
				};
			} else if (this.state === 'front') {
				targetPos.set(0, 0, 250);
				targetLookAtPos.set(0, 0, 0);
				compfunciton = () => {
					this.orbitcontrol.enabled = true;
				};
			} else if (this.state === 'side') {
				targetPos.set(-300, 0, 0);
				targetLookAtPos.set(0, 0, 0);
				compfunciton = () => {
					this.orbitcontrol.enabled = true;
				};
			} else {
				targetPos = new Vector3(-70, 20, 100);
				targetLookAtPos = new Vector3(-30, 0, 95);
				initfunciton = () => {
					this.orbitcontrol.enabled = false;
				};
			}

			this.cameraMoveAnimation(
				initPos,
				targetPos,
				targetLookAtPrevPos,
				targetLookAtPos,
				initfunciton,
				compfunciton
			);
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
	}

	private cameraMoveAnimation(
		initPos: Vector3,
		targetPos: Vector3,
		targetLookAtPrevPos: Vector3,
		targetLookAtPos: Vector3,
		customStartFunction?: Function,
		customCompleteFunction?: Function
	) {
		gsap.killTweensOf(this.obj, 'progress');
		this.obj.progress = 0;

		gsap.to(this.obj, {
			progress: 1,
			duration: 1.5,
			ease: 'power2.inOut',
			onStart: () => {
				if (customStartFunction) {
					customStartFunction();
				}
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
				this.render();
			},
			onComplete: () => {
				if (customCompleteFunction) {
					customCompleteFunction();
				}
			},
		});
	}

	private loop() {}

	private render() {
		this.raycaster.setFromCamera(this.mouse, this.camera);

		this.axis.update(this.camera);

		this.updateIntersect();

		this.renderer.clear(true, true, true);
		this.renderer.render(this.scene, this.camera);
		this.renderer.render(this.tempScene, this.camera);
		this.renderer.clearDepth();
		this.renderer.render(this.lineScene, this.camera);
	}

	private updateIntersect() {
		if (!this.yieldCurveObjectList[this.selectedCountry]) {
			return;
		}

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
		this.yieldCurveObjectList[this.prevSelectedCountry].removeCurve(this.lineScene);
		this.scene.remove(this.yieldCurveObjectList[this.prevSelectedCountry]);
		this.scene.add(this.yieldCurveObjectList[this.selectedCountry]);
		this.yieldCurveObjectList[this.selectedCountry].addCurve(this.lineScene);
		this.prevSelectedCountry = this.selectedCountry;
	}

	public start() {}

	public pause() {}

	public addData(yieldCurveData: { [key: string]: IYieldCurve[] }) {
		for (const key in yieldCurveData) {
			this.yieldCurveObjectList[key] = new YieldCurveObject(
				key,
				yieldCurveData[key],
				this.tempScene
			);
			this.yieldCurveObjectList[key].addEventListener(
				YIELD_CURVE_LINE.UPDATE,
				this.onUpdateYieldCurveLineHandler
			);
		}

		this.scene.add(this.yieldCurveObjectList[this.selectedCountry]);

		this.render();
	}

	onKeyDown(ev: KeyboardEvent) {
		switch (ev.which) {
			case 27:
				break;
		}
	}

	onMouseMove(ev: MouseEvent) {
		this.mouse.x = (ev.clientX / this.width) * 2 - 1;
		this.mouse.y = (ev.clientY / this.height) * -2 + 1;
		this.render();
	}

	resize() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.width, this.height);

		this.render();
	}

	setEvents() {
		this.onMouseMove = this.onMouseMove.bind(this);
		window.addEventListener('mousemove', this.onMouseMove);
		window.addEventListener('resize', () => {
			this.resize();
		});
		this.orbitcontrol.addEventListener(CUSTOM_ORBIT_CONTROLS.UPDATE, () => {
			this.render();
		});
	}

	destroy() {}

	private onUpdateYieldCurveLineHandler(event: {
		type: string;
		country: string;
		date: string;
		yieldCurve: string;
	}) {
		this.lineGraph.updateData(
			event.country,
			event.date,
			event.yieldCurve,
			this.yieldCurveObjectList[event.country].getPlotData()
		);
	}

	public remove() {}
}
