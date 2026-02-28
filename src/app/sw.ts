/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import {
  CacheFirst,
  NetworkFirst,
  NetworkOnly,
  StaleWhileRevalidate,
  Serwist,
} from "serwist";
import { ExpirationPlugin } from "serwist";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Auth routes — never cache (CSRF tokens, OAuth callbacks)
    {
      matcher: /^\/api\/auth\//,
      handler: new NetworkOnly(),
    },
    // Webhook routes — must always reach the server
    {
      matcher: /^\/api\/webhook\//,
      handler: new NetworkOnly(),
    },
    // Activities API — NetworkFirst for offline degraded state
    {
      matcher: /^\/api\/activities/,
      handler: new NetworkFirst({
        cacheName: "api-activities",
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          }),
        ],
      }),
    },
    // Other API routes — NetworkFirst with shorter TTL
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/api/") &&
        !url.pathname.startsWith("/api/auth/") &&
        !url.pathname.startsWith("/api/webhook/"),
      handler: new NetworkFirst({
        cacheName: "api-other",
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 30,
            maxAgeSeconds: 60 * 60, // 1 hour
          }),
        ],
      }),
    },
    // OpenStreetMap tiles (Leaflet maps) — tiles are immutable at z/x/y
    {
      matcher: /^https:\/\/[abc]\.tile\.openstreetmap\.org\//,
      handler: new CacheFirst({
        cacheName: "osm-tiles",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 500,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          }),
        ],
      }),
    },
    // Strava CDN (profile images)
    {
      matcher: /^https:\/\/dgalywyr863hv\.cloudfront\.net\//,
      handler: new CacheFirst({
        cacheName: "strava-cdn",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          }),
        ],
      }),
    },
    // Google Fonts
    {
      matcher: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//,
      handler: new StaleWhileRevalidate({
        cacheName: "google-fonts",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          }),
        ],
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline.html",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
