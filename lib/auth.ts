import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// TODO: Consider adding more providers later
export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "", // fallback added just in case
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  // Custom sign-in page to make UX a bit smoother
  pages: {
    signIn: "/signin",
  },

  session: {
    strategy: "jwt", // using JWTs for sessions, less database hassle
  },

  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        // Tying user session to token's subject
        session.user.id = token.sub; 
      }
      return session; 
    },

    // Always bring user back to base
    async redirect({ url, baseUrl }) {
      // console.log("Redirecting to base URL:", baseUrl); // debugging
      return baseUrl;
    },
  },

  // secret for JWT verification & encryption
  secret: process.env.NEXTAUTH_SECRET ?? "", // fallback in case it's missing
} satisfies NextAuthConfig;
