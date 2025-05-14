/*
Copyright (C) 2017 Draios inc.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License version 2 as
published by the Free Software Foundation.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { configureStore } from '@reduxjs/toolkit';
import captureReducer from './slices/captureSlice';
import viewsReducer from './slices/viewsSlice';
import timelinesReducer from './slices/timelinesSlice';
import drilldownReducer from './slices/drilldownSlice';

export const store = configureStore({
  reducer: {
    capture: captureReducer,
    views: viewsReducer,
    timelines: timelinesReducer,
    drilldown: drilldownReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
