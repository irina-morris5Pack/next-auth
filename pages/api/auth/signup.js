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

  // const client = await connectToDatabase();
  //
  // const db = client.db();

  const mysql = await connectToSqlDatabase();

  const existingUser = await mysql.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  console.log(existingUser);
  // const existingUser = await db.collection("users").findOne({ email: email });

  if (existingUser.length > 0) {
    res.status(422).json({ message: "A user with this email already exists!" });
    // await client.close();
    await mysql.end();
    return;
  }

  const hashedPassword = await hashPassword(password);
  const result = await db.collection("users").insertOne({
    email: email,
    password: hashedPassword,
  });

  res.status(201).json({ message: "Created user" });
}

export default handler;
