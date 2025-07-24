
import React, { useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useGetAllCategoriesQuery, useGetSubCategoriesByCategoryQuery } from '../slices/categoriesApiSlice';

interface CategoryFiltersProps {
  selected: string[];
  onChange: (values: string[]) => void;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({ selected, onChange }) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  // On mount, if a main category is selected, open its subCategories list
  React.useEffect(() => {
    const mainCategoryId = selected.length > 0 ? selected[0] : '';
    if (mainCategoryId) {
      setOpenCategory(mainCategoryId);
    }
  }, []);
  const { data: categoriesResponse, isLoading: loadingCategories } = useGetAllCategoriesQuery();
  const categories = categoriesResponse?.data || [];

  // Only use the last selected main category's _id for subcategory fetch
  // Assume main category is the first in selected array, subcategories are the rest
  const mainCategoryId = selected.length > 0 ? selected[0] : '';
  const { data: subCategoriesData, isLoading: loadingSubCategories } = useGetSubCategoriesByCategoryQuery(mainCategoryId, { skip: !mainCategoryId });
  const subCategories = subCategoriesData || [];

  return (
    <div className="flex flex-col gap-6">
      {loadingCategories ? (
        <div className="flex justify-center items-center py-4">
          <ProgressSpinner style={{ width: '30px', height: '30px' }} strokeWidth="4" />
        </div>
      ) : null}
      {categories.map((cat: any) => {
        const checked = selected.includes(cat._id);
        return (
          <div key={cat._id}>
            <label
              key={cat._id}
              className={`flex items-center gap-2 cursor-pointer ${checked ? 'font-semibold text-blue-700' : ''}`}
              role="checkbox"
              aria-checked={checked}
            >
              <Checkbox
                inputId={`category-${cat._id}`}
                checked={checked}
                onChange={e => {
                  const isChecked = e.checked;
                  let next: string[];
                  const params = new URLSearchParams(window.location.search);
                  if (isChecked) {
                    next = [...selected, cat._id];
                    setOpenCategory(cat._id);
                    // Update URL with selected category and subCategories
                    params.set('category', cat._id);
                    const subCategoriesArr = next.filter(id => id !== cat._id);
                    params.set('subCategories', JSON.stringify(subCategoriesArr));
                  } else {
                    // Remove the main category and all its subcategories from selection
                    const subCategoryIds = subCategories.map((sub: any) => sub._id);
                    next = selected.filter(v => v !== cat._id && !subCategoryIds.includes(v));
                    setOpenCategory(null);
                    // Remove category and all subCategories from URL
                    params.delete('category');
                    params.delete('subCategories');
                  }
                  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
                  // If no main category, also clear all subCategories
                  if (!isChecked) {
                    onChange([]);
                  } else {
                    onChange(next);
                  }
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
                {(() => {
                  const groups: { [type: string]: any[] } = {};
                  subCategories.forEach((sub: any) => {
                    const type = sub.type || 'Other';
                    if (!groups[type]) groups[type] = [];
                    groups[type].push(sub);
                  });
                  return Object.entries(groups).map(([type, subs]) => (
                    <div key={type} className="mb-2">
                      <div className="font-semibold text-gray-700 mb-1 text-base text-left">{type}</div>
                      <div className="flex flex-col gap-2">
                        {subs.map((sub: any) => {
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
                                    next = [...selected, sub._id];
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
                  ));
                })()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryFilters;
