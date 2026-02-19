import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users, oauthTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { processActivity } from "@/lib/services/activity.service";
import type { StravaWebhookEvent } from "@/lib/strava/types";
import { safeCompare } from "@/lib/security";

// Webhook validation (GET request from Strava during subscription setup)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");
  const challenge = searchParams.get("hub.challenge");
  const verifyToken = searchParams.get("hub.verify_token");
  const expectedToken = process.env.STRAVA_VERIFY_TOKEN;

  if (
    mode === "subscribe" &&
    verifyToken &&
    expectedToken &&
    safeCompare(verifyToken, expectedToken)
  ) {
    console.log("Webhook verified successfully");
    return NextResponse.json({ "hub.challenge": challenge });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// Webhook event handler (POST request from Strava when activities are created/updated)
export async function POST(request: NextRequest) {
  try {
    const event: StravaWebhookEvent = await request.json();

    console.log("Received Strava webhook event:", {
      object_type: event.object_type,
      aspect_type: event.aspect_type,
    });

    // Only process activity events
    if (event.object_type !== "activity") {
      return new NextResponse("OK", { status: 200 });
    }

    // Handle delete events
    if (event.aspect_type === "delete") {
      // TODO: Handle activity deletion if needed
      return new NextResponse("OK", { status: 200 });
    }

    // Find user by Strava ID
    const user = await db.query.users.findFirst({
      where: eq(users.stravaId, event.owner_id),
    });

    if (!user) {
      console.log("User not found for Strava ID");
      return new NextResponse("OK", { status: 200 });
    }

    // Get user's OAuth tokens
    const token = await db.query.oauthTokens.findFirst({
      where: eq(oauthTokens.userId, user.id),
    });

    if (!token) {
      console.log("Token not found for user");
      return new NextResponse("OK", { status: 200 });
    }

    // Process the activity in background
    // Respond immediately to Strava (must respond within 2 seconds)
    processActivity(event.object_id, user.id, token.accessToken).catch(
      (error) => {
        console.error("Error processing activity:", error);
      }
    );

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error handling webhook:", error);
    // Still return 200 to prevent Strava from retrying
    return new NextResponse("OK", { status: 200 });
  }
}
