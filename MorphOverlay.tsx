import useOSStore from '../store/useOSStore';

export default function MorphOverlay() {
  const morph = useOSStore((s) => s.morph);

  if (!morph.active) return null;

  return (
    <div className="morph-overlay">
      <div className="morph-spinner" />
      <p className="text-[var(--text)] font-semibold mt-6 text-base">{morph.text}</p>
      <p className="text-[var(--text-muted)] text-sm mt-2">{morph.sub}</p>
    </div>
  );
}
