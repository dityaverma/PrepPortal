import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

// run the diagnostic checks for database and environment variables
async function runDiagnostics() {
  console.log("=== prepportal backend diagnostics ===");

  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  const jwtSecret = process.env.JWT_SECRET;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;

  console.log("checking environment variables:");
  console.log(`- DATABASE_URL is ${dbUrl ? "configured" : "missing"}`);
  console.log(`- DIRECT_URL is ${directUrl ? "configured" : "missing"}`);
  console.log(`- JWT_SECRET is ${jwtSecret ? "configured" : "missing"}`);
  console.log(`- NEXTAUTH_SECRET is ${nextAuthSecret ? "configured" : "missing"}`);

  if (!dbUrl) {
    console.error("error: DATABASE_URL is missing");
    process.exit(1);
  }

  console.log("\ntesting database connection pool:");
  try {
    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    
    // query users to verify database and table structure
    const userCount = await prisma.user.count();
    console.log(`- success: connection established and user count is ${userCount}`);
    await prisma.$disconnect();
    await pool.end();
  } catch (err: any) {
    console.error(`- failure: connection failed: ${err.message}`);
  }

  if (directUrl) {
    console.log("\ntesting direct connection (used for migrations):");
    try {
      const pool = new Pool({ connectionString: directUrl });
      const res = await pool.query("SELECT NOW()");
      console.log(`- success: direct database connection established: ${res.rows[0].now}`);
      await pool.end();
    } catch (err: any) {
      console.error(`- failure: direct connection failed: ${err.message}`);
    }
  }

  console.log("\n=== diagnostics completed ===");
}

runDiagnostics();
