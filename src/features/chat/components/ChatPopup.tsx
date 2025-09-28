import ChatWindow from './ChatWindow';

interface ChatPopupProps {
  cid: string | null;
  onClose: () => void;
  size?: { width: number; height: number };
}

const defaultSize = { width: 700, height: 480 };
const minWidth = 500;
const minHeight = 320;
const maxWidth = 1100;
const maxHeight = 700;

export default function ChatPopup({ cid, onClose, size }: ChatPopupProps) {
  if (!cid) return null;
  const popupSize = size || defaultSize;
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
          minWidth: minWidth,
          minHeight: minHeight,
          maxWidth: maxWidth,
          maxHeight: maxHeight,
          borderRadius: '1.25rem',
        }}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50 rounded-t-xl">
          <span className="font-semibold text-lg text-gray-700"></span>
          <button
            className="text-gray-400 hover:text-gray-700 text-2xl"
            onClick={onClose}
            title="סגור חלון"
          >✕</button>
        </div>
        <div className="flex-1 min-h-0">
          <ChatWindow cid={cid} />
        </div>
      </div>
    </>
  );
}
