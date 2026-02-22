import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Singleton pattern for DB connection to prevent max connection limits in dev
const createPostgresClient = () => {
    return postgres(connectionString, {
        ssl: 'require',
        max: process.env.NODE_ENV === "development" ? 1 : 10
    });
};

declare global {
    var _postgresClient: postgres.Sql<any> | undefined;
}

const queryClient = global._postgresClient || createPostgresClient();

if (process.env.NODE_ENV !== "production") {
    global._postgresClient = queryClient;
}

export const db = drizzle(queryClient, { schema });

// Export schema for use in other files
export { schema };
