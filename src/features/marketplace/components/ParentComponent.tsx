// ParentComponent.tsx
import React from "react";
import SimilarProductsCarousel from "./SimilarProductsCarousel";
import { useGetSimilarProductsQuery } from "../slices/productApiSlice";

const ParentComponent: React.FC<{ productId: string }> = ({ productId }) => {
  const { data: products = [], isLoading } = useGetSimilarProductsQuery(productId);
 
  if (isLoading) return <p>טוען מוצרים דומים...</p>;

  return <SimilarProductsCarousel products={products} />;
};

export default ParentComponent;
