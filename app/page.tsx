import { dbConnectionStatus } from "@/db/connection-status";
import clientPromise from "@/lib/mongodb";

export default async function Home() {
  const result = await dbConnectionStatus();
  const client = await clientPromise;
  const mongo = client.db('sample_mflix')
  const users = await mongo.collection('users').find({}).limit(10).toArray();
  return (
    <div className="text-center">
      <h1>Pet Chart</h1>
      <p>MongoDB Connection Status: {result}</p>
      <br />
      <h2>First 10 Users Found:</h2>
      <ul>
        {users.map((user) => (
          <li key={user._id.toString()}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
}
