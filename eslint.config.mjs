import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Third-party agent skill packages (npx skills add) — not part of this app.
    ".agents/**",
    ".claude/**",
    // bklit chart registry internals (installed via `shadcn add @bklit/...`) — vendor
    // code we consume, not author; our own wrapper charts stay PascalCase and are
    // still linted. Re-run this glob if a future `shadcn add` drops new lowercase files.
    "src/components/charts/[a-z]*.{ts,tsx}",
    "src/components/charts/tooltip/**",
    "src/components/shimmering-text.tsx",
    "src/components/ui/button.tsx",
  ]),
]);

export default eslintConfig;
