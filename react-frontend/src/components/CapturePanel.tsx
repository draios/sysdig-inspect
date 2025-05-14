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

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Button from './Button';
import CaptureBreadcrumbs from './CaptureBreadcrumbs';
import ViewList from './ViewList';
import MetricTimelines from './MetricTimelines';
import SearchBox from './SearchBox';
import { Timeline } from '../store/slices/timelinesSlice';
import { TimeWindow } from '../store/slices/captureSlice';

interface CapturePanelProps {
  filePath: string;
  drilldownInfoParam: string | null;
  timelines: Timeline[];
  timeWindow: TimeWindow;
  selectedViewId: string | null;
  filter: string | null;
  children: React.ReactNode;
  onDrillDown: (drilldownInfo: any) => void;
  onSelectTimeWindow: (timeWindow: TimeWindow) => void;
  onApplyFilter: (filter: string) => void;
  onApplySearch: (searchPattern: string) => void;
}

const CapturePanel: React.FC<CapturePanelProps> = ({
  filePath,
  drilldownInfoParam,
  timelines,
  timeWindow,
  selectedViewId,
  filter,
  children,
  onDrillDown,
  onSelectTimeWindow,
  onApplyFilter,
  onApplySearch,
}) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(!!filter);
  const drilldownSteps = useSelector((state: RootState) => state.drilldown.steps);

  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
  };

  const closeSearch = () => {
    setIsSearchActive(false);
  };

  const toggleFilter = () => {
    setIsFilterActive(!isFilterActive);
  };

  const handleApplyFilter = (newFilter: string) => {
    onApplyFilter(newFilter);
  };

  const handleApplySearch = (searchPattern: string) => {
    onApplySearch(searchPattern);
    closeSearch();
  };

  const handleSelectView = (viewId: string) => {
    // This would navigate to the selected view
    console.log('Select view:', viewId);
  };

  const handleRemoveMetricTimeline = (timelineId: string) => {
    // This would be handled by a Redux action
    console.log('Remove timeline:', timelineId);
  };

  return (
    <div className="wsd-capture-panel">
      <div className="wsd-capture-panel__header">
        <div className="wsd-capture-panel__breadcrumbs">
          <CaptureBreadcrumbs
            steps={drilldownSteps}
            onSelect={(index) => console.log('Navigate to step:', index)}
          />
        </div>

        <div className="wsd-capture-panel__controls">
          <div className="wsd-capture-panel__control">
            <Button
              iconName="search_black"
              title="Find Text"
              className="sd-button--fab sd-button--highlight-on-hover"
              isActive={isSearchActive}
              onClick={toggleSearch}
            />
          </div>
        </div>
      </div>

      <div className="wsd-capture-panel__content">
        <div className="wsd-capture-panel__view-list">
          <ViewList
            selectedViewId={selectedViewId}
            steps={drilldownSteps}
            onSelect={handleSelectView}
          />
        </div>

        <div className="wsd-capture-panel__data">
          <div className="wsd-capture-panel__data-header">
            {isFilterActive && (
              <div className="wsd-capture-panel__data-settings-filter">
                <label className="wsd-capture-panel__data-settings-label">
                  <span className="wsd-capture-panel__data-settings-label-text">Filter</span>
                </label>
                <div className="wsd-capture-panel__data-settings-input">
                  <input
                    type="text"
                    className="sd-input"
                    defaultValue={filter || ''}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleApplyFilter(e.currentTarget.value);
                      }
                    }}
                  />
                </div>
              </div>
            )}
            {isSearchActive && (
              <div className="wsd-capture-panel__data-settings-search">
                <label className="wsd-capture-panel__data-settings-label">
                  <span className="wsd-capture-panel__data-settings-label-text">Find Text</span>
                </label>
                <div className="wsd-capture-panel__data-settings-input">
                  <SearchBox
                    name="search"
                    onSearch={handleApplySearch}
                    onCancel={closeSearch}
                  />
                </div>
              </div>
            )}
          </div>

          {children}
        </div>
      </div>

      <div className="wsd-capture-panel__timelines">
        <MetricTimelines
          timeWindow={timeWindow}
          filter={filter}
          timelines={timelines}
          filePath={filePath}
          onSelectTimeWindow={onSelectTimeWindow}
          onDrillDown={onDrillDown}
          onRemove={handleRemoveMetricTimeline}
        />
      </div>
    </div>
  );
};

export default CapturePanel;
