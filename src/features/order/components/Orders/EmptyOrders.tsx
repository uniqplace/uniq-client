import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

export const EmptyOrders = () => {
  const navigate = useNavigate();

  const handleGoToMarketplace = () => {
    navigate('/marketplace');
  };

  return (
    <div className="text-center text-gray-600 mt-10 transform -translate-x-8">
      <h2 className="text-xl font-semibold mb-2">You don’t have any orders yet</h2>
      <p className="mb-4">Once you place an order, it will appear here</p>
      <Button label="Browse Products" icon="pi pi-shopping-cart" onClick={handleGoToMarketplace} />
    </div>
  );
};
