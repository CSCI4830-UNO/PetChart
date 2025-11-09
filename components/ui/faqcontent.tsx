"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// TODO: maybe split into smaller FAQItem component later?
const questions = [
  {
    q: "What is PetChart?",
    a: (
      <>PetChart helps you keep track of your pet's health—vaccines, meds, appointments, notes, all in one place.</>
    ),
  },
  {
    q: "How do I add a pet?",
    a: (
      <>Just sign in, go to your dashboard, and hit <strong>Add Pet</strong>. Fill out some details, upload a photo, done.</>
    ),
  },
  {
    q: "Can I track vaccinations and get reminders?",
    a: (
      <>Yep. You'll see <em>due</em>, <em>upcoming</em>, and <em>overdue</em> shots, and you can set reminders for wellness visits.</>
    ),
  },
  {
    q: "How do medications work?",
    a: (
      <>Add a med with the dosage and how often it's given. Then mark them off when taken. Helps you stay on top of things.</>
    ),
  },
  {
    q: "Is my data private?",
    a: (
      <>
        Yes, everything's encrypted in transit and at rest. You can also export or delete your stuff anytime.
      </>
    ),
  },
  {
    q: "Can I share records with my vet or daycare?",
    a: (
      <>You can download or export vaccine logs and visit notes. We'll add easier sharing tools soon.</>
    ),
  },
  {
    q: "How much does PetChart cost?",
    a: (
      <>Right now it's free while we're in early access. We'll share pricing later once it's ready.</>
    ),
  },
  {
    q: "How do I contact support?",
    a: (
      <>
        Email us! {" "}
        <a href="mailto:support@petchart.app" className="underline underline-offset-2">support@petchart.app</a>
      </>
    ),
  },
];

export default function FaqContent() {
  const pageAnim = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const itemFade = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const containerFade = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  };

  return (
    <motion.main
      initial="hidden"
      animate="show"
      variants={pageAnim}
      className="min-h-screen bg-gradient-to-b from-white to-blue-50 text-slate-900"
    >
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">FAQs</h1>
        <p className="mt-3 text-slate-600">Things people usually ask about PetChart.</p>
      </div>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <motion.div
          variants={containerFade}
          initial="hidden"
          animate="show"
          className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
        >
          {questions.map((faq, i) => (
            <motion.div key={i} variants={itemFade}>
              <details
                className={`group mx-2 rounded-2xl px-4 md:px-6 border-b last:border-b-0 border-slate-200/70 ${
                  i === 0 ? "pt-5 md:pt-6" : "pt-3"
                } ${i === questions.length - 1 ? "pb-5 md:pb-6" : "pb-3"} transition-colors group-open:bg-blue-50/50 group-open:ring-1 group-open:ring-blue-200/60`}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <h2 className="text-[17px] font-medium tracking-tight text-slate-900">{faq.q}</h2>
                  <svg
                    className="w-5 h-5 text-slate-500 transition-transform duration-300 group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="mt-3 text-slate-700 leading-relaxed opacity-0 group-open:opacity-100 transition-opacity duration-300">
                  {faq.a}
                </div>
              </details>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={itemFade}
          initial="hidden"
          animate="show"
          className="mt-10 text-center"
        >
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
