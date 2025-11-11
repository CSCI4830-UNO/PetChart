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
    signIn: "/signin", // 👈 custom page instead of the default HTML form
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub; // Optional: attach user ID
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl; // after login, go to homepage
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
