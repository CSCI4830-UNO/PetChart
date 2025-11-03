import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PetChart",
  description: "CSCI4830 Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
