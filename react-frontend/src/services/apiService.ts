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

// We're using mock data for now
import { mockApiService } from './mockApiService';

// Use mock API service for development
export const apiService = mockApiService;

// Uncomment the following code when you want to use the real API service
/*
// Determine if we're running in Electron
const isElectron = () => {
  return !!(window && (window as any).process && (window as any).process.type);
};

// Get the base URL for API requests
const getBaseUrl = () => {
  if (isElectron()) {
    // In Electron, we need to get the server port from the global context
    const remote = (window as any).require('electron').remote;
    const serverPort = remote.getGlobal('serverPort');
    return `http://localhost:${serverPort}`;
  } else {
    // In web mode, use the proxy configured in package.json
    return '';
  }
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const realApiService = {
  // Get the list of available views
  getViews: async () => {
    const response = await api.get('/capture/views');
    return response.data;
  },

  // Get the summary of a capture file
  getCaptureSummary: async (filePath: string, filter?: string | null) => {
    const params = filter ? { filter } : {};
    const response = await api.get(`/capture/${encodeURIComponent(filePath)}/summary`, { params });
    return response.data;
  },

  // Get the data for a specific view
  getViewData: async (
    filePath: string,
    viewId: string,
    filter?: string | null,
    viewAs?: string,
    timeWindow?: { from: number | null; to: number | null }
  ) => {
    // Construct the view parameters
    const viewParams: any = { id: viewId };

    if (filter) {
      viewParams.filter = filter;
    }

    if (viewAs) {
      viewParams.viewAs = viewAs;
    }

    // Encode the view parameters as JSON
    const encodedViewParams = encodeURIComponent(JSON.stringify(viewParams));

    // Construct the URL
    let url = `/capture/${encodeURIComponent(filePath)}/${encodedViewParams}`;

    // Add time window parameters if provided
    const params: any = {};
    if (timeWindow && timeWindow.from !== null) {
      params.from = timeWindow.from;
    }
    if (timeWindow && timeWindow.to !== null) {
      params.to = timeWindow.to;
    }

    const response = await api.get(url, { params });
    return response.data;
  },
};
*/
