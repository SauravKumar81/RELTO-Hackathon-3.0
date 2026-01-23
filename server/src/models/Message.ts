import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMessage extends Document {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema<IMessage> = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ conversation: 1, createdAt: 1 });

const Message = mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
