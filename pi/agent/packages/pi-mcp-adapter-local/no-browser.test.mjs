import assert from "node:assert/strict";
import {existsSync, readFileSync, readdirSync} from "node:fs";
import test from "node:test";

const removedModules = [
  "glimpse-ui.ts",
  "host-html-template.ts",
  "ui-resource-handler.ts",
  "ui-server.ts",
  "ui-session.ts",
];
const forbiddenSource = [
  'from "open"',
  "from 'open'",
  "openUrl(",
  "window.open(",
  "MCP_UI_VIEWER",
  "openGlimpseWindow",
  "startUiServer",
  "io.modelcontextprotocol/ui",
];

test("runtime cannot open browser windows", () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  assert.equal(packageJson.dependencies?.open, undefined);
  assert.equal(packageJson.dependencies?.["@modelcontextprotocol/ext-apps"], undefined);

  for (const path of removedModules) assert.equal(existsSync(path), false, path);
  for (const path of readdirSync(".").filter(path => /\.(?:ts|js|mjs)$/.test(path) && !path.endsWith(".test.ts") && path !== "no-browser.test.mjs")) {
    const source = readFileSync(path, "utf8");
    for (const forbidden of forbiddenSource) assert.equal(source.includes(forbidden), false, `${path}: ${forbidden}`);
  }
});
