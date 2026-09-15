export default function EmptyWantedSlot() {
  return (
    <article className="flex h-full min-h-64 flex-col items-center justify-center gap-3 border border-amber-500/40 border-dashed bg-black/50 px-4 py-6 text-center">
      <p className="font-semibold text-amber-200/90 text-xs tracking-[0.35em]">
        WANTED
      </p>
      <p className="max-w-[12rem] font-serif text-lg text-white/85">
        WANTED — this poster is yours
      </p>
    </article>
  );
}
