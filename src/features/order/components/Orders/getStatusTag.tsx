import { Tag } from "primereact/tag";

export const getStatusTag = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      pending:   { label: 'pending', className: 'bg-gray-400' },
      paid:      { label: 'paid', className: 'bg-green-500' },
      shipped:   { label: 'shipped', className: 'bg-blue-400' },
      delivered: { label: 'delivered', className: 'bg-blue-800' },
      cancelled: { label: 'cancelled', className: 'bg-red-500' },
    };
  
    const item = map[status] || { label: status, className: 'bg-gray-300' };
  
    return (
      <Tag
        value={item.label}
        className={`${item.className} text-white px-3 py-1 rounded-full text-sm`}
      />
    );
  };
  