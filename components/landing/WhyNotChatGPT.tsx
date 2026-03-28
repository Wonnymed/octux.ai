'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/design/cn';

const ROWS: { chatgpt: string; sukgo: string }[] = [
  { chatgpt: '1 AI, 1 opinion', sukgo: '10 specialists, adversarial rounds' },
  { chatgpt: 'No fixed structure', sukgo: 'Probability, grade, and risk blocks every time' },
  { chatgpt: 'Forgets prior sessions', sukgo: 'Memory across your simulations (paid tiers)' },
  { chatgpt: 'Generic business advice', sukgo: 'Role-based specialists (economics, regulation, demand…)' },
  { chatgpt: 'Chat interface', sukgo: 'Visual simulation dashboard + verdict panel' },
];

export default function WhyNotChatGPT() {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-[720px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <h2 className="text-2xl font-medium tracking-tight text-txt-primary sm:text-3xl">
            ChatGPT gives you an opinion.
            <br />
            <span className="text-accent">Sukgo gives you a simulation.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-reading text-sm text-txt-tertiary sm:text-base">
            Same LLM era — different product shape. Sukgo is built for decisions that need tension, structure, and traceability.
          </p>
        </motion.div>

        {/* Desktop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mt-10 hidden overflow-hidden rounded-2xl border border-border-subtle bg-surface-1 shadow-premium sm:block"
        >
          <div className="grid grid-cols-[1fr_1fr] gap-0 border-b border-border-subtle bg-surface-0/80">
            <div className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-txt-disabled">
              ChatGPT
            </div>
            <div className="border-l border-border-subtle px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-accent">
              Sukgo
            </div>
          </div>
          {ROWS.map((row, i) => (
            <div
              key={i}
              className={cn(
                'grid grid-cols-[1fr_1fr] gap-0 text-sm',
                i > 0 && 'border-t border-border-subtle/80',
              )}
            >
              <div className="px-5 py-3.5 text-txt-tertiary leading-relaxed">{row.chatgpt}</div>
              <div className="border-l border-border-subtle bg-accent-subtle/25 px-5 py-3.5 font-medium leading-relaxed text-txt-primary">
                {row.sukgo}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Mobile */}
        <div className="mt-8 space-y-3 sm:hidden">
          {ROWS.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.08 * i, duration: 0.35 }}
              className="overflow-hidden rounded-xl border border-border-subtle bg-surface-1"
            >
              <div className="border-b border-border-subtle/80 bg-surface-0/60 px-4 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-txt-disabled">ChatGPT</span>
                <p className="mt-1 text-sm text-txt-tertiary">{row.chatgpt}</p>
              </div>
              <div className="bg-accent-subtle/20 px-4 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">Sukgo</span>
                <p className="mt-1 text-sm font-medium text-txt-primary">{row.sukgo}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
