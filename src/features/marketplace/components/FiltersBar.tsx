import React, { useEffect,useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CategoryFilters from './CategoryFilters';
import CreatorFilterSection from './CreatorFilterSection';
import PriceFilterSection from './PriceFilterSection';
import FilterActionsSection from './FilterActionsSection';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../store';
import type { AppDispatch } from '../../../store';
import { fetchCreatorsAndManufacturers } from '../thunks/marketplaceThunks';
import { setMaxPrice, updateFilters } from '../slices/marketplaceSlice';
import type { Product } from '../../../types';
import FilterSection from './FilterSection';

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

const FiltersBar: React.FC<{ productsData: any }> = ({ productsData }) => {
    // Ref for AutoComplete input
    const dispatch: AppDispatch = useDispatch();
    const { filters, creators, products, maxPrice: globalMaxPrice } = useSelector((state: RootState) => state.marketplace);
    const navigate = useNavigate();
    const location = useLocation();
    const initialCreator = creators.find((c: { label: string; value: string; avatar?: string }) => c.value === filters.creator) || null;
    const [creator, setCreator] = useState(initialCreator);
    const [filteredCreators, setFilteredCreators] = useState(creators);
    const [categoryFilters, setCategoryFilters] = useState<string[]>(() => {
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
            dispatch(setMaxPrice(pageMaxPrice));
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
        }
    }, [location.search, creators]);

    useEffect(() => {
        dispatch(fetchCreatorsAndManufacturers());
    }, [dispatch]);
    useEffect(() => {
        handleFilter();
    }, [priceRange, creator]);

    const hasActiveFilters = () => {
        return Boolean(creator) ||
            (Array.isArray(categoryFilters) && categoryFilters.length > 0) ||
            priceRange[0] !== minProductPrice ||
            priceRange[1] !== maxProductPrice;
    };
    // Build filters for RTK Query
    const mainCategory = categoryFilters.length > 0 ? categoryFilters[0] : undefined;
    const subCategoriesArr = categoryFilters.filter(id => id !== mainCategory);

    useEffect(() => {
        if (productsData && Array.isArray(productsData)) {
            dispatch({ type: 'marketplace/setProducts', payload: productsData });
        }
    }, [productsData, dispatch]);

    // Helper to build filter params
    const buildFilterParams = () => {
        const params = new URLSearchParams(location.search);
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
        const creatorId = creator && creator.value ? creator.value : '';
        if (creatorId) {
            params.set('creator', creatorId);
        } else {
            params.delete('creator');
        }
        return params;
    };

    const handleFilter = async () => {
        const params = buildFilterParams();
        dispatch(updateFilters({ ...filters, category: mainCategory, subCategories: mainCategory ? subCategoriesArr : undefined, creator: creator?.value || '', priceRange }));
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: false });
    };

    const searchCreator = (event: { query: string }) => {
        setFilteredCreators(
            creators.filter((c: { label: string }) =>
                c.label.toLowerCase().includes(event.query.toLowerCase())
            )
        );
    };

    const handleReset = () => {
        // Helper to build reset params
        const buildResetParams = () => {
            const params = new URLSearchParams(location.search);
            params.delete('creator');
            params.delete('category');
            params.delete('subCategories');
            params.delete('minPrice');
            params.delete('maxPrice');
            params.set('page', '1');
            return params;
        };
        const params = buildResetParams();
        setCategoryFilters([]);
        setPriceRange([minProductPrice, maxProductPrice]);
        setCreator(null);
        dispatch(updateFilters({ ...filters, category: undefined, subCategories: undefined, creator: '', priceRange: [minProductPrice, maxProductPrice] }));
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: false });
    };

    return (
        <>
            <div style={{ position: 'relative', minWidth: 0, display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ minWidth: 220, maxWidth: 320, width: '100%', zIndex: 20 }}>
                    <aside
                        className="p-6 bg-white rounded shadow flex flex-col gap-4 w-full md:w-64 mb-8 relative"
                        style={{ minWidth: 220, maxWidth: 320 }}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleFilter();
                        }}
                    >
                        <FilterActionsSection
                            handleReset={handleReset}
                            hasActiveFilters={hasActiveFilters()}
                        />

                        <FilterSection title="Price Range" icon="pi pi-dollar">
                            <PriceFilterSection
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                                minProductPrice={minProductPrice}
                                maxProductPrice={maxProductPrice}
                            />
                        </FilterSection>

                        <FilterSection title="Categories" icon="pi pi-tags">
                            <CategoryFilters
                                selected={categoryFilters}
                                onChange={setCategoryFilters}
                                handleFilter={handleFilter}
                            />
                        </FilterSection>

                        <FilterSection title="Creator" icon="pi pi-user">
                            <CreatorFilterSection
                                creator={creator}
                                filteredCreators={filteredCreators}
                                setCreator={setCreator}
                                searchCreator={searchCreator}
                            />
                        </FilterSection>
                    </aside>
                </div>
            </div>
        </>
    );
};

export default FiltersBar;

