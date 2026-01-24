export type ConversationStatus = 'active' | 'closed' | 'resolved' | 'withdrawn';

export type Conversation = {
  _id: string;
  item: {
    _id: string;
    title: string;
    type: 'lost' | 'found';
    category: string;
    imageUrl?: string;
    isResolved: boolean;
  };
  poster: {
    _id: string;
    name: string;
  };
  claimant: {
    _id: string;
    name: string;
  };
  status: ConversationStatus;
  lastMessageAt: string;
  closedAt?: string;
  closedBy?: string;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    name: string;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};
