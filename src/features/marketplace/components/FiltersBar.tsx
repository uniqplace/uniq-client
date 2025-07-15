import React, { useRef } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { Dropdown } from 'primereact/dropdown';
import { Slider } from 'primereact/slider';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../store';
import type { AppDispatch } from '../../../store';
import { fetchProducts } from '../thunks';
import { updateFilters } from '../slices/marketplaceSlice';

const categories = [
    { label: 'All', value: '' },
    { label: 'Clothes', value: 'clothes' },
    { label: 'Shoes', value: 'shoes' },
    { label: 'Accessories', value: 'accessories' },
];

const FiltersBar: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const { filters, creators } = useSelector((state: RootState) => state.marketplace);
    const [category, setCategory] = React.useState(filters.category || '');
    const initialCreator = creators.find((c: { label: string; value: string; avatar?: string }) => c.value === filters.creator) || null;
    const [creator, setCreator] = React.useState(initialCreator);
    const [filteredCreators, setFilteredCreators] = React.useState(creators);
    const [priceRange, setPriceRange] = React.useState<[number, number]>(filters.priceRange || [0, 1000]);
    const pricePanelRef = useRef<OverlayPanel>(null);

    const handleFilter = () => {
        const creatorId = typeof creator === 'object' && creator !== null ? creator.value : creator || '';
        dispatch(updateFilters({ ...filters, category, creator: creatorId, priceRange }));
        dispatch(fetchProducts({
            ...filters,
            category,
            creator: creatorId,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            page: 1,
        }));
    };

    const searchCreator = (event: { query: string }) => {
        const query = event.query.toLowerCase();
        setFilteredCreators(
            creators.filter((c: { label: string }) => c.label.toLowerCase().includes(query))
        );
    };

    return (
        <div className="p-6 bg-white rounded shadow flex flex-col md:flex-row gap-6 items-center w-full mb-8">
            <span className="p-float-label w-full md:w-48">
                <Dropdown id="category" value={category} options={categories} onChange={(e: { value: string }) => setCategory(e.value)} />
                <label htmlFor="category">Category</label>
            </span>
            <span className="p-float-label w-full md:w-48">
                <AutoComplete
                    id="creator"
                    value={creator}
                    suggestions={filteredCreators}
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
                />
                <label htmlFor="creator">Creator</label>
            </span>
            <span className="w-full md:w-56">
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
                            range min={0} max={1000} step={10}
                            style={{ width: '200px' }}
                        />
                        <div className="flex gap-2 mt-2">
                            <span>${priceRange[0]}</span> - <span>${priceRange[1]}</span>
                        </div>
                    </div>
                </OverlayPanel>
            </span>
            <Button label="Filter" icon="pi pi-filter" onClick={handleFilter} className="mt-4 md:mt-0 p-button-outlined p-button-rounded filter-btn" />
        </div>

    );
};

export default FiltersBar;
