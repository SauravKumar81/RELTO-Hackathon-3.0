import { CATEGORY_CONFIG } from '../../types/categories';
import { Button } from '../../components/ui/Button';

interface FilterPanelProps {
  category: string;
  type: string;
  urgency: boolean;
  onCategoryChange: (cat: string) => void;
  onTypeChange: (type: string) => void;
  onUrgencyChange: (urgent: boolean) => void;
}

export const FilterPanel = ({
  category,
  type,
  urgency,
  onCategoryChange,
  onTypeChange,
  onUrgencyChange
}: FilterPanelProps) => {
  return (
    <div className="absolute top-14 right-0 mt-2 w-72 glass-panel chamfered-box p-4 z-50 animate-in fade-in slide-in-from-top-4 shadow-2xl">
      <h3 className="text-white font-bold mb-4 text-sm tracking-widest uppercase">Filters</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2">Type</label>
          <div className="flex gap-2">
            <Button
              variant={type === '' ? 'primary' : 'ghost'}
              className="flex-1 h-8 text-xs"
              onClick={() => onTypeChange('')}
            >
              All
            </Button>
            <Button
              variant={type === 'lost' ? 'primary' : 'ghost'}
              className="flex-1 h-8 text-xs"
              onClick={() => onTypeChange('lost')}
            >
              Lost
            </Button>
            <Button
              variant={type === 'found' ? 'primary' : 'ghost'}
              className="flex-1 h-8 text-xs"
              onClick={() => onTypeChange('found')}
            >
              Found
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_CONFIG).map(([id, cat]) => (
              <option key={id} value={id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
           <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={urgency} 
                onChange={(e) => onUrgencyChange(e.target.checked)}
                className="rounded border-white/10 bg-black/40 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-black"
              />
              <span className="text-sm text-gray-300">Expiring Soon (Urgent)</span>
           </label>
        </div>
      </div>
    </div>
  );
};
