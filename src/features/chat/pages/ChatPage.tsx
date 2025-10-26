
// src/features/chat/pages/ChatPage.tsx
import { useParams } from 'react-router-dom';
import ChatProvider from '../components/ChatProvider';
import ChatWindow from '../components/ChatWindow';

export default function ChatPage() {
  const { cid } = useParams<{ cid: string }>();
  if (!cid) return <div>Missing cid</div>;
  return (
    <ChatProvider>
        <ChatWindow cid={cid} />
    </ChatProvider>
  );
}