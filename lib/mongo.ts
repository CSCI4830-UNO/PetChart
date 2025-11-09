import { MongoClient, Db, GridFSBucket } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "app";

// Reuse across hot reloads in dev
let _client: MongoClient | null = null;
let _db: Db | null = null;
let _bucket: GridFSBucket | null = null;

export async function getDb() {
  if (_db && _bucket && _client) {
    return { db: _db, bucket: _bucket, client: _client };
  }

  if (!_client) {
    _client = new MongoClient(uri);
    await _client.connect();
  }

  _db = _client.db(dbName);
  _bucket = new GridFSBucket(_db, { bucketName: "uploads" });

  return { db: _db, bucket: _bucket, client: _client };
}
