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


const FiltersBar: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const { filters, creators, products } = useSelector((state: RootState) => state.marketplace);
    const navigate = useNavigate();
    const location = useLocation();

    // State for filters, initialized from Redux
    const initialCreator = creators.find((c: { label: string; value: string; avatar?: string }) => c.value === filters.creator) || null;
    const [creator, setCreator] = React.useState(initialCreator);
    const [filteredCreators, setFilteredCreators] = React.useState(creators);

    // Category filters state
    const [categoryFilters, setCategoryFilters] = React.useState<Record<string, string[]>>({});

    // Calculate min and max price from products
    interface Product {
        price: number;
        // Add other known properties of a product here, if applicable
    }

    const prices = products.map((p: Product) => p.price).filter((p: number) => typeof p === 'number');
    const minProductPrice = prices.length ? Math.min(...prices) : 0;
    const maxProductPrice = prices.length ? Math.max(...prices) : 1000;

    // State for price range, initialized from Redux or product price range
    const [priceRange, setPriceRange] = React.useState<[number, number]>(
        filters.priceRange && Array.isArray(filters.priceRange)
            ? [
                Math.max(minProductPrice, filters.priceRange[0]),
                Math.min(maxProductPrice, filters.priceRange[1])
            ]
            : [minProductPrice, maxProductPrice]
    );
    const pricePanelRef = useRef<OverlayPanel>(null);

    // On mount, read filters from URL and trigger filtering if needed
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

        // Only trigger filter if URL params exist and differ from Redux
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
            dispatch(updateFilters({ ...filters, ...urlFilters }));
            dispatch(fetchProducts({
                ...filters,
                ...urlFilters,
                minPrice: urlPriceRange[0],
                maxPrice: urlPriceRange[1],
                page: 1,
            }));
        }
    }, [location.search, creators]);

    useEffect(() => {
        // Fetch categories on mount
        dispatch(fetchCategoriesWithCounts());

    },[])

    const handleFilter = () => {
        const creatorId = typeof creator === 'object' && creator !== null ? creator.value : creator || '';
        // Update URL query params only on filter button click
        const params = new URLSearchParams(location.search);
        // Add category filters to params
        Object.entries(categoryFilters).forEach(([group, values]) => {
            if (values && values.length > 0) {
                params.set(group, values.join(','));
            } else {
                params.delete(group);
            }
        });
        if (creatorId) params.set('creator', creatorId); else params.delete('creator');
        if (priceRange[0] !== minProductPrice) params.set('minPrice', String(priceRange[0])); else params.delete('minPrice');
        if (priceRange[1] !== maxProductPrice) params.set('maxPrice', String(priceRange[1])); else params.delete('maxPrice');
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: false });

        dispatch(updateFilters({ ...filters, ...categoryFilters, creator: creatorId, priceRange }));
        dispatch(fetchProducts({
            ...filters,
            ...categoryFilters,
            creator: creatorId,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            page: 1,
        }));
    };


    // Debounced search for creators
    const debouncedSearch = useRef(
        debounce((query: string) => {
            const lowered = query.toLowerCase();
            setFilteredCreators(
                creators.filter((c: { label: string }) => c.label.toLowerCase().includes(lowered))
            );
        }, 300)
    ).current;

    const searchCreator = (event: { query: string }) => {
        debouncedSearch(event.query);
    };

    return (
        <aside className="p-6 bg-white rounded shadow flex flex-col gap-6 w-full md:w-64 mb-8" style={{ minWidth: 220, maxWidth: 320 }}>
            <Button label="Filter" icon="pi pi-filter" onClick={handleFilter} className="mb-4 p-button-outlined p-button-rounded filter-btn w-full" />
            <CategoryFilters
                selected={categoryFilters}
                onChange={(group, values) => setCategoryFilters(prev => ({ ...prev, [group]: values }))}
            />
            <span className="p-float-label w-full">
                <AutoComplete
                    id="creator"
                    value={creator}
                    suggestions={filteredCreators || []}
                    completeMethod={searchCreator}
                    onChange={(e) => setCreator(e.value)}
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
    );
};

export default FiltersBar;
