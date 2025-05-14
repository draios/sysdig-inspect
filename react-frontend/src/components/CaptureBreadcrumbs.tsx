import React from 'react';

interface CaptureBreadcrumbsProps {
  steps: any[];
  onSelect: (index: number) => void;
}

const CaptureBreadcrumbs: React.FC<CaptureBreadcrumbsProps> = ({ steps, onSelect }) => {
  return (
    <div className="wsd-capture-breadcrumbs">
      {steps.map((step, index) => (
        <div 
          key={index} 
          className="wsd-capture-breadcrumbs__step"
          onClick={() => onSelect(index)}
        >
          {step.viewId}
          {index < steps.length - 1 && <span className="wsd-capture-breadcrumbs__separator">/</span>}
        </div>
      ))}
    </div>
  );
};

export default CaptureBreadcrumbs;
