import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: "/signin", // ✅ your custom UI
  },

  callbacks: {
    async session({ session, token }) {
      // Optionally attach token info to session
      if (token && session.user) {
        session.user.id = token.sub; // Google ID
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Always go home after login
      return baseUrl;
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
