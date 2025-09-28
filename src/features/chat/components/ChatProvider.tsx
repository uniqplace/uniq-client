import type { PropsWithChildren } from 'react';
import {
  useEffect,
  //useMemo,
  useRef,
  useState,
  createContext,
  useContext,
} from 'react';
import { StreamChat } from 'stream-chat';
import { Chat } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { issueStreamToken } from '../api/chatApi';

type Status = 'idle' | 'connecting' | 'ready' | 'error';

const StreamClientCtx = createContext<StreamChat | null>(null);
export const useStreamClient = (): StreamChat | null => useContext(StreamClientCtx);

/** Banner סטיקי למצב חיבור */
function ConnectionBanner({ online }: { online: boolean | null }) {
  if (online === null || online === true) return null;
  return (
    <div className="sticky top-0 z-50 w-full bg-red-600 text-white text-sm text-center py-1">
      Connection lost… reconnecting
    </div>
  );
}

/** Overlay פשוט ל-Loading/Error */
function StatusOverlay({
  mode,
  message,
  onRetry,
}: {
  mode: 'loading' | 'error';
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="fixed inset-0 grid place-items-center bg-white/80">
      <div className="flex flex-col items-center gap-3">
        {mode === 'loading' ? (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
            <div className="text-gray-700">Connecting chat…</div>
          </>
        ) : (
          <>
            <div className="text-red-600 font-medium">Chat init failed</div>
            {message && <div className="text-sm text-red-700">{message}</div>}
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm"
              >
                Retry
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ChatProvider({ children }: PropsWithChildren) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);
  const [epoch, setEpoch] = useState(0); // לשחזור התחברות בלחיצת Retry
  const connecting = useRef(false);
  const mounted = useRef(true);

  const retry = () => setEpoch((x) => x + 1);

  useEffect(() => {
    mounted.current = true;

    async function connect() {
      if (connecting.current) return;
      connecting.current = true;
      try {
        setStatus('connecting');
        setError(null);

        const { apiKey, userId, token } = await issueStreamToken();
        const c = StreamChat.getInstance(apiKey);

        // מאזינים לשינויי חיבור
        c.on('connection.changed', (e) => {
          if (!mounted.current) return;
          setOnline(!!e.online);
        });

        await c.connectUser({ id: userId }, token);
        if (!mounted.current) {
          await c.disconnectUser().catch(() => {});
          return;
        }

        setClient(c);
        setOnline(true);
        setStatus('ready');
      } catch (e: any) {
        setError(e?.message || 'unknown error');
        setStatus('error');
      } finally {
        connecting.current = false;
      }
    }

    connect();

    return () => {
      mounted.current = false;
      setStatus('idle');
      setOnline(null);
      setClient((prev) => {
        if (prev) prev.disconnectUser().catch(() => {});
        return null;
      });
    };
    // epoch מאפשר Retry נקי
  }, [epoch]);

//  const ready = useMemo(() => status === 'ready' && !!client, [status, client]);

  // מצב טעינה
  if (status === 'idle' || status === 'connecting') {
    return <StatusOverlay mode="loading" />;
  }

  // מצב שגיאה + Retry
  if (status === 'error' || !client) {
    return <StatusOverlay mode="error" message={error ?? undefined} onRetry={retry} />;
  }

  return (
    <StreamClientCtx.Provider value={client}>
      <Chat client={client}>
        <ConnectionBanner online={online} />
        {children}
      </Chat>
    </StreamClientCtx.Provider>
  );
}
