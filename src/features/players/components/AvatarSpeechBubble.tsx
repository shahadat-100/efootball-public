import { cn } from '@/shared/lib/cn';

interface AvatarSpeechBubbleProps {
  message: string;
  visible: boolean;
  placement?: 'right' | 'bottom' | 'responsive' | 'above';
  className?: string;
}

export function AvatarSpeechBubble({ message, visible, placement = 'right', className }: AvatarSpeechBubbleProps) {
  const placementClass =
    placement === 'above'
      ? 'left-1/2 bottom-[100%] mb-3 -translate-x-1/2'
      :
      placement === 'responsive'
        ? 'left-1/2 -bottom-[90px] sm:-bottom-[96px] md:left-[unset] md:right-0 md:top-[160px] md:bottom-auto md:translate-x-0 -translate-x-1/2'
        : placement === 'right'
          ? 'left-[unset] right-0 top-[160px]'
          : 'left-1/2 -bottom-[90px] sm:-bottom-[96px] -translate-x-1/2';

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'pointer-events-none absolute z-30 max-w-[220px] min-w-[170px] transition-opacity duration-300 ease-out',
        visible ? 'opacity-100 deadpool-bubble-pop' : 'opacity-0',
        placementClass,
        className
      )}
      style={
        placement === 'right'
          ? undefined
          : { transform: visible ? 'translateX(-50%)' : 'translateX(-50%) translateY(10px) scale(0.85)' }
      }
    >
      <div className="relative border-2 border-[#bc0100] bg-[#1a1c1c] px-[14px] py-[10px] text-white shadow-[6px_6px_0px_#bc0100] min-h-[44px] flex items-center">
        <p
          className="text-[11px] leading-snug text-white w-full text-center"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {message}
        </p>

        {placement === 'above' ? (
          <>
            <span className="absolute left-1/2 -bottom-[8px] h-0 w-0 -translate-x-1/2 border-l-[8px] border-l-transparent border-t-[8px] border-t-[#1a1c1c] border-r-[8px] border-r-transparent" />
            <span className="absolute left-1/2 -bottom-[11px] h-0 w-0 -translate-x-1/2 border-l-[9px] border-l-transparent border-t-[9px] border-t-[#bc0100] border-r-[9px] border-r-transparent -z-10" />
          </>
        ) : placement === 'right' ? (
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
