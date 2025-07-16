# AGENTS.md - Validation Guide for the Anchor Project

## Project Overview

This is a React Native/Expo project named "Anchor" that uses:
- **Framework**: Expo SDK ~53 with React Native 0.79
- **Navigation**: Expo Router with tab-based navigation
- **Package Manager**: pnpm (version 10.13.1)
- **Language**: TypeScript
- **Linting**: ESLint with expo-config

## How to Validate Changes

### 1. Linting Validation
**ALWAYS run linting and type checking before considering changes complete:**
```bash
pnpm lint
```
This uses the `expo lint` command configured in package.json and follows eslint-config-expo rules.

Ensure TypeScript compilation is successful:
```bash
pnpm check
```

### 2. Project Structure Validation
When making changes, ensure they follow the established patterns:

```
app/                    # App Router pages
├── (tabs)/            # Tab navigation group
├── _layout.tsx        # Root layout
components/            # Reusable components
├── ui/               # UI-specific components
constants/            # App constants (Colors, etc.)
hooks/                # Custom React hooks
assets/               # Static assets
```

### 3. Common Validation Checklist

**Before completing any change:**
- [ ] Run `pnpm lint` and fix all linting errors
- [ ] Run `pnpm check` to verify TypeScript compilation passes
