import { Action } from 'redux';

export interface AppState {
	isLoaded: boolean;
	yieldCurve: IYieldCurve[];
	isDebug: boolean;
}

export enum AppActionType {
	START_LOAD = 'START_LOAD',
	LOADED = 'LOADED',
	UPDATE_PAGE_DATA = 'UPDATE_PAGE_DATA',
	UPDATE_PAGE = 'UPDATE_PAGE',
	SCROLL = 'SCROLL',
	UPDATE_DEBUG = 'UPDATE_DEBUG',
}

export interface IYieldCurve {
	date: string;
	m1: number | null;
	m2: number | null;
	m3: number;
	m6: number;
	y1: number;
	y3: number;
	y5: number;
	y7: number;
	y10: number;
	y20: number;
	y30: number;
}

export interface LoadedAction extends Action {
	type: AppActionType.LOADED;
	yieldCurve: IYieldCurve[];
}

export interface startLoadAction extends Action {
	type: AppActionType.START_LOAD;
}

export interface UpdateDebugAction extends Action {
	type: AppActionType.UPDATE_DEBUG;
	debug: boolean;
}

export type AppActions = LoadedAction | startLoadAction | UpdateDebugAction;
