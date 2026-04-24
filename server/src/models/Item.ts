import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IItem extends Document {
  title: string;
  description?: string;
  type: 'lost' | 'found';
  category: string;
  imageUrl?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  radius?: number;
  owner: Types.ObjectId;
  claimer?: Types.ObjectId;
  claimedAt?: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema: Schema<IItem> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    radius: {
      type: Number,
      default: 200,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    claimer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    claimedAt: {
      type: Date,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ItemSchema.index({ location: '2dsphere' });
ItemSchema.index({ title: 'text', description: 'text' });

const Item = mongoose.model<IItem>('Item', ItemSchema);

export default Item;
