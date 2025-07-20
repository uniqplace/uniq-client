import React, { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import type { AppDispatch } from '../../../store';
import { fetchProducts } from '../thunks';
import { updateFilters } from '../slices/marketplaceSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import type { CategoryFiltersType } from '../../../types';

const SearchBar: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const { filters, loading } = useSelector((state: RootState) => state.marketplace);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');

    // On mount, read searchTerm from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlSearch = params.get('q') || '';
        setSearchTerm(urlSearch);
        dispatch(updateFilters({ ...filters, searchTerm: urlSearch })); // keep Redux in sync with URL
    }, [location.search]);

    const handleSearch = () => {
        const trimmedSearch = searchTerm.trim();
        // Update URL query param for search only on button click
        const params = new URLSearchParams(location.search);
        if (trimmedSearch) params.set('q', trimmedSearch); else params.delete('q');
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: false });
        dispatch(updateFilters({ ...filters, searchTerm: trimmedSearch }));
        // Parse category from URL if exists
        let urlCategory: CategoryFiltersType | undefined = undefined;
        const categoryParam = params.get('category');
        if (categoryParam) {
            try {
                urlCategory = JSON.parse(categoryParam);
            } catch {
                urlCategory = undefined;
            }
        }
        dispatch(fetchProducts({
            ...filters,
            q: trimmedSearch,
            category: urlCategory,
            page: 1,
        }));
    };



    return (
        <>
            <div className="mb-4 flex items-center gap-2 w-full">
                <span className="p-float-label flex-1 relative">
                    <InputText
                        id="search"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pr-8 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        style={{ height: '40px', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleSearch();
                        }}
                    />
                    {/* Clear X button */}
                    {searchTerm && (
                        <span title="Clear search">
                            <Button
                                type="button"
                                icon="pi pi-times"
                                className="p-button-text p-button-sm absolute right-2 top-1/2 -translate-y-1/2 z-10 searchbar-x-btn"
                                style={{ padding: 0, minWidth: 0, width: 24, height: 24 }}
                                onClick={() => {
                                    setSearchTerm('');
                                    // Remove search param from URL only
                                    const params = new URLSearchParams(location.search);
                                    params.delete('q');
                                    navigate({ pathname: location.pathname, search: params.toString() }, { replace: false });
                                }}
                                aria-label="Clear search"
                            />
                        </span>
                    )}
                    <label htmlFor="search">Search product, brand etc...</label>
                </span>
                <Button
                    label="Search"
                    icon="pi pi-search"
                    onClick={handleSearch}
                    className="ml-2 searchbar-search-btn"
                    disabled={!searchTerm.trim() || loading}
                />
            </div>
            {/* Responsive style for bigger buttons on mobile */}
            <style>{`
                @media (max-width: 600px) {
                    .searchbar-x-btn {
                        width: 36px !important;
                        height: 36px !important;
                        font-size: 1.3rem !important;
                    }
                    .searchbar-search-btn {
                        font-size: 1.1rem !important;
                        padding: 0.75rem 1.5rem !important;
                    }
                }
            `}</style>

        </>
    );
};

export default SearchBar;
