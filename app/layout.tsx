import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./api/auth/[...nextauth]/providers";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

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
        <ThemeProvider>
          <body>
            {children}
            <Toaster position="top-right" />
          </body>
        </ThemeProvider>
      </Providers>
    </html>
  );
}

