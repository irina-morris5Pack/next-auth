import { connectToDatabase } from "../../../lib/db";
import { hashPassword } from "../../../lib/auth";

import { connectToSqlDatabase } from "../../../lib/sqldb";

async function handler(req, res) {
  if (req.method !== "POST") {
    return;
  }

  const data = req.body;

  const { email, password } = data;

  if (
    !email ||
    !email.includes("@") ||
    !password ||
    password.trim().length < 7
  ) {
    res.status(422).json({
      message: "Invalid input - password should be at least 7 characters long.",
    });

    return;
  }

  const mysql = await connectToSqlDatabase();

  const existingUser = await mysql.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (existingUser.length > 0) {
    res.status(422).json({ message: "A user with this email already exists!" });
    // await client.close();
    await mysql.end();
    return;
  }

  const hashedPassword = await hashPassword(password);
  const result = await mysql.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hashedPassword]
  );

  res.status(201).json({ message: "Created user" });
}

export default handler;
