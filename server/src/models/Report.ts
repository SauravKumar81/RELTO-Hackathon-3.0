import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReport extends Document {
  reportedItem: Types.ObjectId;
  reportedUser: Types.ObjectId;
  reporter: Types.ObjectId;
  reason: string;
  description: string;
  evidence?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema<IReport> = new Schema(
  {
    reportedItem: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    reportedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'false_claim',
        'item_not_returned',
        'suspicious_behavior',
        'scam_attempt',
        'harassment',
        'other',
      ],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    evidence: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ReportSchema.index({ reportedUser: 1 });
ReportSchema.index({ reporter: 1 });
ReportSchema.index({ createdAt: -1 });

const Report = mongoose.model<IReport>('Report', ReportSchema);

export default Report;
