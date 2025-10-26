// Page mapping /chat/:cid to ChatWindow

// src/features/chat/pages/ChatPage.tsx

import ChatProvider from '../components/ChatProvider';

import ThreadsPage from './ThreadsPage';

function ThreadsStream() {

  return (
    <ChatProvider>
      <div className="h-[calc(100vh-80px)] max-w-5xl mx-auto p-4">
        <ThreadsPage />
      </div>
    </ChatProvider>
  );
}
export default ThreadsStream;