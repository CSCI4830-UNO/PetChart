import Image from "next/image";

// props for feature row component
export default function FeatureRow({
  image,
  kicker,
  title,
  subhead,
  bulletA,
  bulletB,
  imageLeft,
}: {
  image?: string 
  kicker: string;
  title: string;
  subhead: string;
  bulletA: string;
  bulletB: string;
  imageLeft?: boolean;
}) {

  // the component
  return (
    <div className={`grid items-center gap-10 py-12 md:grid-cols-2 ${imageLeft ? "" : "md:[&>*:first-child]:order-2"}`}>
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden ring-1 ring-black/5">
    {image ? (
      <Image
        src={image}
        alt={title}
        fill
        className="object-contain object-center"
        priority
      />
    ) : null}
</div>

      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-slate-500">{kicker}</div>
        <h3 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-3 max-w-xl text-slate-600">{subhead}</p>
        <ul className="mt-5 space-y-2 text-slate-700">
          <li>• {bulletA}</li>
          <li>• {bulletB}</li>
        </ul>
      </div>
    </div>
  );
}
