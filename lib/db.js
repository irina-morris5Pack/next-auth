import { MongoClient } from "mongodb";

export async function connectToDatabase() {
  const client = await MongoClient.connect(
    "mongodb+srv://root:root@cluster0.elxd4yb.mongodb.net/auth?retryWrites=true&w=majority"
  );
  return client;
}
