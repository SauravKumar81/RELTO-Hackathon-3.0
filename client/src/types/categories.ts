import {
  Wallet,
  Smartphone,
  Key,
  Dog,
  Cat,
  Briefcase,
  Backpack,
  FileText,
  Watch,
  Glasses,
  Headphones,
  Camera,
  Book,
  CreditCard,
  Heart,
  Package,
  type LucideIcon,
} from 'lucide-react';

export type ItemCategory = 
  | 'wallet'
  | 'phone'
  | 'keys'
  | 'pet-dog'
  | 'pet-cat'
  | 'bag'
  | 'backpack'
  | 'documents'
  | 'watch'
  | 'glasses'
  | 'headphones'
  | 'camera'
  | 'book'
  | 'card'
  | 'jewelry'
  | 'other';

export interface CategoryConfig {
  icon: LucideIcon;
  label: string;
  color: string;
  urgency: 'low' | 'medium' | 'high';
}

export const CATEGORY_CONFIG: Record<ItemCategory, CategoryConfig> = {
  wallet: {
    icon: Wallet,
    label: 'Wallet',
    color: '#10b981',
    urgency: 'medium',
  },
  phone: {
    icon: Smartphone,
    label: 'Phone',
    color: '#3b82f6',
    urgency: 'medium',
  },
  keys: {
    icon: Key,
    label: 'Keys',
    color: '#f59e0b',
    urgency: 'medium',
  },
  'pet-dog': {
    icon: Dog,
    label: 'Dog',
    color: '#ef4444',
    urgency: 'high',
  },
  'pet-cat': {
    icon: Cat,
    label: 'Cat',
    color: '#ef4444',
    urgency: 'high',
  },
  bag: {
    icon: Briefcase,
    label: 'Bag/Briefcase',
    color: '#8b5cf6',
    urgency: 'low',
  },
  backpack: {
    icon: Backpack,
    label: 'Backpack',
    color: '#8b5cf6',
    urgency: 'low',
  },
  documents: {
    icon: FileText,
    label: 'Documents/ID',
    color: '#ef4444',
    urgency: 'high',
  },
  watch: {
    icon: Watch,
    label: 'Watch',
    color: '#06b6d4',
    urgency: 'low',
  },
  glasses: {
    icon: Glasses,
    label: 'Glasses',
    color: '#14b8a6',
    urgency: 'medium',
  },
  headphones: {
    icon: Headphones,
    label: 'Headphones',
    color: '#6366f1',
    urgency: 'low',
  },
  camera: {
    icon: Camera,
    label: 'Camera',
    color: '#ec4899',
    urgency: 'medium',
  },
  book: {
    icon: Book,
    label: 'Book',
    color: '#84cc16',
    urgency: 'low',
  },
  card: {
    icon: CreditCard,
    label: 'Credit/ID Card',
    color: '#ef4444',
    urgency: 'high',
  },
  jewelry: {
    icon: Heart,
    label: 'Jewelry',
    color: '#f43f5e',
    urgency: 'medium',
  },
  other: {
    icon: Package,
    label: 'Other',
    color: '#2a766bff',
    urgency: 'low',
  },
};

export const getCategoryConfig = (category: string): CategoryConfig => {
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-');
  return CATEGORY_CONFIG[normalizedCategory as ItemCategory] || CATEGORY_CONFIG.other;
};
