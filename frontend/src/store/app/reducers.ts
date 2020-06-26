import { AppState, AppActionType, AppActions } from './types';
import { Action } from 'redux';
import { INCREMENT, urls } from '../../utils/constants';

const initialState: AppState = {
	isLoaded: false,
	yieldCurve: {},
	isDebug: false,
};

const app = (state: AppState = initialState, action: AppActions): AppState => {
	switch (action.type) {
		case AppActionType.START_LOAD:
			return { ...state, isLoaded: false };
		case AppActionType.LOADED:
			state.yieldCurve[action.yieldCurve.country] = action.yieldCurve.data;
			let cnt = 0;
			for (let key in state.yieldCurve) {
				cnt++;
			}
			const isLoaded = cnt == urls.length ? true : false;

			return { ...state, isLoaded: isLoaded };
		case AppActionType.UPDATE_DEBUG:
			return { ...state, isDebug: action.debug };
		default:
			return state;
	}
};

export default app;
