import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';

type StartChatModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
  itemTitle: string;
  itemType: 'lost' | 'found';
  loading?: boolean;
};

export const StartChatModal = ({
  open,
  onClose,
  onSubmit,
  itemTitle,
  itemType,
  loading = false,
}: StartChatModalProps) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(message.trim());
      setMessage('');
      onClose();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const actionText = itemType === 'found' 
    ? "I believe this is my item" 
    : "I found this item";

  const placeholderText = itemType === 'found'
    ? "Add details to help verify ownership (e.g., identifying features, when/where you lost it)..."
    : "Describe where you found it or any details that might help the owner...";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            style={{ zIndex: 9998 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div 
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 9999, pointerEvents: 'none' }}
          >
            <motion.div
              className="w-full max-w-md rounded-xl glass-panel chamfered-box p-6 shadow-2xl relative overflow-hidden"
              style={{ pointerEvents: 'auto' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none"></div>

            <div className="flex items-center justify-between mb-6 relative">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 shadow-[0_0_10px_rgba(0,255,255,0.1)]">
                  <MessageCircle size={20} className="text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Start Conversation</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-400">
                You're about to contact the poster of:
              </p>
              <p className="font-bold text-white mt-1 text-lg">{itemTitle}</p>
            </div>

            <div className="mb-6 rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-200/80">
                  <p className="font-bold mb-1 text-amber-400">Privacy First</p>
                  <p className="leading-relaxed">Your contact information will NOT be shared. All communication happens through our secure chat.</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your message <span className="text-gray-500 font-normal">(optional but recommended)</span>
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={placeholderText}
                rows={4}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-xs text-gray-600 mt-2 text-right">
                {message.length}/500
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex-1"
                disabled={loading || submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-900/20"
                disabled={loading || submitting}
              >
                {submitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    {actionText}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
