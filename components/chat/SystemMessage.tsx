'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/design/cn';

interface SystemMessageProps {
  content: string;
  className?: string;
}

export default function SystemMessage({ content, className }: SystemMessageProps) {
  if (!content) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn('flex justify-center my-3', className)}
    >
      <span className="text-micro text-txt-disabled px-3 py-1 rounded-full bg-surface-2/50">
        {content}
      </span>
    </motion.div>
  );
}
