import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_qknetbyyjbscadmtjwou",
  dirs: ["./src/trigger"],
  maxDuration: 300, // 5 minutes
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 5000,
      maxTimeoutInMs: 30_000,
      factor: 2,
    },
  },
});
