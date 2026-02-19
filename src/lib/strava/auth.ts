import { StravaRefreshResponse, StravaTokenResponse } from "./types";

const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";

export async function exchangeCodeForTokens(
  code: string
): Promise<StravaTokenResponse> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  return response.json();
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<StravaRefreshResponse> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh access token: ${error}`);
  }

  return response.json();
}

export function getStravaAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    approval_prompt: "force",
    scope: "read,activity:read_all,profile:read_all",
  });

  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}

export function isTokenExpired(expiresAt: Date): boolean {
  // Consider token expired 5 minutes before actual expiration
  const bufferMs = 5 * 60 * 1000;
  return new Date().getTime() > expiresAt.getTime() - bufferMs;
}
