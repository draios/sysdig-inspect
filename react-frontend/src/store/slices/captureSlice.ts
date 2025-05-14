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

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';

export interface TimeWindow {
  from: number | null;
  to: number | null;
}

interface CaptureState {
  filePath: string | null;
  summary: any | null;
  filter: string | null;
  searchPattern: string | null;
  timeWindow: TimeWindow;
  isLoading: boolean;
  error: string | null;
}

const initialState: CaptureState = {
  filePath: null,
  summary: null,
  filter: null,
  searchPattern: null,
  timeWindow: {
    from: null,
    to: null,
  },
  isLoading: false,
  error: null,
};

export const fetchCaptureSummary = createAsyncThunk(
  'capture/fetchSummary',
  async (filePath: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { capture: CaptureState };
      const filter = state.capture.filter;
      const response = await apiService.getCaptureSummary(filePath, filter);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const captureSlice = createSlice({
  name: 'capture',
  initialState,
  reducers: {
    setFilePath: (state, action: PayloadAction<string>) => {
      state.filePath = action.payload;
    },
    setFilter: (state, action: PayloadAction<string | null>) => {
      state.filter = action.payload;
    },
    setSearchPattern: (state, action: PayloadAction<string | null>) => {
      state.searchPattern = action.payload;
    },
    setTimeWindow: (state, action: PayloadAction<TimeWindow>) => {
      state.timeWindow = action.payload;
    },
    resetCapture: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCaptureSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCaptureSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload;
        // If the summary contains time information, update the time window
        if (action.payload && action.payload.from !== undefined && action.payload.to !== undefined) {
          state.timeWindow = {
            from: action.payload.from,
            to: action.payload.to,
          };
        }
      })
      .addCase(fetchCaptureSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilePath, setFilter, setSearchPattern, setTimeWindow, resetCapture } = captureSlice.actions;

export default captureSlice.reducer;
