// Put envs here that we need to confirm are present at startup. If an env is optional
// or has a sensible local default we just use process.env.THING at the site directly.

const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "PORT",
  /*
  "APPLE_CLIENT_ID",
  "APPLE_CLIENT_SECRET",
  "FACEBOOK_CLIENT_ID",
  "FACEBOOK_CLIENT_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "MICROSOFT_CLIENT_ID",
  "MICROSOFT_CLIENT_SECRET",
  */
] as const;

// Build env vars object and check all are present
const envVars = Object.fromEntries(
  REQUIRED_ENV_VARS.map((key) => {
    const value = process.env[key];
    if (!value) {
      throw new Error(`${key} is not set`);
    }
    return [key, value];
  }),
) as { [K in (typeof REQUIRED_ENV_VARS)[number]]: string };

export const PORT = Number.parseInt(envVars.PORT, 10);
if (isNaN(PORT)) {
  throw new Error("PORT is not a number");
}

export const {
  DATABASE_URL,
  /*
  APPLE_CLIENT_ID,
  APPLE_CLIENT_SECRET,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET,
  */
} = envVars;
