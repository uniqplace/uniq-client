import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import type { AppDispatch } from '../../../store';
import { fetchProducts } from '../thunks';
import { updateFilters } from '../slices/marketplaceSlice';

const SearchBar: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const { filters } = useSelector((state: RootState) => state.marketplace);
    const [searchTerm, setSearchTerm] = React.useState(filters.searchTerm || '');

    const handleSearch = () => {
        const trimmedSearch = searchTerm.trim();
        dispatch(updateFilters({ ...filters, searchTerm: trimmedSearch }));
        dispatch(fetchProducts({
            ...filters,
            q: trimmedSearch,
            page: 1,
        }));
    };

    return (
        <div className="mb-4 flex items-center gap-2 w-full">
            <span className="p-float-label flex-1">
                <InputText id="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full" />
                <label htmlFor="search">Search</label>
            </span>
            <Button label="Search" icon="pi pi-search" onClick={handleSearch} className="ml-2" />
        </div>
    );
};

export default SearchBar;
