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
import { fetchSubCategories } from '../thunks/marketplaceThunks';
import { updateFilters } from '../slices/marketplaceSlice';
import type { Product } from '../../../types';

// Helper to parse filters from URLSearchParams
function parseUrlFilters(params: URLSearchParams, minProductPrice: number, maxProductPrice: number) {
    const category = params.get('category') ?? undefined;
    let subCategoriesArr: string[] = [];
    const subCategoriesParam = params.get('subCategories');
    if (subCategoriesParam) {
        try {
            const parsed = JSON.parse(subCategoriesParam);
            if (Array.isArray(parsed)) {
                subCategoriesArr = parsed.filter((v): v is string => typeof v === 'string');
            } else if (parsed && typeof parsed === 'object') {
                subCategoriesArr = Object.values(parsed).flat().filter((v): v is string => typeof v === 'string');
            }
        } catch {
            subCategoriesArr = [];
        }
    }
    const creator = params.get('creator') || '';
    const minPrice = params.get('minPrice') ? Number(params.get('minPrice')) : minProductPrice;
    const maxPrice = params.get('maxPrice') ? Number(params.get('maxPrice')) : maxProductPrice;
    const priceRange: [number, number] = [minPrice, maxPrice];
    return {
        category,
        subCategories: subCategoriesArr.length > 0 ? subCategoriesArr : undefined,
        creator,
        priceRange,
    };
}


const FiltersBar: React.FC = () => {
    // Ref for AutoComplete input
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
        const mainCategory = params.get('category');
        const subCategoriesParam = params.get('subCategories');
        let subCategoriesArr: string[] = [];
        if (subCategoriesParam) {
            try {
                const parsed = JSON.parse(subCategoriesParam);
                if (Array.isArray(parsed)) {
                    subCategoriesArr = parsed.filter((v): v is string => typeof v === 'string');
                } else if (parsed && typeof parsed === 'object') {
                    subCategoriesArr = Object.values(parsed).flat().filter((v): v is string => typeof v === 'string');
                }
            } catch {
                subCategoriesArr = [];
            }
        }
        return mainCategory ? [mainCategory, ...subCategoriesArr] : subCategoriesArr;
    });

    // Sync categoryFilters with URL when changed
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        // Main category is the first in the array (if exists)
        const mainCategory = categoryFilters.length > 0 ? categoryFilters[0] : undefined;
        if (mainCategory) {
            params.set('category', mainCategory);
        } else {
            params.delete('category');
        }
        // SubCategories are all except the main category
        const subCategoriesArr = categoryFilters.filter(id => id !== mainCategory);
        if (subCategoriesArr.length > 0) {
            params.set('subCategories', JSON.stringify(subCategoriesArr));
        } else {
            params.delete('subCategories');
        }
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    }, [categoryFilters]);
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
        const urlFilters = parseUrlFilters(params, minProductPrice, maxProductPrice);
        setCreator(
            creators.find((c: { label: string; value: string; avatar?: string }) => c.value === urlFilters.creator) || null
        );
        setPriceRange(urlFilters.priceRange);

        const filtersMatch =
            filters.creator === urlFilters.creator &&
            Array.isArray(filters.priceRange) &&
            filters.priceRange[0] === urlFilters.priceRange[0] &&
            filters.priceRange[1] === urlFilters.priceRange[1];
        const hasAnyUrlFilter = urlFilters.creator || urlFilters.priceRange[0] !== minProductPrice || urlFilters.priceRange[1] !== maxProductPrice;
        if (hasAnyUrlFilter && !filtersMatch) {
            dispatch(updateFilters({ ...filters, ...urlFilters }));
            dispatch(fetchProducts({
                ...filters,
                ...urlFilters,
                minPrice: urlFilters.priceRange[0],
                maxPrice: urlFilters.priceRange[1],
                page: 1,
            }));
        }
    }, [location.search, creators]);
    useEffect(() => {
        dispatch(fetchSubCategories());
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
        // Always use categoryFilters state for category/subCategories
        const params = new URLSearchParams(location.search);
        const mainCategory = categoryFilters.length > 0 ? categoryFilters[0] : undefined;
        const subCategoriesArr = categoryFilters.filter(id => id !== mainCategory);
        if (mainCategory) {
            params.set('category', mainCategory);
        } else {
            params.delete('category');
        }
        if (subCategoriesArr.length > 0) {
            params.set('subCategories', JSON.stringify(subCategoriesArr));
        } else {
            params.delete('subCategories');
        }
        // Only update minPrice and maxPrice in the URL if changed from defaults
        if (priceRange[0] !== minProductPrice) {
            params.set('minPrice', priceRange[0].toString());
        } else {
            params.delete('minPrice');
        }
        if (priceRange[1] !== maxProductPrice) {
            params.set('maxPrice', priceRange[1].toString());
        } else {
            params.delete('maxPrice');
        }
        // Only update creator in the URL if selected
        const creatorId = creator && creator.value ? creator.value : '';
        if (creatorId) {
            params.set('creator', creatorId);
        } else {
            params.delete('creator');
        }
        const qParam = params.get('q') || '';
        const pageParam = params.get('page') ? Number(params.get('page')) : 1;
        // First, update Redux and call API with current UI state
        dispatch(updateFilters({ ...filters, category: mainCategory, subCategories: mainCategory ? subCategoriesArr : undefined, creator: creatorId, priceRange }));
        dispatch(fetchProducts({
            ...filters,
            category: mainCategory,
            subCategories: mainCategory ? subCategoriesArr : undefined,
            creator: creatorId,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            q: qParam,
            page: pageParam,
        }));
        // Only then update the URL (if needed)
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: false });
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
                            params.delete('subCategories');
                            params.delete('minPrice');
                            params.delete('maxPrice');
                            setCategoryFilters([]); // Clear all category checkboxes
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
