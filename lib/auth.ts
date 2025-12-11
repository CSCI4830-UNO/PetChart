import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "./mongoose";
import User from "@/models/User";

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
    async signIn({ user }) {
      try {
        await dbConnect();
        
        // Check if user exists
        let existingUser = await User.findOne({ email: user.email });
        
        // Create user if doesn't exist
        if (!existingUser) {
          await User.create({
            email: user.email,
            name: user.name,
            notificationPreferences: {
              appointmentReminders: true,
              vaccinationReminders: true,
            },
          });
        }
        
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return true; // Allow sign in even if user creation fails
      }
    },

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
