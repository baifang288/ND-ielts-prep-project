// Builds the static site into out/ for GitHub Pages.
// The server-only AI route cannot be exported, so it is moved aside during the build.
import { execSync } from "node:child_process";
import { existsSync, renameSync, writeFileSync } from "node:fs";

const api = "app/api";
const parked = ".api-parked";
if (existsSync(api)) renameSync(api, parked);
try {
  execSync("npx next build", {
    stdio: "inherit",
    env: { ...process.env, STATIC_EXPORT: "1", BASE_PATH: process.env.BASE_PATH ?? "/ND-ielts-prep-project" },
  });
  writeFileSync("out/.nojekyll", "");
} finally {
  if (existsSync(parked)) renameSync(parked, api);
}
