import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import Item from '../models/Item';
import User from '../models/User';
import { sendNotificationEmail } from "../utils/email";
import { getIO } from '../socket';

export const startConversation = async (req: Request, res: Response) => {
  const { itemId, initialMessage } = req.body;
  const claimantId = (req as any).user.id;

  if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ message: 'Valid item ID is required' });
  }

  const item = await Item.findById(itemId).populate('owner', 'name email');
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (item.isResolved) {
    return res.status(400).json({ message: 'This item has already been resolved' });
  }

  const posterId = item.owner._id.toString();

  if (posterId === claimantId) {
    return res.status(400).json({ message: 'You cannot claim your own item' });
  }

  const existingConversation = await Conversation.findOne({
    item: itemId,
    claimant: claimantId,
    status: 'active',
  });

  if (existingConversation) {
    return res.status(400).json({ 
      message: 'You already have an active conversation for this item',
      conversationId: existingConversation._id,
    });
  }

  const conversation = await Conversation.create({
    item: itemId,
    poster: posterId,
    claimant: claimantId,
  });

  if (initialMessage && initialMessage.trim()) {
    await Message.create({
      conversation: conversation._id,
      sender: claimantId,
      content: initialMessage.trim(),
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();
  }

  const claimant = await User.findById(claimantId).select('name');
  const poster = item.owner as any;

  if (poster.email) {
    const itemTypeAction = item.type === 'found' 
      ? 'claims this might be theirs' 
      : 'says they found your item';
    
    await sendNotificationEmail({
      to: poster.email,
      subject: `Someone ${itemTypeAction}: ${item.title}`,
      posterName: poster.name,
      claimantName: claimant?.name || 'Someone',
      itemTitle: item.title,
      itemType: item.type,
      initialMessage: initialMessage?.trim(),
    });
  }

  await conversation.populate('item', 'title type category imageUrl');
  await conversation.populate('poster', 'name');
  await conversation.populate('claimant', 'name');

  res.status(201).json(conversation);
};

export const getMyConversations = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { status } = req.query;

  const filter: any = {
    $or: [{ poster: userId }, { claimant: userId }],
  };

  if (status && ['active', 'closed', 'resolved', 'withdrawn'].includes(status as string)) {
    filter.status = status;
  }

  const conversations = await Conversation.find(filter)
    .populate('item', 'title type category imageUrl isResolved')
    .populate('poster', 'name')
    .populate('claimant', 'name')
    .sort({ lastMessageAt: -1 });

  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        sender: { $ne: userId },
        isRead: false,
      });

      return {
        ...conv.toObject(),
        unreadCount,
      };
    })
  );

  res.json(conversationsWithUnread);
};


export const getConversationsForItem = async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const userId = (req as any).user.id;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ message: 'Invalid item ID' });
  }

  const item = await Item.findById(itemId);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (item.owner.toString() !== userId) {
    return res.status(403).json({ message: 'Not authorized to view these conversations' });
  }

  const conversations = await Conversation.find({
    item: itemId,
    status: 'active',
  })
    .populate('claimant', 'name')
    .sort({ lastMessageAt: -1 });

  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        sender: { $ne: userId },
        isRead: false,
      });

      return {
        ...conv.toObject(),
        unreadCount,
      };
    })
  );

  res.json(conversationsWithUnread);
};


export const getConversationById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid conversation ID' });
  }

  const conversation = await Conversation.findById(id)
    .populate('item', 'title type category imageUrl isResolved')
    .populate('poster', 'name')
    .populate('claimant', 'name');

  if (!conversation) {
    return res.status(404).json({ message: 'Conversation not found' });
  }

  const isPoster = conversation.poster._id.toString() === userId;
  const isClaimant = conversation.claimant._id.toString() === userId;

  if (!isPoster && !isClaimant) {
    return res.status(403).json({ message: 'Not authorized to view this conversation' });
  }

  res.json(conversation);
};


export const getMessages = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { before } = req.query;
  const userId = (req as any).user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid conversation ID' });
  }

  const conversation = await Conversation.findById(id);
  if (!conversation) {
    return res.status(404).json({ message: 'Conversation not found' });
  }

  const isPoster = conversation.poster.toString() === userId;
  const isClaimant = conversation.claimant.toString() === userId;

  if (!isPoster && !isClaimant) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const filter: any = { conversation: id };
  if (before) {
    filter.createdAt = { $lt: new Date(before as string) };
  }

  const messages = await Message.find(filter)
    .populate('sender', 'name')
    .sort({ createdAt: -1 })
    .limit(50);

  await Message.updateMany(
    {
      conversation: id,
      sender: { $ne: userId },
      isRead: false,
    },
    { isRead: true }
  );

  res.json(messages.reverse());
};


export const sendMessage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = (req as any).user.id;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Message content is required' });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid conversation ID' });
  }

  const conversation = await Conversation.findById(id)
    .populate('poster', 'name email')
    .populate('claimant', 'name email')
    .populate('item', 'title type');

  if (!conversation) {
    return res.status(404).json({ message: 'Conversation not found' });
  }

  if (conversation.status !== 'active') {
    return res.status(400).json({ message: 'This conversation is no longer active' });
  }

  const isPoster = conversation.poster._id.toString() === userId;
  const isClaimant = conversation.claimant._id.toString() === userId;

  if (!isPoster && !isClaimant) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const message = await Message.create({
    conversation: id,
    sender: userId,
    content: content.trim(),
  });

  conversation.lastMessageAt = new Date();
  await conversation.save();

  const recipient = isPoster ? conversation.claimant : conversation.poster;
  const sender = isPoster ? conversation.poster : conversation.claimant;
  const item = conversation.item as any;

  if ((recipient as any).email) {
    await sendNotificationEmail({
      to: (recipient as any).email,
      subject: `New message about: ${item.title}`,
      posterName: (recipient as any).name,
      claimantName: (sender as any).name,
      itemTitle: item.title,
      itemType: item.type,
      initialMessage: content.trim(),
    });
  }

  await message.populate('sender', 'name');

  try {
    const io = getIO();
    // Emit to conversation room and to recipient's personal room
    io.to(`conversation:${id}`).emit('new_message', message);
    io.to(`user:${(recipient as any)._id}`).emit('new_notification', {
      type: 'new_message',
      message: `New message about: ${item.title}`,
      conversationId: id,
    });
  } catch (error) {
    console.error('Socket error:', error);
  }

  res.status(201).json(message);
};


export const closeConversation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid conversation ID' });
  }

  const conversation = await Conversation.findById(id);

  if (!conversation) {
    return res.status(404).json({ message: 'Conversation not found' });
  }

  if (conversation.poster.toString() !== userId) {
    return res.status(403).json({ message: 'Only the item poster can close this conversation' });
  }

  if (conversation.status !== 'active') {
    return res.status(400).json({ message: 'Conversation is already closed' });
  }

  conversation.status = 'closed';
  conversation.closedAt = new Date();
  conversation.closedBy = new mongoose.Types.ObjectId(userId);
  await conversation.save();

  res.json({ message: 'Conversation closed successfully' });
};


export const withdrawConversation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid conversation ID' });
  }

  const conversation = await Conversation.findById(id);

  if (!conversation) {
    return res.status(404).json({ message: 'Conversation not found' });
  }

  if (conversation.claimant.toString() !== userId) {
    return res.status(403).json({ message: 'Only the claimant can withdraw from this conversation' });
  }

  if (conversation.status !== 'active') {
    return res.status(400).json({ message: 'Conversation is already closed' });
  }

  conversation.status = 'withdrawn';
  conversation.closedAt = new Date();
  conversation.closedBy = new mongoose.Types.ObjectId(userId);
  await conversation.save();

  res.json({ message: 'You have withdrawn from this conversation' });
};


export const getUnreadCount = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const conversations = await Conversation.find({
    $or: [{ poster: userId }, { claimant: userId }],
    status: 'active',
  });

  const conversationIds = conversations.map((c) => c._id);

  const unreadCount = await Message.countDocuments({
    conversation: { $in: conversationIds },
    sender: { $ne: userId },
    isRead: false,
  });

  res.json({ unreadCount });
};

