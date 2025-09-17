export function getMarketplaceQueryFilters(params: URLSearchParams, page: number) {
  const mainCategory = params.get('category') || undefined;
  const subCategoriesArr = params.get('subCategories') ? params.get('subCategories')!.split(',') : [];
  return {
    category: mainCategory,
    subCategories: subCategoriesArr,
    creator: params.get('creator') || '',
    minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
    maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
    rating: params.get('rating') ? Number(params.get('rating')) : undefined,
    q: params.get('q') || '',
    page,
    sortBy: params.get('sortBy') || 'default', // Add sortBy parameter
  };
}
