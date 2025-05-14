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

import React, { useEffect } from 'react';
import { useParams, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { setFilePath, fetchCaptureSummary } from '../store/slices/captureSlice';
import { fetchViews } from '../store/slices/viewsSlice';
import CapturePanel from '../components/CapturePanel';

const CapturePage: React.FC = () => {
  const { filePath } = useParams<{ filePath: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const decodedFilePath = filePath ? decodeURIComponent(filePath) : '';

  const { timeWindow, filter } = useSelector((state: RootState) => state.capture);
  const { selectedViewId } = useSelector((state: RootState) => state.views);
  const { items: timelines } = useSelector((state: RootState) => state.timelines);
  const { drilldownInfoParam } = useSelector((state: RootState) => state.drilldown);

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const queryDrilldownInfoParam = queryParams.get('drilldownInfoParam');

  useEffect(() => {
    if (decodedFilePath) {
      dispatch(setFilePath(decodedFilePath));
      dispatch(fetchCaptureSummary(decodedFilePath));
      dispatch(fetchViews());
    }
  }, [dispatch, decodedFilePath]);

  // If we're at the root capture path, redirect to the overview view
  useEffect(() => {
    if (!location.pathname.includes('/views/')) {
      navigate(`capture/${filePath}/views/overview${location.search}`);
    }
  }, [location.pathname, filePath, navigate, location.search]);

  // Handle drilldown
  const handleDrillDown = (drilldownInfo: any) => {
    navigate(`capture/${filePath}/views/${drilldownInfo.viewId}?drilldownInfoParam=${drilldownInfo.drilldownInfoParam}`);
  };

  // Handle time window selection
  const handleSelectTimeWindow = (newTimeWindow: any) => {
    // This would be handled by a Redux action
    console.log('Select time window:', newTimeWindow);
  };

  // Handle filter application
  const handleApplyFilter = (newFilter: string) => {
    navigate(`capture/${filePath}/views/${selectedViewId}?filter=${encodeURIComponent(newFilter)}`);
  };

  // Handle search
  const handleApplySearch = (searchPattern: string) => {
    navigate(`capture/${filePath}/views/${selectedViewId}?searchPattern=${encodeURIComponent(searchPattern)}`);
  };

  return (
    <div className="wsd-page__content">
      <CapturePanel
        filePath={decodedFilePath}
        drilldownInfoParam={queryDrilldownInfoParam || drilldownInfoParam}
        timelines={timelines}
        timeWindow={timeWindow}
        selectedViewId={selectedViewId}
        filter={filter}
        onDrillDown={handleDrillDown}
        onSelectTimeWindow={handleSelectTimeWindow}
        onApplyFilter={handleApplyFilter}
        onApplySearch={handleApplySearch}
      >
        <Outlet />
      </CapturePanel>
    </div>
  );
};

export default CapturePage;
