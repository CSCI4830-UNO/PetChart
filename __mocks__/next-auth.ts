/**
 * We also have to mock up the next-auth library
 * Authentication is complex and relies on external providers (Google, GitHub, etc.)
 * and cookies, which we don't want to deal with in unit tests (they are kinda hard to replicate)
 */

// Mock the getServerSession function.
// This is the main function used in API routes to check if a user is logged in.
// By mocking it as a Jest function, we can easily control its return value in tests:
// - Return null to simulate an unauthenticated user.
// - Return a session object (e.g., { user: { email: "..." } }) to simulate a logged-in user.
export const getServerSession = jest.fn();

// Default export mock (often used for the main NextAuth handler).
export default jest.fn();
