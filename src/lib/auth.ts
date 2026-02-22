import NextAuth from "next-auth";
import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { refreshAccessToken } from "./strava/auth";
import { getUserByStravaId, createUser, updateUser, upsertOAuthToken } from "./services/user.service";

// Extended types
interface ExtendedJWT extends JWT {
  userId?: string;
  stravaId?: number;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  error?: string;
}

interface ExtendedSession extends Session {
  user: Session["user"] & {
    id: string;
    stravaId: number;
  };
  accessToken: string;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      stravaId: number;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    accessToken: string;
  }
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  debug: true,
  providers: [
    {
      id: "strava",
      name: "Strava",
      type: "oauth",


      clientId: process.env.STRAVA_CLIENT_ID,
      clientSecret: process.env.STRAVA_CLIENT_SECRET,
      checks: ["state"],
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
      authorization: {
        url: "https://www.strava.com/oauth/authorize",
        params: {
          scope: "read,activity:read_all,profile:read_all",
          approval_prompt: "force",
          response_type: "code",
        },
      },
      token: "https://www.strava.com/oauth/token",
      userinfo: "https://www.strava.com/api/v3/athlete",
      profile(profile) {
        return {
          id: String(profile.id),
          name: `${profile.firstname} ${profile.lastname}`,
          email: profile.email || null,
          image: profile.profile,
        };
      },
    },
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || account.provider !== "strava") return false;

      const stravaId = profile?.id ? Number(profile.id) : (user.id ? Number(user.id) : null);
      if (!stravaId) {
        console.error("[PULS-AUTH] No Strava ID found in profile or user object");
        return false;
      }

      const expiresAt = new Date((account.expires_at ?? 0) * 1000);
      console.log("[PULS-AUTH] Processing sign in");

      // Find or create user
      let dbUser = await getUserByStravaId(stravaId);

      if (!dbUser) {
        console.log("[PULS-AUTH] Creating NEW user");
        dbUser = await createUser({
          stravaId,
          name: user.name,
          email: user.email,
          profilePicture: user.image,
        });
      } else {
        console.log("[PULS-AUTH] Found EXISTING user. Updating info...");
        await updateUser(dbUser.id, {
          name: user.name,
          email: user.email,
          profilePicture: user.image,
        });
      }

      // Upsert OAuth tokens
      console.log("[PULS-AUTH] Upserting OAuth tokens");
      await upsertOAuthToken(dbUser.id, {
        accessToken: account.access_token!,
        refreshToken: account.refresh_token!,
        expiresAt,
        scope: account.scope,
      });

      return true;
    },

    async jwt({ token, account, user, profile }): Promise<ExtendedJWT> {
      const extToken = token as ExtendedJWT;

      // Initial sign in
      if (account && user) {
        const stravaId = profile?.id ? Number(profile.id) : (user.id ? Number(user.id) : null);

        console.log("[PULS-AUTH] JWT Callback");

        if (stravaId) {
          const dbUser = await getUserByStravaId(stravaId);

          if (!dbUser) {
            console.error("[PULS-AUTH] CRITICAL: User not found in JWT callback");
            // checking for race condition - maybe wait a bit? 
            // But generally signIn should have finished.
            throw new Error("User not found in database during JWT creation");
          }

          return {
            ...extToken,
            userId: dbUser.id,
            stravaId,
            accessToken: account.access_token!,
            refreshToken: account.refresh_token!,
            expiresAt: (account.expires_at ?? 0) * 1000,
          };
        }
      }

      // Return previous token if not expired
      if (extToken.expiresAt && Date.now() < extToken.expiresAt - 5 * 60 * 1000) {
        return extToken;
      }

      // Refresh token
      if (extToken.refreshToken && extToken.stravaId) {
        try {
          const refreshed = await refreshAccessToken(extToken.refreshToken);

          // Update tokens in database
          const dbUser = await getUserByStravaId(extToken.stravaId);

          if (dbUser) {
            await upsertOAuthToken(dbUser.id, {
              accessToken: refreshed.access_token,
              refreshToken: refreshed.refresh_token,
              expiresAt: new Date(refreshed.expires_at * 1000),
            });
          }

          return {
            ...extToken,
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token,
            expiresAt: refreshed.expires_at * 1000,
          };
        } catch (error) {
          console.error("Error refreshing access token:", error);
          return { ...extToken, error: "RefreshAccessTokenError" };
        }
      }

      return extToken;
    },

    async session({ session, token }): Promise<ExtendedSession> {
      const extToken = token as ExtendedJWT;

      return {
        ...session,
        user: {
          ...session.user,
          id: extToken.userId || "",
          stravaId: extToken.stravaId || 0,
        },
        accessToken: extToken.accessToken || "",
      };
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
