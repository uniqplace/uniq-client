import React from 'react';
import SearchBar from './SearchBar';
import FiltersBar from './FiltersBar';

const MarketplaceFilters: React.FC = () => {
    return (
        <>
            <SearchBar />
            <FiltersBar />
        </>
    );
};

export default MarketplaceFilters;
