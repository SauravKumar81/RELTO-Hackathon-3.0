import { useForm } from 'react-hook-form';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

type FormData = {
  title: string;
  description: string;
  category: string;
  expiresAt: string;
  radius: number;
};

type Props = {
  type: 'lost' | 'found';
  onSubmit: (data: FormData) => void;
  onBack?: () => void;
};

const categories = [
  'electronics',
  'clothing',
  'accessories',
  'documents',
  'keys',
  'wallet',
  'bag',
  'phone',
  'jewelry',
  'books',
  'toys',
  'sports',
  'general',
];

export const ItemDetailsForm = ({ type, onSubmit, onBack }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      radius: 200,
    },
  });

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    return oneYearLater.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="mb-2">
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${type === 'lost' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
          Item Type: {type}
        </span>
      </div>
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">
          Title *
        </label>
        <Input
          placeholder="e.g., Lost iPhone 13"
          className="bg-black/20 border-white/10 focus:border-cyan-500/50"
          {...register('title', {
            required: 'Title is required',
            minLength: {
              value: 3,
              message: 'Title must be at least 3 characters',
            },
          })}
        />
        {errors.title && (
          <p className="text-xs text-red-400 ml-1">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">
          Description
        </label>
        <Textarea
          placeholder="Provide additional details about the item..."
          rows={4}
          className="bg-black/20 border-white/10 focus:border-cyan-500/50"
          {...register('description')}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">
          Category *
        </label>
        <Select
          className="bg-black/20 border-white/10 focus:border-cyan-500/50 text-white [&>option]:bg-gray-900"
          {...register('category', { required: 'Category is required' })}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </Select>
        {errors.category && (
          <p className="text-xs text-red-400 ml-1">{errors.category.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">
            Expiration Date *
            </label>
            <Input
            type="date"
            min={getMinDate()}
            max={getMaxDate()}
            className="bg-black/20 border-white/10 focus:border-cyan-500/50 [color-scheme:dark]"
            {...register('expiresAt', { required: 'Expiration date is required' })}
            />
            {errors.expiresAt && (
            <p className="text-xs text-red-400 ml-1">
                {errors.expiresAt.message}
            </p>
            )}
        </div>

        <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">
            Search Radius (m)
            </label>
            <Input
            type="number"
            min="50"
            max="5000"
            step="50"
            placeholder="200"
            className="bg-black/20 border-white/10 focus:border-cyan-500/50"
            {...register('radius', {
                valueAsNumber: true,
                min: { value: 50, message: 'Min 50m' },
                max: { value: 5000, message: 'Max 5000m' },
            })}
            />
            {errors.radius && (
            <p className="text-xs text-red-400 ml-1">{errors.radius.message}</p>
            )}
        </div>
      </div>
      
      <div className="flex gap-3 pt-2">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
        )}
        <Button type="submit" className={onBack ? "flex-1" : "w-full"}>
          Next: Location
        </Button>
      </div>
    </form>
  );
};
