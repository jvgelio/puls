import { NextRequest, NextResponse } from "next/server";
import { getImportProgress } from "@/lib/services/import.service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  const progress = getImportProgress(userId);

  return NextResponse.json({ progress });
}
