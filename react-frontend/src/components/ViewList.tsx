import React from 'react';

interface ViewListProps {
  selectedViewId: string | null;
  steps: any[];
  onSelect: (viewId: string) => void;
}

const ViewList: React.FC<ViewListProps> = ({ selectedViewId, steps, onSelect }) => {
  // This is a placeholder component
  return (
    <div className="wsd-view-list">
      <div 
        className={`wsd-view-list__item ${selectedViewId === 'overview' ? 'wsd-view-list__item--is-selected' : ''}`}
        onClick={() => onSelect('overview')}
      >
        Overview
      </div>
      <div 
        className={`wsd-view-list__item ${selectedViewId === 'dig' ? 'wsd-view-list__item--is-selected' : ''}`}
        onClick={() => onSelect('dig')}
      >
        Dig
      </div>
      <div 
        className={`wsd-view-list__item ${selectedViewId === 'echo' ? 'wsd-view-list__item--is-selected' : ''}`}
        onClick={() => onSelect('echo')}
      >
        Echo
      </div>
    </div>
  );
};

export default ViewList;
