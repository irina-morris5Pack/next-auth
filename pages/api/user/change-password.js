import { getSession } from "next-auth/react";
import { connectToDatabase } from "../../../lib/db";
import { hashPassword, verifyPassword } from "../../../lib/auth";
import { connectToSqlDatabase } from "../../../lib/sqldb";

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

  const mysql = await connectToSqlDatabase();
  const user = await mysql.query("SELECT * FROM users WHERE email = ?", [
    userEmail,
  ]);

  if (user.length === 0) {
    res.status(404).json({ message: "User not found" });
    await mysql.end();
    return;
  }

  const currentPassword = user[0].password;

  const passwordsAreEqual = await verifyPassword(oldPassword, currentPassword);

  if (!passwordsAreEqual) {
    res.status(403).json({ message: "Invalid password" });
    await mysql.end;
    return;
  }

  const hashedPassword = await hashPassword(newPassword);

  const result = await mysql.query(
    "UPDATE users SET password = ? WHERE email = ?",
    [hashedPassword, userEmail]
  );

  await mysql.end();
  res.status(200).json({ message: "Password updated" });
}
