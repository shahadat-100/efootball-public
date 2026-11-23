export function ClubMarqueeTicker() {
  const segment = (
    <div className="flex items-center gap-8 shrink-0">
      <span className="tracking-[0.3em] font-black uppercase text-white/90">THE ENIGMATIC ELITE</span>
      <span className="text-red-500 font-bold text-sm">✦</span>
      <span className="tracking-[0.3em] font-black uppercase text-white/90">IN MYSTERY WE REIGN</span>
      <span className="text-red-500 font-bold text-sm">✦</span>
      <span className="tracking-[0.3em] font-black uppercase text-white/90">THE ENIGMATIC ELITE</span>
      <span className="text-red-500 font-bold text-sm">✦</span>
      <span className="tracking-[0.3em] font-black uppercase text-white/90">IN MYSTERY WE REIGN</span>
      <span className="text-red-500 font-bold text-sm">✦</span>
    </div>
  );

  return (
    <div
      className="relative overflow-hidden bg-black/95 border-y border-white/10 py-3 select-none z-20"
      style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
      }}
      aria-hidden
    >
      <div className="flex w-max animate-marquee gap-8 items-center text-[11px] sm:text-[13px] font-heading">
        {segment}
        {segment}
        {segment}
        {segment}
      </div>
    </div>
  );
}
