// Product utility functions for badge color classes

export function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'sold': return 'bg-red-100 text-red-800';
    case 'inactive': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function getConditionColor(condition: string) {
  switch (condition) {
    case 'new': return 'bg-blue-100 text-blue-800';
    case 'like_new': return 'bg-green-100 text-green-800';
    case 'good': return 'bg-yellow-100 text-yellow-800';
    case 'fair': return 'bg-orange-100 text-orange-800';
    case 'poor': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}
