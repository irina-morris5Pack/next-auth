import { getSession } from "next-auth/react";
import { connectToDatabase } from "../../../lib/db";
import { hashPassword, verifyPassword } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return;
  }

  const session = await getSession({ req: req });

  if (!session) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  const userEmail = session.user.email;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  const client = await connectToDatabase();
  const db = client.db();
  const user = await db
    .collection("users")
    .findOne({ email: session.user.email });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const currentPassword = user[0].password;

  const passwordsAreEqual = await verifyPassword(oldPassword, currentPassword);

  if (!passwordsAreEqual) {
    res.status(403).json({ message: "Invalid password" });
    return;
  }

  const hashedPassword = await hashPassword(newPassword);

  const result = await db.collection("users").insertOne({
    email: session.user.email,
    password: hashedPassword,
  });

  res.status(200).json({ message: "Password updated" });
}
