export default function MarqueePill({
  icon,
  text,
}: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-[#3a3b3c] bg-white/60 dark:bg-[#242526]/60 px-3 py-1.5 backdrop-blur">
      <span className="text-slate-700 dark:text-gray-300">{icon}</span>
      <span className="text-gray-900 dark:text-white">{text}</span>
    </div>
  );
}
