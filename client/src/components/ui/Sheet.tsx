import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type SheetProps = {
  open: boolean;
  children: ReactNode;
};

export const Sheet = ({ open, children }: SheetProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-xl bg-white p-6 shadow-lg max-h-[60vh] overflow-y-auto"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ ease: 'easeOut', duration: 0.25 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
