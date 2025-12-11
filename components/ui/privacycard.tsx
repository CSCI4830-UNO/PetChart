import Image from "next/image";

export default function PrivacyCard() {
  return (
    <section id="privacy" className="mx-auto max-w-7xl px-6 py-20">
      <div className="rounded-3xl border border-black/10 dark:border-[#3a3b3c] bg-gradient-to-br from-slate-50 dark:from-[#242526] to-white dark:to-[#18191a] p-10">
        <div className="flex items-start gap-4">
          <div className="rounded-xl p-2 text-white">
            <Image src="/icons/shield.svg" alt="shield" width={50} height={16} />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Privacy by design.</h3>
            <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-400">
              Your data is yours. We encrypt in transit and at rest, and you can export or delete at any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
