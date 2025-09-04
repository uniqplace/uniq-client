import React, { useEffect, useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import type { AppDispatch } from '../../../store';
import { updateFilters } from '../slices/marketplaceSlice';
import { useNavigate, useLocation } from 'react-router-dom';

const SearchBar: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const { filters } = useSelector((state: RootState) => state.marketplace);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
    const debounceTimeout = useRef<number | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlSearch = params.get('q') || '';
        setSearchTerm(urlSearch);
        dispatch(updateFilters({ ...filters, searchTerm: urlSearch }));
        // eslint-disable-next-line
    }, [location.search]);

    // Debounce search on input change
    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = window.setTimeout(() => {
            const trimmedSearch = searchTerm.trim();
            const params = new URLSearchParams(location.search);
            if (trimmedSearch) params.set('q', trimmedSearch);
            else params.delete('q');
            navigate({ pathname: location.pathname, search: params.toString() }, { replace: false });
            dispatch(updateFilters({ ...filters, searchTerm: trimmedSearch }));
        }, 400);
        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
        // eslint-disable-next-line
    }, [searchTerm]);

    return (
        <div className="mb-4 flex items-center gap-2 w-full">
            <span className="p-float-label flex-1 relative">
                <InputText
                    id="search"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-8 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={{ height: '40px', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                />
                {searchTerm && (
                    <span title="Clear search">
                        <Button
                            type="button"
                            icon="pi pi-times"
                            className="p-button-text p-button-sm absolute right-2 top-1/2 -translate-y-1/2 z-10 searchbar-x-btn"
                            style={{ padding: 0, minWidth: 0, width: 24, height: 24 }}
                            onClick={() => {
                                setSearchTerm('');
                                const params = new URLSearchParams(location.search);
                                params.delete('q');
                                navigate({ pathname: location.pathname, search: params.toString() }, { replace: false });
                            }}
                            aria-label="Clear search"
                        />
                    </span>
                )}
                <label htmlFor="search">
                    <i className="pi pi-search text-gray-400 mr-2" /> Search product, brand etc...
                </label>
            </span>
        </div>
    );
};

export default SearchBar;