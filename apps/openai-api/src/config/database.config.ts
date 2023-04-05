import { registerAs } from "@nestjs/config";

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT || 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  db: process.env.DATABASE_DB
}));