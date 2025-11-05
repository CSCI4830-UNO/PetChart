import { SignInBtn } from "@/components/signInBtn";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import { getServerSession } from "next-auth";

export default async function Home() {
  // Initialize MongoDB Connection with Mongoose
  await connectDB();

  // Get all user documents
  const users = await User.find({})

  // Get Google OAuth Session Info
  const session = await getServerSession();

  return (
    <div className="text-center">
      <h1 className="mb-4 text-4xl font-extrabold">Pet Chart</h1>
      <h2 className="mb-4 text-xl font-bold">User signed in: {session?.user?.name}</h2>
      <SignInBtn />
      <h2>Users Found:</h2>
      <ul>
        {users.map((user) => (
          <li key={user._id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
