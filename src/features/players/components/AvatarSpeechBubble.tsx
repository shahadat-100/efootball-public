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
        visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.85] translate-y-2',
        placementClass,
        className
      )}
    >
      <div className="relative rounded-[0.9rem] border-2 border-primary/80 bg-[#1a1c1c] px-4 py-3 shadow-[6px_6px_0px_#bc0100] backdrop-blur-md">
        <p className="font-mono text-[11px] leading-snug text-white">
          {message}
        </p>

        {placement === 'right' ? (
          <>
            <span className="absolute left-[-8px] top-1/2 -translate-y-1/2 h-3.5 w-3.5 rotate-45 border-l-2 border-b-2 border-primary/80 bg-[#1a1c1c]" />
            <span className="absolute left-[-11px] top-1/2 -translate-y-1/2 h-4 w-4 rotate-45 border-l-2 border-b-2 border-[#bc0100] bg-transparent -z-10" />
          </>
        ) : placement === 'bottom' ? (
          <>
            <span className="absolute left-8 -top-1.5 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-t-2 border-l-2 border-primary/80 bg-[#1a1c1c]" />
            <span className="absolute left-[31px] -top-[7px] h-4 w-4 -translate-x-1/2 rotate-45 border-t-2 border-l-2 border-[#bc0100] bg-transparent -z-10" />
          </>
        ) : (
          <>
            <span className="absolute left-8 -top-1.5 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-t-2 border-l-2 border-primary/80 bg-[#1a1c1c] md:hidden" />
            <span className="absolute left-[31px] -top-[7px] h-4 w-4 -translate-x-1/2 rotate-45 border-t-2 border-l-2 border-[#bc0100] bg-transparent -z-10 md:hidden" />
            <span className="absolute left-[-8px] top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 rotate-45 border-l-2 border-b-2 border-primary/80 bg-[#1a1c1c] md:block" />
            <span className="absolute left-[-11px] top-1/2 hidden h-4 w-4 -translate-y-1/2 rotate-45 border-l-2 border-b-2 border-[#bc0100] bg-transparent -z-10 md:block" />
          </>
        )}
      </div>
    </div>
  );
}
