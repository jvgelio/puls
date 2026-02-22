import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { users, oauthTokens, User, NewUser, OAuthToken, NewOAuthToken } from "../db/schema";

export async function getUserByStravaId(stravaId: number) {
    return await db.query.users.findFirst({
        where: eq(users.stravaId, stravaId),
    });
}

export async function getUserById(userId: string) {
    return await db.query.users.findFirst({
        where: eq(users.id, userId),
    });
}

export async function createUser(data: NewUser) {
    const [newUser] = await db.insert(users).values(data).returning();
    return newUser;
}

export async function updateUser(userId: string, data: Partial<NewUser>) {
    const [updated] = await db
        .update(users)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
    return updated;
}

export async function getOAuthTokenByUserId(userId: string) {
    return await db.query.oauthTokens.findFirst({
        where: eq(oauthTokens.userId, userId),
    });
}

export async function upsertOAuthToken(userId: string, data: Omit<NewOAuthToken, "userId">) {
    const existingToken = await getOAuthTokenByUserId(userId);

    if (existingToken) {
        const [updated] = await db
            .update(oauthTokens)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(oauthTokens.id, existingToken.id))
            .returning();
        return updated;
    } else {
        const [inserted] = await db
            .insert(oauthTokens)
            .values({ ...data, userId })
            .returning();
        return inserted;
    }
}

export async function isTelegramConnected(userId: string) {
    const [userRow] = await db
        .select({ telegramChatId: users.telegramChatId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
    return userRow?.telegramChatId != null;
}
