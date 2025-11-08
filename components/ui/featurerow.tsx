export default function FeatureRow({
  kicker,
  title,
  copy,
  bulletA,
  bulletB,
  imageLeft,
}: {
  kicker: string;
  title: string;
  copy: string;
  bulletA: string;
  bulletB: string;
  imageLeft?: boolean;
}) {
  return (
    <div className={`grid items-center gap-10 py-12 md:grid-cols-2 ${imageLeft ? "" : "md:[&>*:first-child]:order-2"}`}>
      <div className="aspect-[16/10] rounded-3xl bg-gradient-to-br from-slate-50 to-white ring-1 ring-black/5" />
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-slate-500">{kicker}</div>
        <h3 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-3 max-w-xl text-slate-600">{copy}</p>
        <ul className="mt-5 space-y-2 text-slate-700">
          <li>• {bulletA}</li>
          <li>• {bulletB}</li>
        </ul>
      </div>
    </div>
  );
}
