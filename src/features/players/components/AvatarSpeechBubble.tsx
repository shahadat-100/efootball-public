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
      ? 'left-1/2 -translate-x-1/2 -bottom-[90px] sm:-bottom-[96px] md:left-[unset] md:right-0 md:top-[160px] md:translate-x-0 md:translate-y-0 md:bottom-auto'
      : placement === 'right'
        ? 'left-[unset] right-0 top-[160px]'
        : 'left-1/2 -translate-x-1/2 -bottom-[90px] sm:-bottom-[96px]';

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'pointer-events-none absolute z-30 max-w-[220px] transition-all duration-300 ease-out',
        visible ? 'opacity-100 scale-100 translate-y-0 deadpool-bubble-pop' : 'opacity-0 scale-[0.85] translate-y-[10px]',
        placementClass,
        className
      )}
    >
      <div className="relative border-2 border-[#bc0100] bg-[#1a1c1c] px-[14px] py-[10px] text-white shadow-[6px_6px_0px_#bc0100]">
        <p
          className="text-[11px] leading-snug text-white"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {message}
        </p>

        {placement === 'right' ? (
          <>
            <span className="absolute left-[33px] -bottom-[8px] h-0 w-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-[#1a1c1c] border-r-[8px] border-r-transparent" />
            <span className="absolute left-[32px] -bottom-[11px] h-0 w-0 border-l-[9px] border-l-transparent border-t-[9px] border-t-[#bc0100] border-r-[9px] border-r-transparent -z-10" />
          </>
        ) : placement === 'bottom' ? (
          <>
            <span className="absolute left-[25px] -bottom-[8px] h-0 w-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-[#1a1c1c] border-r-[8px] border-r-transparent" />
            <span className="absolute left-[24px] -bottom-[11px] h-0 w-0 border-l-[9px] border-l-transparent border-t-[9px] border-t-[#bc0100] border-r-[9px] border-r-transparent -z-10" />
          </>
        ) : (
          <>
            <span className="absolute left-[25px] -bottom-[8px] h-0 w-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-[#1a1c1c] border-r-[8px] border-r-transparent md:hidden" />
            <span className="absolute left-[24px] -bottom-[11px] h-0 w-0 border-l-[9px] border-l-transparent border-t-[9px] border-t-[#bc0100] border-r-[9px] border-r-transparent -z-10 md:hidden" />
            <span className="absolute left-[33px] -bottom-[8px] hidden h-0 w-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-[#1a1c1c] border-r-[8px] border-r-transparent md:block" />
            <span className="absolute left-[32px] -bottom-[11px] hidden h-0 w-0 border-l-[9px] border-l-transparent border-t-[9px] border-t-[#bc0100] border-r-[9px] border-r-transparent -z-10 md:block" />
          </>
        )}
      </div>
    </div>
  );
}
