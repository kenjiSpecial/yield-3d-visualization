import { AppActionType, startLoadAction, LoadedAction, UpdateDebugAction, IYield } from './types';

export const startLoadHandler = (): startLoadAction => ({
	type: AppActionType.START_LOAD,
});

export const loadedHandler = (yieldCurve: IYield[]): LoadedAction => ({
	type: AppActionType.LOADED,
	yieldCurve: yieldCurve,
});

export const updateDebugHandler = (debug: boolean): UpdateDebugAction => ({
	type: AppActionType.UPDATE_DEBUG,
	debug: debug,
});
