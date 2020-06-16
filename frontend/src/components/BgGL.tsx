import * as React from 'react';
import { Component } from 'react';
import { QuntumGL } from '../gl/QuntumGL';
import { store } from '../store/index';
import { getUrlParameter } from '../utils/function';

export class BgGL extends Component {
	private app: QuntumGL | null = null;

	componentDidMount() {
		const canvas = this.refs.canvas;

		this.app = new QuntumGL(canvas as HTMLCanvasElement);

		let prevAppLoaded = false;
		store.subscribe(() => {
			const appState = store.getState().app;

			if (prevAppLoaded === false && appState.isLoaded) {
				(this.app as QuntumGL).updateData(appState.yieldCurve);
			}

			prevAppLoaded = appState.isLoaded;
		});
	}
	private startApp() {
		(this.app as QuntumGL).start();
	}
	render() {
		return (
			<div className="canvas-container">
				<canvas ref="canvas" />
			</div>
		);
	}
}
