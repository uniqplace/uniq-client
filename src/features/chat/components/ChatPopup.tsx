import ChatWindow from './ChatWindow';

interface ChatPopupProps {
  cid: string | null;
  onClose: () => void;
  size?: { width: number; height: number };
}

import {
  CHAT_POPUP_DEFAULT_SIZE,
  CHAT_POPUP_MIN_WIDTH,
  CHAT_POPUP_MIN_HEIGHT,
  CHAT_POPUP_MAX_WIDTH,
  CHAT_POPUP_MAX_HEIGHT,
} from '../hooks/chatPopup.constants';

export default function ChatPopup({ cid, onClose, size }: ChatPopupProps) {
  if (!cid) return null;
  const popupSize = size || CHAT_POPUP_DEFAULT_SIZE;
  return (
    <>
      {/* Overlay with blur */}
      <div
        className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm transition-all"
        style={{ pointerEvents: 'auto' }}
        onClick={onClose}
      />
      {/* Centered popup */}
      <div
        className="fixed left-1/2 top-1/2 z-50 bg-white shadow-2xl rounded-2xl border flex flex-col"
        style={{
          boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
          width: popupSize.width,
          height: popupSize.height,
          transform: 'translate(-50%, -50%)',
          minWidth: CHAT_POPUP_MIN_WIDTH,
          minHeight: CHAT_POPUP_MIN_HEIGHT,
          maxWidth: CHAT_POPUP_MAX_WIDTH,
          maxHeight: CHAT_POPUP_MAX_HEIGHT,
          borderRadius: '1.25rem',
        }}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50 rounded-t-xl">
          <span className="font-semibold text-lg text-gray-700"></span>
          <button
            className="text-gray-400 hover:text-gray-700 text-2xl"
            onClick={onClose}
            title="Close window"
          >✕</button>
        </div>
        <div className="flex-1 min-h-0">
          <ChatWindow cid={cid} />
        </div>
      </div>
    </>
  );
}
