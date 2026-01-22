export type Item = {
  _id: string;
  title: string;
  description?: string;
  type: 'lost' | 'found';
  category: string;
  imageUrl?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  radius: number;
  owner: {
    _id: string;
    name: string;
    email?: string;
  };
  claimer?: {
    _id: string;
    name: string;
    email?: string;
  };
  claimedAt?: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: {
    _id: string;
    name: string;
  };
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};
