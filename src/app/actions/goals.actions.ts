"use server";

import { createGoal, deleteGoal } from "@/lib/services/goals.service";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createGoalAction(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const goalType = formData.get("goalType") as string;
    const sportType = formData.get("sportType") as string;
    const metric = formData.get("metric") as string;
    const targetValue = formData.get("targetValue") as string;
    const elevationGainStr = formData.get("elevationGain") as string;
    const deadlineStr = formData.get("deadline") as string;

    if (!name || !goalType || !sportType || !deadlineStr) {
        throw new Error("Missing required basic fields");
    }

    // For objective, we require metric and target value
    if (goalType === "objective" && (!metric || !targetValue)) {
        throw new Error("Objetivos requerem tipo de métrica e valor alvo.");
    }

    const deadline = new Date(deadlineStr);
    const elevationGain = elevationGainStr ? parseInt(elevationGainStr, 10) : null;

    await createGoal(session.user.id, {
        name,
        goalType,
        sportType,
        metric: metric || null,
        targetValue: targetValue || null,
        elevationGain,
        deadline,
    });

    revalidatePath("/dashboard");
}

export async function deleteGoalAction(goalId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    await deleteGoal(session.user.id, goalId);
    revalidatePath("/dashboard");
}
