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

// This is a placeholder for the actual icon implementation
// In a real implementation, you would import SVG icons or use an icon library

interface IconProps {
  name: string;
  width?: number;
  height?: number;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ 
  name, 
  width = 24, 
  height = 24, 
  className = '' 
}) => {
  // In a real implementation, you would render the appropriate SVG based on the name
  // For now, we'll just render a placeholder
  return (
    <svg 
      className={`icon ${className}`} 
      width={width} 
      height={height} 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {/* This is a placeholder. In a real implementation, you would render the actual icon */}
      <rect x="0" y="0" width="24" height="24" fill="none" />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="10">
        {name.split('_')[0]}
      </text>
    </svg>
  );
};

export default Icon;
