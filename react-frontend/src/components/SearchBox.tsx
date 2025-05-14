import React, { useState } from 'react';

interface SearchBoxProps {
  name: string;
  onSearch: (searchPattern: string) => void;
  onCancel: () => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ name, onSearch, onCancel }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchValue);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="sd-search-box">
      <input
        type="text"
        className="sd-search-box__input"
        name={name}
        value={searchValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
        autoFocus
      />
      <button 
        className="sd-search-box__cancel"
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
};

export default SearchBox;
