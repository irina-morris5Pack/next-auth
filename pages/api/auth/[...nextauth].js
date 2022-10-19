import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToSqlDatabase } from "../../../lib/sqldb";
import { verifyPassword } from "../../../lib/auth";

export default NextAuth({
  session: {
    jwt: true,
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const mysql = await connectToSqlDatabase();
        const user = await mysql.query("SELECT * FROM users WHERE email = ?", [
          credentials.email,
        ]);
        const userPassword = await user[0].password;
        const userEmail = await user[0].email;
        if (user.length === 0) {
          await mysql.end();
          throw new Error("No user found");
        }
        const isValid = await verifyPassword(
          credentials.password,
          userPassword
        );

        if (!isValid) {
          await mysql.end();
          throw new Error("Could not log in user");
        }
        return { email: userEmail };
        await mysql.end();
      },
    }),
  ],
});
