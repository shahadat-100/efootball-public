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
      ? 'left-1/2 -top-[92px] sm:-top-[98px]'
      :
      placement === 'responsive'
        ? 'left-1/2 -bottom-[90px] sm:-bottom-[96px] md:left-[unset] md:right-0 md:top-[160px] md:bottom-auto'
        : placement === 'right'
          ? 'left-[unset] right-0 top-[160px]'
          : 'left-1/2 -bottom-[90px] sm:-bottom-[96px]';

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'pointer-events-none absolute z-30 max-w-[360px] transition-opacity duration-300 ease-out',
        visible ? 'opacity-100 deadpool-bubble-pop' : 'opacity-0',
        placementClass,
        className
      )}
      style={
        placement === 'right'
          ? undefined
          : { transform: visible ? undefined : 'translate(-50%, 10px) scale(0.85)' }
      }
    >
      <div className="relative border-2 border-primary bg-[#111111] px-[16px] py-[6px] text-white rounded-lg shadow-lg">
        <p
          className="text-[11px] leading-snug text-white"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {message}
        </p>

        {placement === 'above' ? (
          <>
            <span className="absolute left-[28px] -bottom-[8px] h-0 w-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-[#1a1c1c] border-r-[8px] border-r-transparent" />
            <span className="absolute left-[27px] -bottom-[11px] h-0 w-0 border-l-[9px] border-l-transparent border-t-[9px] border-t-[#c8102e] border-r-[9px] border-r-transparent -z-10" />
          </>
        ) : placement === 'right' ? (
          <>
            <span className="absolute left-[33px] -bottom-[8px] h-0 w-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-[#1a1c1c] border-r-[8px] border-r-transparent" />
            <span className="absolute left-[32px] -bottom-[11px] h-0 w-0 border-l-[9px] border-l-transparent border-t-[9px] border-t-[#bc0100] border-r-[9px] border-r-transparent -z-10" />
          </>
        ) : placement === 'bottom' ? (
          <>
            <span className="absolute left-[25px] -bottom-[8px] h-0 w-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-[#1a1c1c] border-r-[8px] border-r-transparent" />
            <span className="absolute left-[24px] -bottom-[11px] h-0 w-0 border-l-[9px] border-l-transparent border-t-[9px] border-t-[#c8102e] border-r-[9px] border-r-transparent -z-10" />
          </>
        ) : (
          <>
            <span className="absolute left-[25px] -bottom-[8px] h-0 w-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-[#1a1c1c] border-r-[8px] border-r-transparent md:hidden" />
            <span className="absolute left-[24px] -bottom-[11px] h-0 w-0 border-l-[9px] border-l-transparent border-t-[9px] border-t-[#c8102e] border-r-[9px] border-r-transparent -z-10 md:hidden" />
            <span className="absolute left-[33px] -bottom-[8px] hidden h-0 w-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-[#1a1c1c] border-r-[8px] border-r-transparent md:block" />
            <span className="absolute left-[32px] -bottom-[11px] hidden h-0 w-0 border-l-[9px] border-l-transparent border-t-[9px] border-t-[#c8102e] border-r-[9px] border-r-transparent -z-10 md:block" />
          </>
        )}
      </div>
    </div>
  );
}