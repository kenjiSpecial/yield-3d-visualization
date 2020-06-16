import * as React from 'react';
import { Component } from 'react';
import { Counter } from './Counter';
import { BgGL } from './BgGL';
import { store } from '../store';
import { startLoadHandler, loadedHandler } from '../store/app';
import { TextContent } from './TextContent';
import axios from 'axios';
import { LOCAL_URL } from '../utils/constants';

export class App extends Component {
	private prevIsFetchData: boolean = false;

	componentDidMount() {
		store.subscribe(() => {
			// console.log(store.getState().app.isLoaded);
			// if (store.getState().app.isFetchData === false && this.prevIsFetchData === true) {
			// 	setTimeout(calcHeight, 0);
			// }
			// this.prevIsFetchData = store.getState().app.isFetchData;
		});
		store.dispatch(startLoadHandler());

		axios
			.get(LOCAL_URL)
			.then(function (response) {
				store.dispatch(loadedHandler(response.data));
			})
			.catch(function (error) {
				console.log(error);
			})
			.finally(function () {
				// always executed
			});
	}

	render() {
		return (
			<div className="container">
				<BgGL />
			</div>
		);
	}
}
