import React from 'react';
import { Timeline } from '../store/slices/timelinesSlice';
import { TimeWindow } from '../store/slices/captureSlice';

interface CaptureOverviewProps {
  filePath: string;
  timelines: Timeline[];
  timeWindow: TimeWindow;
  filter: string | null;
  drilldownInfoParam: string | null;
  onToggleMetricTimeline: (metricId: string) => void;
  onDrillDown: (drilldownInfo: any) => void;
}

const CaptureOverview: React.FC<CaptureOverviewProps> = ({
  filePath,
  timelines,
  timeWindow,
  filter,
  drilldownInfoParam,
  onToggleMetricTimeline,
  onDrillDown,
}) => {
  // This is a placeholder component
  return (
    <div className="wsd-capture-overview">
      <div className="wsd-capture-overview__header">
        <h2>Overview</h2>
      </div>
      <div className="wsd-capture-overview__content">
        <div className="wsd-capture-overview__metrics">
          <div className="wsd-capture-overview__metric" onClick={() => onToggleMetricTimeline('cpu')}>
            CPU Usage
          </div>
          <div className="wsd-capture-overview__metric" onClick={() => onToggleMetricTimeline('memory')}>
            Memory Usage
          </div>
          <div className="wsd-capture-overview__metric" onClick={() => onToggleMetricTimeline('io')}>
            I/O Activity
          </div>
          <div className="wsd-capture-overview__metric" onClick={() => onToggleMetricTimeline('network')}>
            Network Activity
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptureOverview;
