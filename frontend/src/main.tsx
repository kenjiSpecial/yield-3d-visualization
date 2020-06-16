import * as React from 'react';
import { render } from 'react-dom';
import { App } from './components/App';
import { getUrlParameter } from './utils/function';
import { store } from './store';
import { updateDebugHandler } from './store/app';

// store.dispatch(updateDebugHandler(getUrlParameter('debug')));
store.dispatch(updateDebugHandler(true));
const rootElement = document.getElementById('root');
render(<App />, rootElement);
