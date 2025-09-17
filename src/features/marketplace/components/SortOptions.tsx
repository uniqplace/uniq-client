import React, { useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateSortBy } from '../slices/marketplaceSlice';

const SortOptions: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const sortBy = useSelector((state: any) => state.marketplace.sortBy);

  const sortOptions = [
    { label: 'Default', value: 'default' },
    { label: 'Best Selling', value: 'bestSelling' },
    { label: 'Highest Rated', value: 'highestRated' },
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sortByParam = params.get('sortBy') || 'default';
    dispatch(updateSortBy(sortByParam));
  }, [location.search, dispatch]);

  const handleSortChange = (value: string) => {
    dispatch(updateSortBy(value));
    const params = new URLSearchParams(location.search);
    params.set('sortBy', value);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: false });
  };

  return (
    <div className="sort-options">
      <label htmlFor="sort">Sort By:</label>
      <Dropdown
        id="sort"
        value={sortBy}
        options={sortOptions}
        onChange={(e) => handleSortChange(e.value)}
        placeholder="Select an option"
      />
    </div>
  );
};

export default SortOptions;
