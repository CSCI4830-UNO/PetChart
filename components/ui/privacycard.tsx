import { ShieldCheck } from "lucide-react";

export default function PrivacyCard() {
  return (
    <section id="privacy" className="mx-auto max-w-7xl px-6 py-20">
      <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-slate-50 to-white p-10">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-black p-2 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold">Privacy by design.</h3>
            <p className="mt-2 max-w-3xl text-slate-600">
              Your data is yours. We encrypt in transit and at rest, and you can export or delete at any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
