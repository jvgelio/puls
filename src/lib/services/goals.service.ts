import { db } from "@/lib/db/client";
import { goals, activities, type Goal } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { calculatePaceSeconds } from "@/lib/utils/formatters";

export interface GoalProgress {
    goal: Goal;
}

export async function getUserGoals(userId: string): Promise<GoalProgress[]> {
    const userGoals = await db.query.goals.findMany({
        where: eq(goals.userId, userId),
        orderBy: [desc(goals.deadline)],
    });

    if (userGoals.length === 0) return [];

    return userGoals.map((goal) => {
        return {
            goal,
        };
    });
}

export async function createGoal(
    userId: string,
    data: {
        name: string;
        goalType: string;
        sportType: string;
        metric?: string | null;
        targetValue?: string | null;
        elevationGain?: number | null;
        deadline: Date;
    }
) {
    const [newGoal] = await db
        .insert(goals)
        .values({
            userId,
            name: data.name,
            goalType: data.goalType,
            sportType: data.sportType,
            metric: data.metric || null,
            targetValue: data.targetValue || null,
            elevationGain: data.elevationGain || null,
            deadline: data.deadline,
        })
        .returning();

    return newGoal;
}

export async function deleteGoal(userId: string, goalId: string) {
    await db
        .delete(goals)
        .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));
}
