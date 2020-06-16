import { AppState, AppActionType, AppActions } from './types';
import { Action } from 'redux';
import { INCREMENT } from '../../utils/constants';

const initialState: AppState = {
	isLoaded: false,
	yieldCurve: [],
	isDebug: false,
};

const app = (state: AppState = initialState, action: AppActions): AppState => {
	switch (action.type) {
		case AppActionType.START_LOAD:
			return { ...state, isLoaded: false };
		case AppActionType.LOADED:
			return { ...state, isLoaded: true, yieldCurve: action.yieldCurve };
		case AppActionType.UPDATE_DEBUG:
			return { ...state, isDebug: action.debug };
		default:
			return state;
	}
};

export default app;
