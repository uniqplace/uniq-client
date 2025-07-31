export const getNestedFieldValue = (obj: any, field: string, nestedField: string): string | undefined => {
  if (typeof obj[field] === 'object' && obj[field] !== null && nestedField in obj[field]) {
    return obj[field][nestedField];
  }
  return undefined;
};
