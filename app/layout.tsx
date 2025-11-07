import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./api/auth/[...nextauth]/providers";
import { Toaster } from "sonner";

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
        <body>
          {children}
          <Toaster position="top-right" />
        </body>
      </Providers>
    </html>
  );
}
