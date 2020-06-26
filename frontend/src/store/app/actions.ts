import {
	AppActionType,
	startLoadAction,
	LoadedAction,
	UpdateDebugAction,
	IYieldCurve,
} from './types';

export const startLoadHandler = (): startLoadAction => ({
	type: AppActionType.START_LOAD,
});

export const loadedHandler = (yieldCurve: {
	country: string;
	data: IYieldCurve[];
}): LoadedAction => ({
	type: AppActionType.LOADED,
	yieldCurve: yieldCurve,
});

export const updateDebugHandler = (debug: boolean): UpdateDebugAction => ({
	type: AppActionType.UPDATE_DEBUG,
	debug: debug,
});
