import { OrbitControls } from 'three-orbitcontrols-ts';
import { Camera } from 'three';
import { CUSTOM_ORBIT_CONTROLS } from '../utils/constants';

export class CustomOrbitControls extends OrbitControls {
	constructor(object: Camera, domElement?: HTMLElement, domWindow?: Window) {
		super(object, domElement, domWindow);
	}
	public update() {
		const val = super.update();

		this.dispatchEvent({ type: CUSTOM_ORBIT_CONTROLS.UPDATE });

		return val;
	}
}
