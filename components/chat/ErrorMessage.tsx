'use client';

import { motion } from 'framer-motion';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorMessageProps {
  content?: string | null;
  onRetry?: () => void;
}

export default function ErrorMessage({ content, onRetry }: ErrorMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-start mb-4 max-w-[88%]"
    >
      <div className="octx-banner-error flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0 text-state-error" />
          <span className="text-xs font-medium text-state-error">Something went wrong</span>
        </div>
        <p className="text-xs text-txt-secondary opacity-90">
          {content || 'Failed to get a response. Check your connection and try again.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 mt-2 text-xs text-accent hover:text-accent-hover transition-colors"
          >
            <RotateCcw size={12} />
            Retry
          </button>
        )}
      </div>
    </motion.div>
  );
}
