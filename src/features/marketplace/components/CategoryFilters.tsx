import React, { useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
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
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({ selected, onChange }) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  // Compute mainCategoryId once and reuse
  const mainCategoryId = selected.length > 0 ? selected[0] : '';

  // On mount, if a main category is selected, open its subCategories list
  React.useEffect(() => {
    if (mainCategoryId) {
      setOpenCategory(mainCategoryId);
    }
  }, []);
  const { data: categoriesResponse, isLoading: loadingCategories } = useGetAllCategoriesQuery();
  const categories = categoriesResponse?.data || [];

  // Only use the last selected main category's _id for subcategory fetch
  // Assume main category is the first in selected array, subcategories are the rest
  const { data: subCategoriesData, isLoading: loadingSubCategories } = useGetSubCategoriesByCategoryQuery(mainCategoryId, { skip: !mainCategoryId });
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
            <label
              key={cat._id}
              className={`flex items-center gap-2 cursor-pointer ${checked ? 'font-semibold text-blue-700' : ''}`}
              
              role="checkbox"
              aria-checked={checked}
            >
              <Checkbox     
  // className="p-checkbox-sm rounded-md mt-0.5"

  // className="p-checkbox-sm mt-0.5"
 


                inputId={`category-${cat._id}`}
                checked={checked}
                onChange={e => {
                  const isChecked = e.checked;
                  let next: string[] = [];
                  if (isChecked) {
                    // Only allow one category at a time
                    next = [cat._id];
                    setOpenCategory(cat._id);
                  } else {
                    // Uncheck category and all its subcategories
                    setOpenCategory(null);
                    next = [];
                  }
                  updateCategoryParams(cat._id, next, !!isChecked);
                  onChange(next); // next is [] if unchecked, so subCategories will be cleared in slice
                }}
              />
              <span>{cat.name}</span>
            </label>
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
                          <label
                            key={sub._id}
                            className={`flex items-center gap-2 cursor-pointer ${subChecked ? 'font-semibold text-blue-700' : ''}`}
                            role="checkbox"
                            aria-checked={subChecked}
                          >
                            <Checkbox
                              inputId={`subCategory-${sub._id}`}
                              checked={subChecked}
                              onChange={e => {
                                const isChecked = e.checked;
                                let next: string[];
                                if (isChecked) {
                                  // Add subcategory only if main category is selected
                                  next = [selected[0], ...selected.slice(1), sub._id];
                                } else {
                                  next = selected.filter(v => v !== sub._id);
                                }
                                onChange(next);
                              }}
                            />
                            <span>{sub.name}</span>
                          </label>
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
