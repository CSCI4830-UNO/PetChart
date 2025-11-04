import connectDB from "@/lib/mongoose";
import User from "@/models/User";

export default async function Home() {
  // Initialize MongoDB Connection with Mongoose
  await connectDB();

  // Get all user documents
  const users = await User.find({})

  return (
    <div className="text-center">
      <h1>Pet Chart</h1>
      <br />
      <h2>Users Found:</h2>
      <ul>
        {users.map((user) => (
          <li key={user._id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
