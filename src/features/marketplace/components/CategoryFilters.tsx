import React, { useState } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useGetAllCategoriesQuery, useGetSubCategoriesByCategoryQuery } from '../slices/categoriesApiSlice';
import type { Category, SubCategory } from '../../../types';

// Utility to group subCategories by type
function groupSubCategoriesByType(subCategories: SubCategory[]): { [type: string]: SubCategory[] } {
  const groups: { [type: string]: SubCategory[] } = {};
  subCategories.forEach((sub) => {
    const type = sub.type || 'Other';
    if (!groups[type]) groups[type] = [];
    groups[type].push(sub);
  });
  return groups;
}

// Utility function to update category and subCategories in URL
function updateCategoryParams(mainCategoryId: string, selected: string[], isChecked: boolean) {
  const params = new URLSearchParams(window.location.search);
  if (isChecked === true) {
    params.set('category', mainCategoryId);
    const subCategoriesArr = selected.filter(id => id !== mainCategoryId);
    params.set('subCategories', subCategoriesArr.join(','));
  } else {
    params.delete('category');
    params.delete('subCategories');
  }
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
}

interface CategoryFiltersProps {
  selected: string[];
  onChange: (values: string[]) => void;
  handleFilter: () => void;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({ selected, onChange, handleFilter }) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  // Compute mainCategoryId once and reuse
  const mainCategoryId = selected.length > 0 ? selected[0] : '';

  // On mount, if a main category is selected, open its subCategories list
  React.useEffect(() => {
    if (mainCategoryId) {
      setOpenCategory(mainCategoryId);
    }
  }, []);

  React.useEffect(() => {
    handleFilter();
  }, [selected, openCategory]);

  const { data: categoriesResponse, isLoading: loadingCategories } = useGetAllCategoriesQuery();
  const categories = categoriesResponse?.data || [];

  const { data: subCategoriesData, isLoading: loadingSubCategories } = useGetSubCategoriesByCategoryQuery(mainCategoryId, { skip: mainCategoryId === '' });
  const subCategories = subCategoriesData || [];

  return (
    <div className="flex flex-col gap-6">
      <label htmlFor="category-filters" className="block font-semibold text-gray-700 mb-2">Categories</label>
      {loadingCategories ? (
        <div className="flex justify-center items-center py-4">
          <ProgressSpinner style={{ width: '30px', height: '30px' }} strokeWidth="4" />
        </div>
      ) : null}
      {categories.map((cat: Category) => {
        const checked = selected[0] === cat._id;
        return (
          <div key={cat._id}>
            <div className={`flex items-center gap-2 cursor-pointer select-none ${checked ? 'font-semibold text-blue-700' : ''}`}
              onClick={() => {
                if (checked) {
                  setOpenCategory(null);
                  updateCategoryParams(cat._id, [], false);
                  onChange([]);
                } else {
                  setOpenCategory(cat._id);
                  updateCategoryParams(cat._id, [cat._id], true);
                  onChange([cat._id]);
                }
              }}
              style={{ userSelect: 'none' }}
            >
              {/* Custom checkbox for main category */}
              <span style={{ display: 'flex', alignItems: 'center', marginRight: 4 }}>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    border: `2px solid ${checked ? '#2563eb' : '#bbb'}`,
                    borderRadius: 4,
                    background: checked ? '#2563eb' : '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 4,
                    transition: 'background 0.2s, border 0.2s',
                  }}
                >
                  {checked && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6.5L5.5 9L9 4.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              </span>
              <span>{cat.name}</span>
            </div>
            {/* Show subCategories if category is checked and loaded, grouped by type */}
            {checked && openCategory === cat._id && (
              <div className="ml-6 flex flex-col gap-4">
                {loadingSubCategories ? (
                  <div className="flex justify-center items-center py-2">
                    <ProgressSpinner style={{ width: '24px', height: '24px' }} strokeWidth="3" />
                  </div>
                ) : null}
                {/* Group subCategories by type */}
                {Object.entries(groupSubCategoriesByType(subCategories)).map(([type, subs]) => (
                  <div key={type} className="mb-2">
                    <div className="font-semibold text-gray-700 mb-1 text-base text-left">{type}</div>
                    <div className="flex flex-col gap-2">
                      {subs.map((sub: SubCategory) => {
                        const subChecked = selected.includes(sub._id);
                        return (
                          <div
                            key={sub._id}
                            className={`flex items-center gap-2 cursor-pointer select-none ${subChecked ? 'font-semibold text-blue-700' : ''}`}
                            style={{ userSelect: 'none', flexDirection: 'row', justifyContent: 'flex-start' }}
                            onClick={() => {
                              let next: string[];
                              if (!subChecked) {
                                next = [selected[0], ...selected.slice(1), sub._id];
                              } else {
                                next = selected.filter(v => v !== sub._id);
                              }
                              onChange(next);
                            }}
                          >
                            {/* Custom square for subcategory, now left aligned */}
                            <span
                              style={{
                                width: 18,
                                height: 18,
                                border: `2px solid ${subChecked ? '#2563eb' : '#bbb'}`,
                                borderRadius: 4,
                                background: subChecked ? '#2563eb' : '#fff',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 4,
                                transition: 'background 0.2s, border 0.2s',
                              }}
                            >
                              {subChecked && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M3 6.5L5.5 9L9 4.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </span>
                            <span>{sub.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryFilters;
