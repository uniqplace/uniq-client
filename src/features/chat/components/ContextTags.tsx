
import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface Context {
  productTitle?: string | null;
  bidRequestId?: string | number | null;
  bidOfferId?: string | number | null;
}

interface ContextTagsProps {
  context: Context | null;
}


const ContextTags: React.FC<ContextTagsProps> = ({ context }) => {
  const navigate = useNavigate();
  if (!context) {
    return <div className="text-xs text-gray-400">Loading details…</div>;
  }
  return (
    <div className="flex flex-wrap gap-1 text-xs text-gray-500 truncate">
      {context.productTitle && (
        <span className="bg-blue-100 text-blue-800 rounded px-2 py-0.5 font-medium cursor-pointer hover:bg-blue-200">
          {context.productTitle}
        </span>
      )}
      {context.bidRequestId && (
        <span
          className="bg-green-100 text-green-800 rounded px-2 py-0.5 font-medium cursor-pointer hover:bg-green-200"
          onClick={e => { e.stopPropagation(); navigate(`/myBidRequests/${context.bidRequestId}`); }}
          title="Go to request page"
        >
          Request: {String(context.bidRequestId).slice(-6)}
        </span>
      )}
      {context.bidOfferId && (
        <span
          className="bg-purple-100 text-purple-800 rounded px-2 py-0.5 font-medium cursor-pointer hover:bg-purple-200"
          onClick={e => { e.stopPropagation(); navigate(`/BidOfferDetails/${context.bidOfferId}`); }}
          title="Go to offer page"
        >
          Offer: {String(context.bidOfferId).slice(-6)}
        </span>
      )}
    </div>
  );
};

export default ContextTags;
