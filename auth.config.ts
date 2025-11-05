import type { NextAuthConfig } from "next-auth";

// Notice this is only an object, not a full Auth.js instance
export const authConfig = {
  providers: [],
} satisfies NextAuthConfig;