"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const faqs = [
  { q: "What is PetChart?", a: <>PetChart is a simple, elegant way to track your pets’ health—vaccinations, medications, appointments, labs, and notes—all in one place, across devices.</> },
  { q: "How do I add a pet?", a: <>After signing in, go to your dashboard and click <strong>Add Pet</strong>. You can include a photo, species, breed, sex, birthdate, and any initial health records.</> },
  { q: "Can I track vaccinations and get reminders?", a: <>Yes. Add vaccines to a pet’s record and PetChart will show you <em>due</em>, <em>upcoming</em>, and <em>overdue</em> statuses. You can also set reminders for boosters or annual wellness visits.</> },
  { q: "How do medications work?", a: <>Create a medication with dose and schedule (e.g., monthly heartworm pill). Mark doses as taken and see what’s due soon on your dashboard.</> },
  { q: "Is my data private?", a: <>We take privacy seriously. Data is encrypted in transit and at rest. You can export or delete your data at any time. See our <Link href="/privacy" className="underline underline-offset-2">Privacy</Link> page for details.</> },
  { q: "Can I share records with my vet or daycare?", a: <>Yes—download or export vaccine history and visit summaries to share with your clinic or daycare. (More sharing features are coming soon.)</> },
  { q: "How much does PetChart cost?", a: <>We’re in early access. Core features are free during this phase. Pricing will be announced prior to general availability.</> },
  { q: "Where can I find documentation?", a: <>Check out our <Link href="/docs" className="underline underline-offset-2">Docs</Link> page for getting started and updates. More guides are on the way.</> },
  { q: "How do I contact support?", a: <>Reach out via the <Link href="/contact" className="underline underline-offset-2">Contact</Link> page or email us at <a href="mailto:support@petchart.app" className="underline underline-offset-2">support@petchart.app</a>.</> },
];

export default function FaqContent() {
  // page fade
  const page = {
    hidden: { opacity: 0, y: 8 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // header + footer fade-up
  const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.05 } },
  };

  // list stagger + item fade
  const list = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.main
      variants={page}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-gradient-to-b from-white to-blue-50 text-slate-900"
    >
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="mx-auto max-w-7xl px-6 pt-16 pb-8">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight">Frequently Asked Questions</h1>
          <p className="mt-3 text-slate-600">
            Quick answers about accounts, pets, records, privacy, and more.
          </p>
        </div>
      </motion.div>

      {/* FAQ List */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <motion.div
          variants={list}
          initial="hidden"
          animate="show"
          className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
        >
          {faqs.map((f, idx) => (
            <motion.div key={idx} variants={item}>
              <details
                className={`group rounded-2xl mx-2 px-4 md:px-6 ${
                  idx === 0 ? "pt-5 md:pt-6" : "pt-3"
                } ${
                  idx === faqs.length - 1 ? "pb-5 md:pb-6" : "pb-3"
                } border-b last:border-b-0 border-slate-200/70
                   transition-colors duration-300
                   group-open:bg-blue-50/50 group-open:ring-1 group-open:ring-blue-200/60`}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <h2 className="text-[17px] font-medium tracking-tight text-slate-900">
                    {f.q}
                  </h2>
                  {/* rotating chevron */}
                  <svg
                    className="w-5 h-5 text-slate-500 transition-transform duration-300 ease-in-out group-open:rotate-180"
                    fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                  </svg>
                </summary>

                <div className="mt-3 text-slate-700 leading-relaxed opacity-0 group-open:opacity-100 transition-opacity duration-300">
                  {f.a}
                </div>
              </details>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA footer */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </motion.div>
      </section>
    </motion.main>
  );
}
