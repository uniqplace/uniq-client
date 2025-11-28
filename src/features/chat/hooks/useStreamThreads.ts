import { useEffect, useMemo, useState } from 'react';
import type { Channel, StreamChat, ChannelFilters, ChannelSort, ChannelOptions } from 'stream-chat';

// useStreamThreads: Loads thread list from Stream with queryChannels, no watch, live updates via client.on('message.new')
// No channel.watch() in the list. Only in active chat view.
type Args = { client: StreamChat | null | undefined; meId?: string | null; limit?: number };
export function useStreamThreads({ client, meId, limit = 30 }: Args) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters: only messaging channels with current user as member
  const filters = useMemo<ChannelFilters>(() => ({
    type: 'messaging',
    members: { $in: [String(meId || '')] },
  }), [meId]);

  // Sort: most recent message first
  const sort = useMemo<ChannelSort>(() => ({ last_message_at: -1, updated_at: -1 }), []);
  const options = useMemo<ChannelOptions>(() => ({ watch: false, state: false, limit }), [limit]);

  useEffect(() => {
    if (!client || !meId) { setLoading(false); return; }
    let cancelled = false;

    (async () => {
      try {
        setLoading(true); setError(null);
        const chs = await client.queryChannels(filters, sort, options);
        if (!cancelled) setChannels(chs);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load channels');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    // Live update: move channel to top and update preview on new message or message.updated
    const updateChannelPreview = (ev: any) => {
      const cid = ev?.cid || ev?.channel?.cid;
      const msg = ev?.message;
      if (!cid || !msg) return;
      setChannels(prev => {
        const idx = prev.findIndex(c => c.cid === cid);
        if (idx === -1) return prev;
        const copy = prev.slice();
        const ch = copy[idx];
        // Update preview fields
        ch.data = {
          ...(ch.data || {}),
          last_message_text: msg.text || '',
          last_message_at: msg.created_at || new Date().toISOString(),
          last_message_sender: msg.user?.name || msg.user?.id || '',
          last_message_attachments: Array.isArray(msg.attachments) ? msg.attachments.length : 0,
          unread_count: typeof ch.countUnread === 'function' ? ch.countUnread() : 0,
        } as any;
        copy.splice(idx, 1);
        copy.unshift(ch);
        return copy;
      });
    };

    client.on('message.new', updateChannelPreview);
    client.on('message.updated', updateChannelPreview);
    return () => {
      cancelled = true;
      client.off('message.new', updateChannelPreview);
      client.off('message.updated', updateChannelPreview);
    };
  }, [client, meId, filters, sort, options]);

  return { channels, loading, error };
}
