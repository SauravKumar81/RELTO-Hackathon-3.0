import mongoose, { Document, Schema, Types } from 'mongoose';

export type ConversationStatus = 'active' | 'closed' | 'resolved' | 'withdrawn';

export interface IConversation extends Document {
  item: Types.ObjectId;
  poster: Types.ObjectId;
  claimant: Types.ObjectId;
  status: ConversationStatus;
  lastMessageAt: Date;
  closedAt?: Date;
  closedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema<IConversation> = new Schema(
  {
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    poster: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    claimant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'resolved', 'withdrawn'],
      default: 'active',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    closedAt: {
      type: Date,
    },
    closedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

ConversationSchema.index(
  { item: 1, claimant: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);

ConversationSchema.index({ poster: 1, status: 1 });
ConversationSchema.index({ claimant: 1, status: 1 });

ConversationSchema.index({ item: 1 });

const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
