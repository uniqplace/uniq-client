// קבלת מפתח לפי מזהה משתמש (id) מתוך פרמטר
export const getUserProductKey = (userId: string | null | undefined) => {
  return userId ? `productId_${userId}` : 'productId_guest';
};
