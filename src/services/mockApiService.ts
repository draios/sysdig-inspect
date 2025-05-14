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

// Mock data for views
const mockViews = [
  {
    id: 'overview',
    name: 'Overview',
    description: 'Overview of the capture',
    tags: ['wsysdig'],
  },
  {
    id: 'dig',
    name: 'Dig',
    description: 'Dig into the capture data',
    tags: ['wsysdig'],
  },
  {
    id: 'echo',
    name: 'Echo',
    description: 'Echo view',
    tags: ['wsysdig'],
  },
  {
    id: 'traces_summary',
    name: 'Traces Summary',
    description: 'Summary of traces',
    tags: ['wsysdig'],
  }
];

// Mock data for capture summary
const mockCaptureSummary = {
  from: 1000000,
  to: 2000000,
  metrics: [
    {
      id: 'cpu',
      name: 'CPU Usage',
      data: [
        { timestamp: 1000000, value: 10 },
        { timestamp: 1100000, value: 20 },
        { timestamp: 1200000, value: 15 },
        { timestamp: 1300000, value: 25 },
        { timestamp: 1400000, value: 30 },
        { timestamp: 1500000, value: 20 },
        { timestamp: 1600000, value: 15 },
        { timestamp: 1700000, value: 10 },
        { timestamp: 1800000, value: 5 },
        { timestamp: 1900000, value: 10 },
        { timestamp: 2000000, value: 15 },
      ]
    },
    {
      id: 'memory',
      name: 'Memory Usage',
      data: [
        { timestamp: 1000000, value: 100 },
        { timestamp: 1100000, value: 120 },
        { timestamp: 1200000, value: 150 },
        { timestamp: 1300000, value: 200 },
        { timestamp: 1400000, value: 250 },
        { timestamp: 1500000, value: 300 },
        { timestamp: 1600000, value: 350 },
        { timestamp: 1700000, value: 400 },
        { timestamp: 1800000, value: 450 },
        { timestamp: 1900000, value: 500 },
        { timestamp: 2000000, value: 550 },
      ]
    }
  ]
};

// Mock data for view data
const mockViewData = {
  slices: [
    {
      columns: [
        { name: 'Time', type: 'time' },
        { name: 'Process', type: 'string' },
        { name: 'PID', type: 'number' },
        { name: 'CPU', type: 'number' },
        { name: 'Memory', type: 'number' },
      ],
      data: [
        [1000000, 'systemd', 1, 0.5, 100],
        [1100000, 'bash', 1234, 1.2, 50],
        [1200000, 'nginx', 2345, 2.5, 200],
        [1300000, 'node', 3456, 5.0, 300],
        [1400000, 'python', 4567, 3.2, 150],
        [1500000, 'java', 5678, 10.5, 500],
        [1600000, 'chrome', 6789, 15.0, 800],
        [1700000, 'firefox', 7890, 12.5, 750],
        [1800000, 'vscode', 8901, 8.0, 400],
        [1900000, 'docker', 9012, 6.5, 350],
      ]
    }
  ]
};

export const mockApiService = {
  // Get the list of available views
  getViews: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockViews;
  },

  // Get the summary of a capture file
  getCaptureSummary: async (filePath: string, filter?: string | null) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockCaptureSummary;
  },

  // Get the data for a specific view
  getViewData: async (
    filePath: string, 
    viewId: string, 
    filter?: string | null, 
    viewAs?: string,
    timeWindow?: { from: number | null; to: number | null }
  ) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockViewData;
  },
};
