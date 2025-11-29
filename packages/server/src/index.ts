import { Elysia, t } from "elysia";
import { prisma, initializeClient } from "./database/client";
import { UserPlain } from "./generated/prismabox/User";
import { User } from "./generated/prisma/client";

await initializeClient();

// todo how to get json style
// This creates a separate global logger. We make the HTTP logger use this too
// by setting the `useGlobal` option.
// initializeLogger({ format: "[{timestamp}] {level}: {message}" });

const app = new Elysia()
  // note that onError overrides the logger, see https://github.com/0xrasla/logify/issues/4
  // https://github.com/0xrasla/logify/issues/9
  // .use(logger({ useGlobal: true }))
  .onError(({ error }) => {
    console.error(`Unexpected error: ${formatError(error)}`);
  })
  .get("/", () => "Hello Elysia")
  .get(
    "/user/:id",
    async ({ params: { id }, status }) => {
      console.log("Getting user", id);
      let user: User | null = null;
      try {
        user = await prisma.user.findUnique({
          where: { id },
        });
      } catch (error) {
        // When NODE_ENV is false I would hope to see the cause in the error response
        // as well (just the first level of cause), but we don't. It's okay though, we
        // have the error logging from onError.
        throw new Error("Failed to get user", { cause: error });
      }

      if (!user) throw status(404, "User not found");

      return user;
    },
    {
      response: {
        200: UserPlain,
        404: t.String(),
        500: t.String(),
      },
    },
  )
  .listen(3000);

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
