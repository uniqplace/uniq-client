import { useEffect, useRef, useState } from 'react';
import type { Channel as StreamChannel, StreamChat } from 'stream-chat';
import { parseCid } from '../utils/parseCid';
import { threadByCid } from '../chatThunks';
import { useDispatch } from 'react-redux';

export function useChatChannel(cid: string, client: StreamChat | undefined) {
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const dispatch = useDispatch<any>();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    setFatalError(null);
    setChannel(null);

    if (!client) {
      setLoading(false);
      setFatalError('Chat client is not ready.');
      return () => {
        mountedRef.current = false;
      };
    }

    let closed = false;

    (async () => {
      try {
        const { type, id } = parseCid(cid);
        await dispatch(threadByCid({ cid }) as any);

        const ch = client.channel(type as any, id);
        await ch.watch();

        if (!closed && mountedRef.current) {
          setChannel(ch);
        }
      } catch (e: any) {
        console.error('[ChatWindow] watch failed:', e);
        if (mountedRef.current) {
          setFatalError(e?.message || 'Failed to open chat');
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    })();

    return () => {
      closed = true;
      mountedRef.current = false;
      setChannel(null);
    };
  }, [client, cid, dispatch]);

  return { channel, loading, fatalError };
}
