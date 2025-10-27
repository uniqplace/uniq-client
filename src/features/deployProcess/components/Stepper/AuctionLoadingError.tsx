import React from 'react';

interface AuctionLoadingErrorProps {
  productId: string;
}

const AuctionLoadingError: React.FC<AuctionLoadingErrorProps> = ({ productId }) => {
  return (
    <div className="text-center py-8 text-lg text-gray-500">
      Loading auction data...<br />
      {(!productId || productId === '') && (
        <span className="text-red-500">Could not load your auction. Please refresh the page.</span>
      )}
      {productId && productId !== '' && (
        <span className="text-green-500">productId loaded: {productId}</span>
      )}
    </div>
  );
};

export default AuctionLoadingError;
