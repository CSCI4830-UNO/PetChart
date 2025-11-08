import type { Metadata } from "next";
import FaqContent from "@/components/ui/faqcontent";

export const metadata: Metadata = {
  title: "FAQ – PetChart",
  description:
    "Answers to common questions about PetChart: accounts, data privacy, pets, and more.",
};

export default function FAQPage() {
  return <FaqContent />;
}
