// Button to open/ensure 1:1 chat (bid) and navigate to cid

import { useState } from 'react';
import { ensureDirectBid } from '../api/chatApi';
import { useNavigate } from 'react-router-dom';

type Props = { bidRequestId: string; bidOfferId: string; label?: string };

export default function DirectChatLauncher({ bidRequestId, bidOfferId, label = 'Open chat' }: Props) {
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function openChat() {
    setLoading(true);
    try {
      const { cid } = await ensureDirectBid({ bidRequestId, bidOfferId });
      nav(`/chat/${encodeURIComponent(cid)}`);
    } catch (e) {
      console.error('[DirectChatLauncher]', e);
      alert('Failed to open chat');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={openChat} disabled={loading} className="px-3 py-2 rounded bg-blue-600 text-white">
      {loading ? 'Opening…' : label}
    </button>
  );
}

