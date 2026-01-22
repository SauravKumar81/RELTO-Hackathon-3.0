export type Report = {
  _id: string;
  reportedItem: {
    _id: string;
    title: string;
    type: 'lost' | 'found';
    category: string;
    imageUrl?: string;
    owner?: {
      _id: string;
      name: string;
    };
    claimer?: {
      _id: string;
      name: string;
    };
  };
  reportedUser: {
    _id: string;
    name: string;
    email?: string;
  };
  reporter: {
    _id: string;
    name: string;
    email?: string;
  };
  reason: 'false_claim' | 'item_not_returned' | 'suspicious_behavior' | 'scam_attempt' | 'harassment' | 'other';
  description: string;
  evidence?: string;
  createdAt: string;
  updatedAt: string;
};

export type ReportReason = 'false_claim' | 'item_not_returned' | 'suspicious_behavior' | 'scam_attempt' | 'harassment' | 'other';

export const REPORT_REASONS: Record<ReportReason, string> = {
  false_claim: 'False Claim',
  item_not_returned: 'Item Not Returned',
  suspicious_behavior: 'Suspicious Behavior',
  scam_attempt: 'Scam Attempt',
  harassment: 'Harassment',
  other: 'Other',
};
