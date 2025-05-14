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
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

// Helper function to check if we're running in Electron
const isElectron = () => {
  return !!(window && (window as any).process && (window as any).process.type);
};

const WelcomePage: React.FC = () => {
  const [filePath, setFilePath] = useState('');
  const navigate = useNavigate();

  const openFileBrowser = () => {
    if (isElectron()) {
      // In Electron, use the remote module to open a file dialog
      const { remote } = (window as any).require('electron');
      const fileNames = remote.dialog.showOpenDialogSync({
        properties: ['openFile'],
        filters: [
          { name: 'Capture Files', extensions: ['scap', 'cap'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (fileNames && fileNames.length > 0) {
        openFile(fileNames[0]);
      }
    }
  };

  const openFile = (path: string) => {
    navigate(`capture/${encodeURIComponent(path)}`);
  };

  const handleFilePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilePath(e.target.value);
  };

  const handleFilePathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filePath) {
      openFile(filePath);
    }
  };

  return (
    <div className="wsd-welcome">
      <div className="wsd-welcome__hero">
        <img src={`${process.env.PUBLIC_URL}/assets/images/sysdig-inspect-logo-color-620x96.png`} alt="Sysdig Inspect" />
      </div>

      <div className="wsd-welcome__body">
        <div className="wsd-welcome__card-list">
          <div className="wsd-welcome__card">
            <div className="wsd-welcome__card-header">
              Inspect
            </div>
            <div className="wsd-welcome__card-content">
              Sysdig Inspect works with trace files that have been collected by sysdig on a Linux system.
            </div>
            <div className="wsd-welcome__card-footer">
              {isElectron() ? (
                <Button
                  iconName="file_black"
                  className="sd-button--raised"
                  size="lg"
                  title="Open capture"
                  onClick={openFileBrowser}
                >
                  Open Capture
                </Button>
              ) : (
                <form onSubmit={handleFilePathSubmit}>
                  <input
                    type="text"
                    className="sd-input"
                    placeholder="Capture file path"
                    value={filePath}
                    onChange={handleFilePathChange}
                  />
                  <button type="submit" style={{ display: 'none' }}></button>
                </form>
              )}
            </div>
            <div className="wsd-welcome__card-extra-footer">
              {isElectron() && (
                <span>or try one of the sample captures</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
