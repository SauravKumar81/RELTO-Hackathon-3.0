import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle, Upload, X } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { createReport } from '../../services/report.service';
import { REPORT_REASONS, type ReportReason } from '../../types/report';
import type { Item } from '../../types/item';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/auth.store';

type Props = {
  item: Item;
  open: boolean;
  onClose: () => void;
};

type FormData = {
  reportedUserId: string;
  reason: ReportReason;
  description: string;
  evidence?: FileList;
};

export const ReportModal = ({ item, open, onClose }: Props) => {
  const [loading, setLoading] = useState(false);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<FormData>();
  const user = useAuthStore((s) => s.user);

  const reportedUser = item.claimer || item.owner;

  if (!user) {
    return null;
  }

  const handleEvidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidencePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!reportedUser) {
      toast.error('No user to report');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('itemId', item._id);
      formData.append('reportedUserId', reportedUser._id);
      formData.append('reason', data.reason);
      formData.append('description', data.description);

      if (data.evidence && data.evidence[0]) {
        formData.append('evidence', data.evidence[0]);
      }

      await createReport(formData);
      toast.success('Report submitted successfully. Thank you for helping keep our community safe.');
      reset();
      setEvidencePreview(null);
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Report Issue</h2>
            <p className="text-sm text-gray-400 mt-1">
              Report suspicious activity or false claims for: <strong className="text-white">{item.title}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-black/20 border border-white/5 rounded-lg p-4">
            <h3 className="font-semibold text-gray-200 mb-2 text-sm uppercase">Reporting User</h3>
            <p className="text-sm text-gray-300 font-bold">
              {reportedUser.name} <span className="text-gray-500 font-normal">{item.claimer ? '(Claimer)' : '(Owner)'}</span>
            </p>
            {reportedUser.email && (
              <p className="text-xs text-gray-400">{reportedUser.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 ml-1">
              Reason for Report <span className="text-red-400">*</span>
            </label>
            <Select
              {...register('reason', { required: 'Please select a reason' })}
              className={`bg-black/20 border-white/10 text-white [&>option]:bg-gray-900 ${errors.reason ? 'border-red-400' : ''}`}
            >
              <option value="">Select a reason</option>
              {Object.entries(REPORT_REASONS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            {errors.reason && (
              <p className="mt-1 text-sm text-red-400">{errors.reason.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 ml-1">
              Description <span className="text-red-400">*</span>
            </label>
            <Textarea
              {...register('description', {
                required: 'Please provide a description',
                minLength: {
                  value: 10,
                  message: 'Description must be at least 10 characters',
                },
              })}
              rows={5}
              placeholder="Provide details about the issue..."
              className={`bg-black/20 border-white/10 text-white placeholder-gray-600 ${errors.description ? 'border-red-400' : ''}`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-600">
              Minimum 10 characters. Be as detailed as possible.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 ml-1">
              Evidence (Optional)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  {...register('evidence')}
                  onChange={handleEvidenceChange}
                  className="hidden"
                />
                <div className="border border-dashed border-white/20 rounded-lg p-4 text-center hover:border-cyan-500/50 hover:bg-white/5 transition-all group">
                  <Upload size={24} className="mx-auto text-gray-400 group-hover:text-cyan-400 mb-2 transition-colors" />
                  <p className="text-sm text-gray-400 group-hover:text-white transition-colors">
                    {evidencePreview ? 'Change image' : 'Upload screenshot or photo'}
                  </p>
                </div>
              </label>
              {evidencePreview && (
                <div className="relative w-24 h-24">
                  <img
                    src={evidencePreview}
                    alt="Evidence preview"
                    className="w-full h-full object-cover rounded-lg border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEvidencePreview(null);
                      reset({ ...watch(), evidence: undefined });
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-600">
              Upload screenshots, photos, or other evidence to support your report.
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200/80">
              <p className="font-bold mb-1 text-yellow-400">Important:</p>
              <p>
                False reports may result in action against your account. Please only report genuine issues.
                Your report helps keep our community safe and accountable.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/40 border-0" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
