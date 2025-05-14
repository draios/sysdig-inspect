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

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DrilldownStep {
  viewId: string;
  selection: any;
}

interface DrilldownState {
  steps: DrilldownStep[];
  drilldownInfoParam: string | null;
}

const initialState: DrilldownState = {
  steps: [],
  drilldownInfoParam: null,
};

const drilldownSlice = createSlice({
  name: 'drilldown',
  initialState,
  reducers: {
    addDrilldownStep: (state, action: PayloadAction<DrilldownStep>) => {
      state.steps.push(action.payload);
      // Update the drilldownInfoParam
      state.drilldownInfoParam = convertToUrlParam(state.steps);
    },
    navigateToDrilldownStep: (state, action: PayloadAction<number>) => {
      // Navigate to a specific step by index (truncate the steps array)
      if (action.payload >= 0 && action.payload < state.steps.length) {
        state.steps = state.steps.slice(0, action.payload + 1);
        // Update the drilldownInfoParam
        state.drilldownInfoParam = convertToUrlParam(state.steps);
      }
    },
    setDrilldownSteps: (state, action: PayloadAction<DrilldownStep[]>) => {
      state.steps = action.payload;
      // Update the drilldownInfoParam
      state.drilldownInfoParam = convertToUrlParam(state.steps);
    },
    setDrilldownInfoParam: (state, action: PayloadAction<string>) => {
      state.drilldownInfoParam = action.payload;
      // Parse the param and update steps
      state.steps = convertFromUrlParam(action.payload);
    },
    resetDrilldown: () => initialState,
  },
});

// Helper functions to convert between steps and URL param
function convertToUrlParam(steps: DrilldownStep[]): string {
  if (steps.length === 0) {
    return '';
  }
  
  return encodeURIComponent(JSON.stringify(steps));
}

function convertFromUrlParam(param: string): DrilldownStep[] {
  if (!param) {
    return [];
  }
  
  try {
    return JSON.parse(decodeURIComponent(param));
  } catch (error) {
    console.error('Error parsing drilldown info param:', error);
    return [];
  }
}

export const { 
  addDrilldownStep, 
  navigateToDrilldownStep, 
  setDrilldownSteps, 
  setDrilldownInfoParam,
  resetDrilldown 
} = drilldownSlice.actions;

export default drilldownSlice.reducer;
