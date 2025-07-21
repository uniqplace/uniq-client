import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { AutoComplete } from 'primereact/autocomplete';
import CategoryFilters from './CategoryFilters';
import { Slider } from 'primereact/slider';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../store';
import type { AppDispatch } from '../../../store';
import { fetchProducts } from '../thunks';
import { fetchCategoriesWithCounts } from '../thunks/marketplaceThunks';
import { updateFilters } from '../slices/marketplaceSlice';
import type { CategoryFiltersType, Product } from '../../../types';


const FiltersBar: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const { filters, creators, products, maxPrice: globalMaxPrice } = useSelector((state: RootState) => state.marketplace);
    const navigate = useNavigate();
    const location = useLocation();
    const initialCreator = creators.find((c: { label: string; value: string; avatar?: string }) => c.value === filters.creator) || null;
    const [creator, setCreator] = React.useState(initialCreator);
    const [searchValue, setSearchValue] = React.useState<string | null>(null);
    const [filteredCreators, setFilteredCreators] = React.useState(creators);
    const [categoryFilters, setCategoryFilters] = React.useState<string[]>(() => {
        const params = new URLSearchParams(window.location.search);
        const categoryParam = params.get('category');
        if (categoryParam) {
            try {
                const parsed = JSON.parse(categoryParam);
                if (Array.isArray(parsed)) {
                    return parsed;
                } else if (parsed && typeof parsed === 'object') {
                    return Object.values(parsed).flat().filter(Boolean);
                }
            } catch {
                return [];
            }
        }
        return [];
    });
    const minProductPrice = 0;
    const pageMaxPrice = products.length ? Math.max(...products.map((p: Product) => p.price)) : 1000;
    const maxProductPrice = globalMaxPrice && globalMaxPrice > pageMaxPrice ? globalMaxPrice : pageMaxPrice;
    React.useEffect(() => {
        if (pageMaxPrice > (globalMaxPrice || 0)) {
            dispatch({ type: 'marketplace/setMaxPrice', payload: pageMaxPrice });
        }
    }, [pageMaxPrice, globalMaxPrice, dispatch]);

    const [priceRange, setPriceRange] = React.useState<[number, number]>(() => {
        if (
            filters.priceRange && Array.isArray(filters.priceRange) &&
            (filters.priceRange[1] === 1000 ||
                filters.priceRange[1] === Number.NEGATIVE_INFINITY)
        ) {
            return [
                Math.max(minProductPrice, filters.priceRange[0]),
                Math.min(maxProductPrice, filters.priceRange[1])
            ];
        }
        return [minProductPrice, maxProductPrice];
    });
    const pricePanelRef = useRef<OverlayPanel>(null);
    useEffect(() => {
        if (products && products.length > 0) {
            setPriceRange(prev => {
                if (prev[1] === maxProductPrice) return prev;
                if (prev[1] === 1000 || prev[1] === Number.NEGATIVE_INFINITY) {
                    return [prev[0], maxProductPrice];
                }
                return prev;
            });
        }
    }, [maxProductPrice, products]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlCreator = params.get('creator') || '';
        const urlMinPrice = params.get('minPrice');
        const urlMaxPrice = params.get('maxPrice');
        const urlPriceRange: [number, number] = [
            urlMinPrice ? Number(urlMinPrice) : minProductPrice,
            urlMaxPrice ? Number(urlMaxPrice) : maxProductPrice
        ];
        setCreator(
            creators.find((c: { label: string; value: string; avatar?: string }) => c.value === urlCreator) || null
        );
        setPriceRange(urlPriceRange);

        const urlFilters = {
            creator: urlCreator,
            priceRange: urlPriceRange
        };
        const filtersMatch =
            filters.creator === urlFilters.creator &&
            Array.isArray(filters.priceRange) &&
            filters.priceRange[0] === urlFilters.priceRange[0] &&
            filters.priceRange[1] === urlFilters.priceRange[1];
        const hasAnyUrlFilter = urlCreator || urlMinPrice || urlMaxPrice;
        if (hasAnyUrlFilter && !filtersMatch) {
            let urlCategory: CategoryFiltersType | undefined = undefined;
            const categoryParam = params.get('category');
            if (categoryParam) {
                try {
                    urlCategory = JSON.parse(categoryParam);
                } catch {
                    urlCategory = undefined;
                }
            }
            dispatch(updateFilters({ ...filters, ...urlFilters }));
            dispatch(fetchProducts({
                ...filters,
                ...urlFilters,
                category: urlCategory,
                minPrice: urlPriceRange[0],
                maxPrice: urlPriceRange[1],
                page: 1,
            }));
        }
    }, [location.search, creators]);
    useEffect(() => {
        dispatch(fetchCategoriesWithCounts());
    }, []);
    const hasActiveFilters = () => {
        return (
            creator ||
            Object.values(categoryFilters).some(arr => arr && arr.length > 0) ||
            priceRange[0] !== minProductPrice ||
            priceRange[1] !== maxProductPrice
        );
    };
    const handleFilter = () => {
        const creatorId = typeof creator === 'object' && creator !== null ? creator.value : creator || '';
        const params = new URLSearchParams(location.search);
        const filteredCategories = categoryFilters.filter(
            (v): v is string => typeof v === 'string' && v !== '' && v !== 'null' && v !== 'undefined' && v !== null
        );
        params.set('category', JSON.stringify(filteredCategories));
        if (creatorId) params.set('creator', creatorId); else params.delete('creator');
        if (priceRange[0] !== minProductPrice) params.set('minPrice', String(priceRange[0])); else params.delete('minPrice');
        if (priceRange[1] !== maxProductPrice) params.set('maxPrice', String(priceRange[1])); else params.delete('maxPrice');
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: false });
        dispatch(updateFilters({ ...filters, category: filteredCategories, creator: creatorId, priceRange }));
        dispatch(fetchProducts({
            ...filters,
            category: filteredCategories,
            creator: creatorId,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            page: 1,
        }));
    };
    const searchCreator = useRef(
        debounce((event: { query: string }) => {
            setFilteredCreators(
                creators.filter((c: { label: string }) =>
                    c.label.toLowerCase().includes(event.query.toLowerCase())
                )
            );
            setSearchValue(event.query);
        }, 100)
    ).current;


    return (
        <div style={{ position: 'relative', minWidth: 0, display: 'flex', alignItems: 'flex-start' }}>
            <div
                style={{
                    minWidth: 220, maxWidth: 320, width: '100%',
                    zIndex: 20
                }}
            >
                <aside
                    className="p-6 bg-white rounded shadow flex flex-col gap-6 w-full md:w-64 mb-8 relative"
                    style={{ minWidth: 220, maxWidth: 320 }}
                    onKeyDown={e => {
                        if (e.key === 'Enter') handleFilter();
                    }}
                >
                    <Button label="Filter" icon="pi pi-filter" onClick={handleFilter} className="mb-4 p-button-outlined p-button-rounded filter-btn w-full" />
                    <Button
                        label="Reset"
                        icon="pi pi-refresh"
                        className="mb-2 p-button-text p-button-sm w-full"
                        disabled={!hasActiveFilters()}
                        onClick={() => {
                            const params = new URLSearchParams(location.search);
                            params.delete('creator');
                            params.delete('category');
                            params.delete('minPrice');
                            params.delete('maxPrice');
                            navigate({ pathname: location.pathname, search: params.toString() }, { replace: false });
                        }}
                    />
                    <CategoryFilters
                        selected={categoryFilters}
                        onChange={setCategoryFilters}
                    />
                    <span className="p-float-label w-full">
                        <AutoComplete
                            id="creator"
                            value={searchValue !== null ? searchValue : (creator ? creator.label : '')}
                            suggestions={filteredCreators || []}
                            completeMethod={searchCreator}
                            onChange={(e) => {
                                setCreator(e.value);
                                setTimeout(() => setSearchValue(null), 0);
                            }}
                            onFocus={() => setSearchValue('')}
                            onBlur={() => setSearchValue(null)}
                            field="label"
                            itemTemplate={(option) => option ? (
                                <div className="flex items-center gap-2">
                                    {option.avatar && (
                                        <img src={option.avatar} alt={option.label} className="w-6 h-6 rounded-full object-cover" />
                                    )}
                                    <span>{option.label}</span>
                                </div>
                            ) : null}
                            dropdown
                            forceSelection
                            placeholder="Select Creator"
                            className="w-full"
                        />
                        <label htmlFor="creator">Creator</label>
                    </span>
                    <span className="w-full">
                        <Button
                            label={`Price: $${priceRange[0]} - $${priceRange[1]}`}
                            icon="pi pi-chevron-down"
                            iconPos="right"
                            onClick={e => pricePanelRef.current?.toggle(e)}
                            className="p-button-outlined p-button-rounded w-full filter-btn"
                        />
                        <OverlayPanel ref={pricePanelRef}>
                            <div style={{ width: 220 }}>
                                <div className="mb-2 font-semibold">Select a price range</div>
                                <Slider
                                    value={priceRange}
                                    onChange={e => {
                                        if (Array.isArray(e.value)) setPriceRange(e.value as [number, number]);
                                    }}
                                    range
                                    min={minProductPrice}
                                    max={maxProductPrice}
                                    step={10}
                                    style={{ width: '200px' }}
                                />
                                <div className="flex gap-2 mt-2">
                                    <span>${priceRange[0]}</span> - <span>${priceRange[1]}</span>
                                </div>
                            </div>
                        </OverlayPanel>
                    </span>
                </aside>
            </div>
        </div>
    );
};

export default FiltersBar;
