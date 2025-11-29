# Anchor

## Notes

- The .node-version file is only here to support Expo:

> While Bun replaces Node.js for most use cases in your project, at this time, a Node.js LTS version is still required to be installed for the bun create expo and bun expo prebuild commands. These commands use npm pack to download project templates.

From here: https://docs.expo.dev/guides/using-bun.

- The version for `@sinclair/typebox` is pinned based on this recommendation: https://elysiajs.com/integrations/drizzle.html#installation.
- To generate the better-auth models, run `./scripts/generate-better-auth-models.sh`. Then create a new migration: `bun prisma migrate dev -n 'add_better_auth'`