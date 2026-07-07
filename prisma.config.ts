import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// configure prisma CLI to use the direct url for database migrations and pushes
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
