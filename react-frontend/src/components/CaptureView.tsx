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

import React from 'react';
import { Timeline } from '../store/slices/timelinesSlice';
import { TimeWindow } from '../store/slices/captureSlice';
import CaptureOverview from './CaptureOverview';
import CaptureDataTable from './CaptureDataTable';
import PromiseWaitOverlay from './PromiseWaitOverlay';

interface CaptureViewProps {
  viewId: string;
  captureInfo: {
    filePath: string;
  };
  drilldownInfoParam: string | null;
  filter: string | null;
  timelines: Timeline[];
  timeWindow: TimeWindow;
  viewData: any;
  isLoading: boolean;
  error: string | null;
  onSelect: (selection: any) => void;
  onDrillDown: (drilldownInfo: any) => void;
}

const CaptureView: React.FC<CaptureViewProps> = ({
  viewId,
  captureInfo,
  drilldownInfoParam,
  filter,
  timelines,
  timeWindow,
  viewData,
  isLoading,
  error,
  onSelect,
  onDrillDown,
}) => {
  const isOverview = viewId === 'overview';

  const handleToggleMetricTimeline = (metricId: string) => {
    // This would be handled by a Redux action
    console.log('Toggle metric timeline:', metricId);
  };

  if (isOverview) {
    return (
      <CaptureOverview
        filePath={captureInfo.filePath}
        timelines={timelines}
        timeWindow={timeWindow}
        filter={filter}
        drilldownInfoParam={drilldownInfoParam}
        onToggleMetricTimeline={handleToggleMetricTimeline}
        onDrillDown={onDrillDown}
      />
    );
  }

  return (
    <div className="wsd-capture-view__content">
      <PromiseWaitOverlay isLoading={isLoading} error={error}>
        {viewData && (
          <CaptureDataTable
            data={viewData}
            onSelect={onSelect}
            onDrillDown={onDrillDown}
          />
        )}
      </PromiseWaitOverlay>
    </div>
  );
};

export default CaptureView;
