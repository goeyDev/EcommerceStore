// import { neon } from "@neondatabase/serverless";
// import { drizzle } from "drizzle-orm/neon-http"; // Use Neon-specific driver
// import * as schema from "./schema";

// const sql = neon(process.env.DATABASE_URL!);
// export const db = drizzle(sql, { schema });
// online

// local
// import { drizzle } from "drizzle-orm/node-postgres";
// import * as schema from "./schema";

// export const db = drizzle(process.env.DATABASE_URL!, { schema });
// local
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres"; // not neon-http
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

export const db = drizzle(pool, { schema });
