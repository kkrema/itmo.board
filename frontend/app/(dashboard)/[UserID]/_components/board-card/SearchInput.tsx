import React, { useState } from 'react';

export const SearchInput = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
            placeholder="Поиск досок..."
        />
    );
};
