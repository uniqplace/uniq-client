import React from 'react';
import { Divider } from 'primereact/divider';
import { Checkbox } from 'primereact/checkbox';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';

const CATEGORY_TYPE_MAP: Record<string, { label: string }> = {
  audience: { label: 'Audience:' },
  itemType: { label: 'Item Type:' },
  purpose: { label: 'Purpose:' },
};

interface CategoryFiltersProps {
  selected: Record<string, string[]>;
  onChange: (groupName: string, values: string[]) => void;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({ selected, onChange }) => {
  // Get categories from Redux slice
  const categories = useSelector((state: RootState) => state.marketplace.categories);

  // Group categories by type
  const groups = React.useMemo(() => {
    const grouped: Record<string, { label: string; name: string; options: { label: string; value: string }[] }> = {};
    categories.forEach((cat: any) => {
      const type = cat.type || 'other';
      if (!grouped[type]) {
        grouped[type] = {
          label: CATEGORY_TYPE_MAP[type]?.label || type,
          name: type,
          options: [],
        };
      }
      // Show count if available and > 0, otherwise just name
      const label = cat.count !== undefined ? `${cat.name} (${cat.count})` : cat.name;
      grouped[type].options.push({ label, value: cat.id });
    });
    return Object.values(grouped);
  }, [categories]);

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        group.options.length > 0 && (
          <div key={group.name}>
            <Divider align="left" type="solid" className="!mt-0 !mb-3" style={{ borderTop: '2px solid #e0e7ef', borderBottom: 'none' }}>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: '1.13rem',
                  color: '#1e293b',
                  letterSpacing: '0.01em',
                  padding: '0 0.5em',
                }}
              >
                {group.label}
              </span>
            </Divider>
            <div className="flex flex-col gap-2">
              {group.options.map((option) => {
                const checked = selected[group.name]?.includes(option.value) || false;
                return (
                  <label
                    key={option.value}
                    className={`flex items-center gap-2 cursor-pointer ${checked ? 'font-semibold text-blue-700' : ''}`}
                    role="checkbox"
                    aria-checked={checked}
                  >
                    <Checkbox
                      inputId={`${group.name}-${option.value}`}
                      checked={checked}
                      onChange={e => {
                        const checked = e.checked;
                        const prev = selected[group.name] || [];
                        let next: string[];
                        if (checked) {
                          next = [...prev, option.value];
                        } else {
                          next = prev.filter(v => v !== option.value);
                        }
                        onChange(group.name, next);
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default CategoryFilters;
