import React, { useState } from 'react';

interface FilterSectionProps {
    title: string;
    icon: string;
    children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, icon, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            <hr className="border-t border-gray-300" />
            <div className="mb-4">
                <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center gap-2">
                        <i className={`${icon} text-blue-500`} />
                        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
                    </div>
                    <i
                        className={`pi ${isOpen ? 'pi-minus' : 'pi-plus'} text-gray-500`}
                    />
                </div>
                {isOpen && <div className="mt-5">{children}</div>}
            </div>
        </>
    );
};

export default FilterSection;
