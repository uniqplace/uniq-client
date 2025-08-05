// Get the product key for a specific user
export const getUserProductKey = (userId: string | null | undefined) => {
  return userId ? `productId_${userId}` : 'productId_guest';
};
