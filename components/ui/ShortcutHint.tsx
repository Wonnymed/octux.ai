import { cn } from '@/lib/design/cn';

interface ShortcutHintProps {
  keys: string;
  className?: string;
}

export default function ShortcutHint({ keys, className }: ShortcutHintProps) {
  return (
    <span className={cn('inline-flex items-center gap-0.5 ml-2', className)}>
      {keys.split('').map((char, i) => (
        <kbd
          key={i}
          className="inline-flex items-center justify-center min-w-[14px] h-4 px-0.5 text-[9px] font-medium text-txt-disabled bg-surface-2/80 rounded-sm"
        >
          {char}
        </kbd>
      ))}
    </span>
  );
}
