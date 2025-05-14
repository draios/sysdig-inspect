import React from 'react';

interface PromiseWaitOverlayProps {
  isLoading: boolean;
  error: string | null;
  children: React.ReactNode;
}

const PromiseWaitOverlay: React.FC<PromiseWaitOverlayProps> = ({
  isLoading,
  error,
  children,
}) => {
  if (isLoading) {
    return (
      <div className="sd-promise-wait-overlay">
        <div className="sd-promise-wait-overlay__content">
          <div className="sd-promise-wait-overlay__spinner"></div>
          <div className="sd-promise-wait-overlay__text">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sd-promise-wait-overlay sd-promise-wait-overlay--error">
        <div className="sd-promise-wait-overlay__content">
          <div className="sd-promise-wait-overlay__error-icon">!</div>
          <div className="sd-promise-wait-overlay__text">Error: {error}</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PromiseWaitOverlay;
