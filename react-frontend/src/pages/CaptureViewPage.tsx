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
import { useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { setSelectedViewId, fetchViewData } from '../store/slices/viewsSlice';
import { setDrilldownInfoParam } from '../store/slices/drilldownSlice';
import CaptureView from '../components/CaptureView';

const CaptureViewPage: React.FC = () => {
  const { id, filePath } = useParams<{ id: string; filePath: string }>();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const { filter, timeWindow } = useSelector((state: RootState) => state.capture);
  const { viewData } = useSelector((state: RootState) => state.views);
  const { items: timelines } = useSelector((state: RootState) => state.timelines);

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const drilldownInfoParam = queryParams.get('drilldownInfoParam');
  const queryFilter = queryParams.get('filter');

  const decodedFilePath = filePath ? decodeURIComponent(filePath) : '';
  const viewId = id || 'overview';

  useEffect(() => {
    if (viewId) {
      dispatch(setSelectedViewId(viewId));
    }
  }, [dispatch, viewId]);

  useEffect(() => {
    if (drilldownInfoParam) {
      dispatch(setDrilldownInfoParam(drilldownInfoParam));
    }
  }, [dispatch, drilldownInfoParam]);

  useEffect(() => {
    if (decodedFilePath && viewId) {
      dispatch(fetchViewData({
        filePath: decodedFilePath,
        viewId,
        filter: queryFilter || filter || undefined,
        timeWindow
      }));
    }
  }, [dispatch, decodedFilePath, viewId, queryFilter, filter, timeWindow]);

  const currentViewData = viewData[viewId];

  const handleSelect = (selection: any) => {
    console.log('Selected:', selection);
    // This would be handled by a Redux action
  };

  const handleDrillDown = (drilldownInfo: any) => {
    console.log('Drill down:', drilldownInfo);
    // This would be handled by a Redux action and navigation
  };

  return (
    <CaptureView
      viewId={viewId}
      captureInfo={{ filePath: decodedFilePath }}
      drilldownInfoParam={drilldownInfoParam}
      filter={queryFilter || filter}
      timelines={timelines}
      timeWindow={timeWindow}
      viewData={currentViewData?.data}
      isLoading={currentViewData?.isLoading}
      error={currentViewData?.error}
      onSelect={handleSelect}
      onDrillDown={handleDrillDown}
    />
  );
};

export default CaptureViewPage;
