export async function connectToSqlDatabase() {
  const mysql = require("serverless-mysql")({
    config: {
      host: process.env.ENDPOINT,
      database: process.env.DATABASE,
      user: process.env.USERNAME,
      password: process.env.PASSWORD,
    },
  });
  return mysql;
}
