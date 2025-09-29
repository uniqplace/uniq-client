export const defaultProductTemplate = {
  title: 'Test Product',
  description: 'This is a hardcoded product',
  price: 123,
  images: [],
  category: {
    _id: "64a7f0c8f1f1e2b4c8d0e9a1",
    name: "Hard category"
  },
  subCategories: [],
  condition: 'new' as 'new' | 'like_new' | 'good' | 'fair' | 'poor',
  location: 'Hardcoded Location',
  tags: ['hardcoded'],
  status: "published" as "published" | "draft" | "hidden",
  stock: 10,
  createdByAI: true,
};