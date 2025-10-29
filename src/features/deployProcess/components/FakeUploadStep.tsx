import type { StepProps } from "./Stepper/steps";
import { useEffect } from "react";
import { useAppSelector } from '../../../hooks/hooks';

const FakeUploadStep: React.FC<StepProps & { currentStepIndex?: number }> = ({ productId, setCanGoNext, currentStepIndex }) => {
  const product = useAppSelector(state => productId ? state.stepper.productsInProgress[productId]?.product : undefined);
  let categoryName = product?.category?.name || '';

  useEffect(() => {
    if (product && setCanGoNext) {
      setCanGoNext(true);
    }
  }, [product, setCanGoNext, productId, currentStepIndex]);

  if (!product) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold mb-3 flex justify-center items-center gap-2">
          <span role="img" aria-label="AI">🤖</span>
          Step 1 – Product Preview
        </h2>
        <p className="text-gray-700 mb-1">No product data found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span role="img" aria-label="AI">🤖</span>
        Product Preview
      </h2>
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-md flex flex-col gap-4 items-center">
        {product.images && product.images.length > 0 && (
          <img src={product.images[0]} alt="product" className="mb-2 max-h-40 rounded shadow border" />
        )}
        <div className="font-bold text-xl text-indigo-700 flex items-center gap-2">
          <span className="pi pi-tag text-indigo-400" /> {product.title}
        </div>
        <div className="text-gray-700 text-base mb-2 flex items-center gap-2">
          <span className="pi pi-align-left text-gray-400" /> {product.description}
        </div>
        <div className="flex gap-4 justify-center mb-2">
          <div className="text-blue-700 font-semibold flex items-center gap-1">
            <span className="pi pi-money-bill" /> {product.price} ₪
          </div>
          <div className="text-gray-600 flex items-center gap-1">
            <span className="pi pi-list" /> {categoryName}
          </div>
        </div>
        <div className="flex gap-4 justify-center mb-2">
          <div className="text-gray-600 flex items-center gap-1">
            <span className="pi pi-map-marker" /> {product.location}
          </div>
          <div className="text-gray-600 flex items-center gap-1">
            <span className="pi pi-check" /> {product.status}
          </div>
        </div>
        <div className="flex gap-4 justify-center mb-2">
          <div className="text-gray-600 flex items-center gap-1">
            <span className="pi pi-star" /> {product.condition}
          </div>
          <div className="text-gray-600 flex items-center gap-1">
            <span className="pi pi-tags" /> {Array.isArray(product.tags) ? product.tags.join(', ') : product.tags}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FakeUploadStep;
