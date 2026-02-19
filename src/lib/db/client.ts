import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// For query purposes
const queryClient = postgres(connectionString, {
    ssl: 'require',
    max: 1 // Limit connections per client to avoid max connection limits
});
export const db = drizzle(queryClient, { schema });

// Export schema for use in other files
export { schema };
