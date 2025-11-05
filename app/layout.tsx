import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./api/auth/[...nextauth]/providers";

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
      <Providers>
        <body>{children}</body>
      </Providers>
    </html>
  );
}
