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

export interface Timeline {
  id: string;
  name: string;
  description?: string;
  data?: any[];
}

interface TimelinesState {
  items: Timeline[];
}

const initialState: TimelinesState = {
  items: [],
};

const timelinesSlice = createSlice({
  name: 'timelines',
  initialState,
  reducers: {
    addTimeline: (state, action: PayloadAction<Timeline>) => {
      // Check if timeline already exists
      const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (existingIndex === -1) {
        state.items.push(action.payload);
      }
    },
    removeTimeline: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateTimelineData: (state, action: PayloadAction<{ id: string; data: any[] }>) => {
      const timeline = state.items.find(item => item.id === action.payload.id);
      if (timeline) {
        timeline.data = action.payload.data;
      }
    },
    setTimelines: (state, action: PayloadAction<Timeline[]>) => {
      state.items = action.payload;
    },
    resetTimelines: () => initialState,
  },
});

export const { 
  addTimeline, 
  removeTimeline, 
  updateTimelineData, 
  setTimelines, 
  resetTimelines 
} = timelinesSlice.actions;

export default timelinesSlice.reducer;
