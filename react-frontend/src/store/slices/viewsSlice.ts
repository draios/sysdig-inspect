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

export interface View {
  id: string;
  name: string;
  description: string;
  drilldownTarget?: string;
  appliesTo?: string[];
  tags?: string[];
  filter?: string;
}

export interface ViewData {
  id: string;
  data: any;
  isLoading: boolean;
  error: string | null;
}

interface ViewsState {
  list: View[];
  selectedViewId: string | null;
  viewData: Record<string, ViewData>;
  isLoading: boolean;
  error: string | null;
}

const initialState: ViewsState = {
  list: [],
  selectedViewId: null,
  viewData: {},
  isLoading: false,
  error: null,
};

export const fetchViews = createAsyncThunk(
  'views/fetchViews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getViews();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchViewData = createAsyncThunk(
  'views/fetchViewData',
  async (
    { filePath, viewId, filter, viewAs, timeWindow }: 
    { filePath: string; viewId: string; filter?: string; viewAs?: string; timeWindow?: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.getViewData(filePath, viewId, filter, viewAs, timeWindow);
      return { viewId, data: response };
    } catch (error: any) {
      return rejectWithValue({ viewId, error: error.message });
    }
  }
);

const viewsSlice = createSlice({
  name: 'views',
  initialState,
  reducers: {
    setSelectedViewId: (state, action: PayloadAction<string>) => {
      state.selectedViewId = action.payload;
    },
    resetViews: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchViews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchViews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchViews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchViewData.pending, (state, action) => {
        const viewId = action.meta.arg.viewId;
        if (!state.viewData[viewId]) {
          state.viewData[viewId] = {
            id: viewId,
            data: null,
            isLoading: true,
            error: null,
          };
        } else {
          state.viewData[viewId].isLoading = true;
          state.viewData[viewId].error = null;
        }
      })
      .addCase(fetchViewData.fulfilled, (state, action) => {
        const { viewId, data } = action.payload;
        state.viewData[viewId] = {
          id: viewId,
          data,
          isLoading: false,
          error: null,
        };
      })
      .addCase(fetchViewData.rejected, (state, action) => {
        const payload = action.payload as { viewId: string; error: string };
        state.viewData[payload.viewId] = {
          id: payload.viewId,
          data: null,
          isLoading: false,
          error: payload.error,
        };
      });
  },
});

export const { setSelectedViewId, resetViews } = viewsSlice.actions;

export default viewsSlice.reducer;
