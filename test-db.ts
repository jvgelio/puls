import { db } from "./src/lib/db/client";
import { users } from "./src/lib/db/schema";
import { eq } from "drizzle-orm";
async function main() {
    try {
        const res = await db.query.users.findFirst({
            where: eq(users.stravaId, 46305273)
        });
        console.log("RES:", res);
    } catch (e) {
        console.error("ERROR:", e);
    }
}
main();
