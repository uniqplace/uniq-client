export const defaultProductTemplate = {
  title: 'Test Product',
  description: 'This is a hardcoded product',
  price: 100,
  images: [],
  category: {
    _id: "68da45f3dc51c4a168a3c871",
    name: "home systems",
  },
  subCategories: [],
  condition: 'new' as 'new' | 'like_new' | 'good' | 'fair' | 'poor',
  location: 'Hardcoded Location',
  tags: ['hardcoded'],
  status: "draft" as "published" | "draft" | "hidden",
  stock: 10,
  createdByAI: true,
};