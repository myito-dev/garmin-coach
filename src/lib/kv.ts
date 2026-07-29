import "server-only";
import { Redis } from "@upstash/redis";

let client: Redis | null = null;

/** Lazily-created Upstash Redis client, reading UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN. */
export function getRedis(): Redis {
  if (!client) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error(
        "Faltan UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN. Configura una base de datos Upstash Redis (gratis) y agrega esas variables a .env.local."
      );
    }
    client = Redis.fromEnv();
  }
  return client;
}
