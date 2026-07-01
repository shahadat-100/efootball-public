import { cn } from '@/shared/lib/cn';

interface AvatarSpeechBubbleProps {
  message: string;
  visible: boolean;
  placement?: 'right' | 'bottom' | 'responsive';
  className?: string;
}

export function AvatarSpeechBubble({ message, visible, placement = 'right', className }: AvatarSpeechBubbleProps) {
  const placementClass =
    placement === 'responsive'
      ? 'left-1/2 -translate-x-1/2 -bottom-[92px] sm:-bottom-[98px] md:left-full md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:ml-5 md:translate-x-0'
      : placement === 'right'
        ? 'left-full top-1/2 -translate-y-1/2 ml-4 md:ml-5'
        : 'left-1/2 -translate-x-1/2 -bottom-[92px] sm:-bottom-[98px]';

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'pointer-events-none absolute z-20 max-w-[240px] md:max-w-[280px] transition-all duration-300 ease-out',
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        placementClass,
        className
      )}
    >
      <div className="relative rounded-2xl border border-border bg-card px-4 py-3 shadow-xl backdrop-blur-md">
        <p className="text-[13px] font-semibold text-foreground leading-snug">
          {message}
        </p>

        {placement === 'right' ? (
          <span className="absolute left-[-7px] top-1/2 -translate-y-1/2 h-3.5 w-3.5 rotate-45 border-l border-b border-border bg-card" />
        ) : placement === 'bottom' ? (
          <span className="absolute left-1/2 -top-1.5 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-t border-l border-border bg-card" />
        ) : (
          <>
            <span className="absolute left-1/2 -top-1.5 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-t border-l border-border bg-card md:hidden" />
            <span className="absolute left-[-7px] top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 rotate-45 border-l border-b border-border bg-card md:block" />
          </>
        )}
      </div>
    </div>
  );
}
