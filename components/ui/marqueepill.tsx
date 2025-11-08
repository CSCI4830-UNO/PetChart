export default function MarqueePill({
  icon,
  text,
}: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/60 px-3 py-1.5 backdrop-blur">
      <span className="text-slate-700">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
