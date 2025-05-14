import React from 'react';
import { Timeline } from '../store/slices/timelinesSlice';
import { TimeWindow } from '../store/slices/captureSlice';

interface MetricTimelinesProps {
  timeWindow: TimeWindow;
  filter: string | null;
  timelines: Timeline[];
  filePath: string;
  onSelectTimeWindow: (timeWindow: TimeWindow) => void;
  onDrillDown: (drilldownInfo: any) => void;
  onRemove: (timelineId: string) => void;
}

const MetricTimelines: React.FC<MetricTimelinesProps> = ({
  timeWindow,
  filter,
  timelines,
  filePath,
  onSelectTimeWindow,
  onDrillDown,
  onRemove,
}) => {
  // This is a placeholder component
  return (
    <div className="wsd-metric-timelines">
      {timelines.length === 0 ? (
        <div className="wsd-metric-timelines__empty">
          No timelines selected
        </div>
      ) : (
        <div className="wsd-metric-timelines__list">
          {timelines.map((timeline) => (
            <div key={timeline.id} className="wsd-metric-timelines__item">
              <div className="wsd-metric-timelines__item-header">
                <div className="wsd-metric-timelines__item-name">{timeline.name}</div>
                <button 
                  className="wsd-metric-timelines__item-remove"
                  onClick={() => onRemove(timeline.id)}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MetricTimelines;
