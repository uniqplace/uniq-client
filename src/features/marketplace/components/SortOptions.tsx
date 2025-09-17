import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateSortBy } from '../slices/marketplaceSlice';
import { Dropdown } from 'primereact/dropdown';
import { sortOptions } from '../../../constants/sortOptions';
import * as Icons from 'react-icons/pi';

const SortOptions: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const sortBy = useSelector((state: any) => state.marketplace.sortBy);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const sortByParam = params.get('sortBy') || 'default';
        const matchedOption = sortOptions.find((option: any) => option.value === sortByParam || option.aliases?.includes(sortByParam));
        dispatch(updateSortBy(matchedOption ? matchedOption.value : 'bestSelling'));
    }, [location.search, dispatch]);

    const handleSortChange = (value: string) => {
        dispatch(updateSortBy(value));
        const params = new URLSearchParams(location.search);
        params.set('sortBy', value);
        params.delete('page');
        params.set('page', '1'); // Reset to the first page
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: false });
    };

    const customOptionTemplate = (option: any) => {
        const IconComponent = (Icons as any)[option.icon];
        return (
            <div className="flex items-center gap-2">
                {IconComponent && <IconComponent className={option.iconClass} />}
                <span>{option.label}</span>
            </div>
        );
    };

    const selectedOptionTemplate = (option: any) => {
        if (!option) return null;
        const IconComponent = (Icons as any)[option.icon];
        return (
            <div className="flex items-center gap-2">
                {IconComponent && <IconComponent className={option.iconClass} />}
                <span>{option.label}</span>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-end mb-6">
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
            </label>
            <Dropdown
                id="sort"
                value={sortBy}
                options={sortOptions}
                onChange={(e) => handleSortChange(e.value)}
                className="w-45 p-inputtext-sm shadow-md border border-gray-300 rounded-lg"
                itemTemplate={customOptionTemplate}
                valueTemplate={selectedOptionTemplate}
            />
        </div>
    );
};

export default SortOptions;
