import { useNavigate } from "react-router-dom";
import type { ThreadContext } from "../chatSlice";

interface ChatHeaderBarProps {
  context?: ThreadContext;
}

export function ChatDetails({ context }: ChatHeaderBarProps) {
  const navigate = useNavigate();
  const ctx = context;
  if (!ctx) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b bg-white min-h-[40px]">
      <div className="flex-1 min-w-0">
        <div className="flex flex-col">
          <div className="flex flex-wrap gap-1 text-xs text-gray-500 truncate">
            {ctx.productTitle && (
              <span
                className="bg-blue-100 text-blue-800 rounded px-2 py-0.5 font-medium cursor-pointer hover:bg-blue-200"
              >
                {ctx.productTitle}
              </span>
            )}
            {ctx.bidRequestId && (
              <span
                className="bg-green-100 text-green-800 rounded px-2 py-0.5 font-medium cursor-pointer hover:bg-green-200"
                onClick={() => navigate(`/myBidRequests/${ctx.bidRequestId}`)}
                title="מעבר לעמוד בקשה"
              >
                בקשה: {String(ctx.bidRequestId).slice(-6)}
              </span>
            )}
            {ctx.bidOfferId && (
              <span
                className="bg-purple-100 text-purple-800 rounded px-2 py-0.5 font-medium cursor-pointer hover:bg-purple-200"
                onClick={() => navigate(`/BidOfferDetails/${ctx.bidOfferId}`)}
                title="מעבר לעמוד הצעה"
              >
                הצעה: {String(ctx.bidOfferId).slice(-6)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
