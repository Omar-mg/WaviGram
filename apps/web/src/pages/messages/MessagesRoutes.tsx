import { Routes, Route } from 'react-router-dom';
import { ConversationsPage } from './ConversationsPage';
import { ConversationPage } from './ConversationPage';
import { NewConversationPage } from './NewConversationPage';

export const MessagesRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ConversationsPage />} />
      <Route path="new" element={<NewConversationPage />} />
      <Route path=":conversationId" element={<ConversationPage />} />
    </Routes>
  );
};