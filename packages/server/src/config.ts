// Put envs here that we need to confirm are present at startup. If an env is optional
// or has a sensible local default we just use process.env.THING at the site directly.

const REQUIRED_ENV_VARS = ["DATABASE_URL"] as const;

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

export const { DATABASE_URL } = envVars;
