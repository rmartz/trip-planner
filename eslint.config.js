import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import boundaries from "eslint-plugin-boundaries";
import reactHooks from "eslint-plugin-react-hooks";
import storybook from "eslint-plugin-storybook";

// Allowed dependency direction for the layering policy below (a layer may import
// the listed lower layers). Keeps the seven near-identical policies readable.
const canImport = (...types) => ({
  to: { element: { types: { anyOf: types } } },
});

export default tseslint.config(
  {
    ignores: [
      "**/.claude/**",
      "**/dist/**",
      "**/node_modules/**",
      "**/.next/**",
      "**/next-env.d.ts",
      ".storybook/**",
      "storybook-static/**",
      "vitest.config.mts",
      "src/components/ui/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}", "*.{ts,tsx}"],
    extends: [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["src/**/*.{ts,tsx}", "*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      // File-length hard cap (replaces the bespoke check-file-length.sh / File
      // Length CI job). Source files: 400. Test files get 600 via a later
      // last-match-wins override. Counts every line so the cap matches wc -l.
      "max-lines": [
        "error",
        { max: 400, skipBlankLines: false, skipComments: false },
      ],
      // Enforce alphabetical ordering of named members within each import statement.
      // ignoreDeclarationSort: true — import statement order is not enforced (grouping
      // by framework/internal/relative carries semantic value and is left to the author).
      // ignoreMemberSort: false — named specifiers must be alphabetical within a statement.
      // Aliased specifiers sort by their local binding name (e.g. `signOut as firebaseSignOut`
      // sorts under "f", not "s").
      "sort-imports": [
        "error",
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          allowSeparatedGroups: false,
        },
      ],
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  // Architectural layering (eslint-plugin-boundaries). Enforce the dependency
  // direction between the current top-level src/ layers: lower layers stay
  // decoupled from UI and routes, so `lib`/`services` never import components or
  // pages and nothing imports route files under `app/`. Elements are the
  // type-siloed dirs today; as the codebase migrates to domain verticals (#454)
  // these element definitions move with it.
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "import/resolver": {
        typescript: { alwaysTryTypes: true, project: "./tsconfig.json" },
      },
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**" },
        { type: "components", pattern: "src/components/**" },
        { type: "hooks", pattern: "src/hooks/**" },
        { type: "services", pattern: "src/services/**" },
        { type: "server", pattern: "src/server/**" },
        { type: "store", pattern: "src/store/**" },
        { type: "lib", pattern: "src/lib/**" },
      ],
    },
    rules: {
      // Files outside the element map (src/proxy.ts, src/test-setup, root configs)
      // are intentionally unclassified — do not flag them.
      "boundaries/no-unknown": "off",
      "boundaries/no-unknown-files": "off",
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            {
              from: { element: { types: "app" } },
              allow: canImport(
                "app",
                "components",
                "hooks",
                "services",
                "server",
                "store",
                "lib",
              ),
            },
            {
              from: { element: { types: "components" } },
              allow: canImport(
                "components",
                "hooks",
                "services",
                "store",
                "lib",
              ),
            },
            {
              from: { element: { types: "hooks" } },
              allow: canImport("hooks", "services", "store", "lib"),
            },
            {
              from: { element: { types: "services" } },
              allow: canImport("services", "server", "lib"),
            },
            {
              from: { element: { types: "server" } },
              allow: canImport("server", "lib"),
            },
            {
              from: { element: { types: "store" } },
              allow: canImport("store", "services", "lib"),
            },
            {
              from: { element: { types: "lib" } },
              allow: canImport("lib"),
            },
          ],
        },
      ],
    },
  },
  // Root-level framework config files (Sentry, Next.js) use SDK types that don't
  // resolve cleanly under strictTypeChecked — relax unsafe-call/member rules
  {
    files: ["sentry.*.config.ts", "instrumentation.ts", "next.config.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
  // Test files use Response.json() which inherently returns `any`; relax unsafe rules
  {
    files: ["src/**/*.spec.ts", "src/**/*.spec.tsx"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  // Storybook stories use loose patterns; skip strict type checking
  {
    files: ["src/**/*.stories.tsx"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },
  // File-length hard cap for test files — 600 vs the 400 source cap. Placed
  // after the base rules block so last-match-wins raises the ceiling for specs
  // and files under a `-tests/` dir (mirrors the old check-file-length.sh tiers).
  {
    files: [
      "**/*.spec.{ts,tsx}",
      "**/*.test.{ts,tsx}",
      "**/*-tests/**/*.{ts,tsx}",
    ],
    rules: {
      "max-lines": [
        "error",
        { max: 600, skipBlankLines: false, skipComments: false },
      ],
    },
  },
  ...storybook.configs["flat/recommended"],
);
