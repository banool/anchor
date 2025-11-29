import { cors } from "@elysiajs/cors";
import { Elysia, t } from "elysia";
import { initializeClient } from "./database/client";
import { UserPlain } from "./generated/prismabox/User";
import { PORT } from "./config";
import { betterAuthElysia } from "./auth";

await initializeClient();

// todo how to get json style
// This creates a separate global logger. We make the HTTP logger use this too
// by setting the `useGlobal` option.
// initializeLogger({ format: "[{timestamp}] {level}: {message}" });

const app = new Elysia()
  .use(
    cors({
      origin: ["http://localhost:3006"],
      credentials: true,
    }),
  )
  // note that onError overrides the logger, see https://github.com/0xrasla/logify/issues/4
  // https://github.com/0xrasla/logify/issues/9
  // .use(logger({ useGlobal: true }))
  .onError(({ error }) => {
    console.error(`Unexpected error: ${formatError(error)}`);
  })
  .use(betterAuthElysia)
  .get("/", () => "Hello Elysia")
  .get(
    "/user",
    ({ user }) => {
      return {
        ...user,
        // Seems like the types don't quite match up here, we have to handle image.
        image: user.image ?? null,
      };
    },
    {
      auth: true,
      response: {
        200: UserPlain,
        404: t.String(),
        500: t.String(),
      },
    },
  )
  .listen(PORT);

console.log(`Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);

function formatError(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error);
  }

  // Extract additional properties that aren't part of the standard Error interface.
  // This is useful for Prisma errors which have properties like `code`, `meta`, etc.
  const extras: string[] = [];
  for (const key of Object.keys(error)) {
    if (!["name", "message", "stack", "cause"].includes(key)) {
      const value = (error as unknown as Record<string, unknown>)[key];
      extras.push(`${key}: ${JSON.stringify(value)}`);
    }
  }
  const extrasStr = extras.length > 0 ? `\n${extras.join("\n")}` : "";

  const causeStr =
    error.cause === undefined
      ? ""
      : error.cause instanceof Error
        ? `\nCaused by error: ${formatError(error.cause)}`
        : `\nCaused by: ${String(error.cause)}`;

  return `${error.name}: ${error.message}${extrasStr}\n${error.stack}${causeStr}`;
}

export type App = typeof app;
