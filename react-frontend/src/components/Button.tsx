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
import Icon from './Icon';

interface ButtonProps {
  children?: React.ReactNode;
  iconName?: string;
  size?: 'sm' | 'md' | 'lg';
  isWhite?: boolean;
  isLight?: boolean;
  isPrimary?: boolean;
  isActive?: boolean;
  isRaised?: boolean;
  isFab?: boolean;
  highlightOnHover?: boolean;
  className?: string;
  title?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  dataRef?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  iconName,
  size,
  isWhite = false,
  isLight = false,
  isPrimary = false,
  isActive = false,
  isRaised = false,
  isFab = false,
  highlightOnHover = false,
  className = '',
  title,
  onClick,
  dataRef,
}) => {
  const buttonClasses = [
    'sd-button',
    size === 'sm' ? 'sd-button--sm' : '',
    size === 'lg' ? 'sd-button--lg' : '',
    isWhite ? 'sd-button--is-white' : '',
    isLight ? 'sd-button--is-light' : '',
    isPrimary ? 'sd-button--is-primary' : '',
    isActive ? 'sd-button--is-active' : '',
    isRaised ? 'sd-button--raised' : '',
    isFab ? 'sd-button--fab' : '',
    highlightOnHover ? 'sd-button--highlight-on-hover' : '',
    className,
  ].filter(Boolean).join(' ');

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 32 : 24;

  return (
    <button 
      className={buttonClasses} 
      onClick={onClick} 
      title={title}
      data-ref={dataRef}
    >
      {iconName && <Icon name={iconName} width={iconSize} height={iconSize} />}
      {children && <span className="sd-button__text">{children}</span>}
    </button>
  );
};

export default Button;
