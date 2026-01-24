import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { ItemDetailsForm } from './ItemDetailsForm';
import { LocationPicker } from './LocationPicker';
import { useMapStore } from '../../store/map.store';
import { Plus, X } from 'lucide-react';

type FormData = {
  title: string;
  description: string;
  category: string;
  expiresAt: string;
  radius: number;
};

export const PostItemModal = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'details' | 'location'>('details');
  const [formData, setFormData] = useState<FormData | null>(null);
  const { clearPostingLocation } = useMapStore();

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep('details');
      setFormData(null);
      clearPostingLocation();
    }, 300);
  };

  const handleDetailsSubmit = (data: FormData) => {
    setFormData(data);
    setStep('location');
  };

  const handleBack = () => {
    if (step === 'location') {
      setStep('details');
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-14 w-14 items-center justify-center chamfered-btn bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-900/40 transition-all hover:scale-110 hover:from-cyan-400 hover:to-blue-500 active:scale-95 border border-white/20"
        aria-label="Post new item"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      <Modal open={open} onClose={handleClose}>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {step === 'details' && 'Post Found Item'}
              {step === 'location' && 'Where Did You Find It?'}
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div
                  className={`h-1 w-8 rounded ${
                    step === 'details' ? 'bg-cyan-500' : 'bg-slate-300'
                  }`}
                />
                <div
                  className={`h-1 w-8 rounded ${
                    step === 'location' ? 'bg-cyan-500' : 'bg-slate-300'
                  }`}
                />
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {step === 'details' && (
          <ItemDetailsForm
            type="found"
            onSubmit={handleDetailsSubmit}
          />
        )}

        {step === 'location' && formData && (
          <LocationPicker
            type="found"
            formData={formData}
            onClose={handleClose}
            onBack={handleBack}
          />
        )}
      </Modal>
    </>
  );
};
