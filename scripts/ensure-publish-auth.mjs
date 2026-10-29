/**
 * ensure-publish-auth.mjs — `prepack` hook for packages released through the
 * DK CI/CD `npm-publish-v1` pipeline.
 *
 * Why it exists: DK's `npm-pack-and-publish-ca-v1` task writes the
 * CodeArtifact auth token to the package folder's `.npmrc`
 * (packages/<name>/.npmrc), then runs `pnpm pack` and `pnpm publish` there
 * with the latest pnpm. Inside a pnpm workspace, pnpm 11 reads auth from the
 * workspace root `.npmrc` and `~/.config/pnpm/auth.ini`, not from a package's
 * own `.npmrc`, so the CodeArtifact publish fails with an auth error. This
 * hook copies the auth lines DK wrote into those two files.
 *
 * It only runs inside DK: the task stores the token at
 * /workspace/source/ca-token. Anywhere else (a local `pnpm pack`, CI on
 * GitHub) the file doesn't exist and the script exits without reading or
 * writing anything.
 *
 * `prepack` runs for both `pnpm pack` and `pnpm publish`, so lines already
 * present in a target file are not added again. The token is never printed,
 * and files that receive it are made readable by their owner only.
 *
 * Same approach as vtex/vtex-stack-net (emitters/scripts/ensure-publish-auth).
 * Remove this script if DK's task starts writing the token where pnpm reads
 * it in a workspace.
 */
import {
  appendFileSync,
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LOG_PREFIX = "ensure-publish-auth:";

// DK_CA_TOKEN_FILE only exists to test this script outside DK.
const DK_TOKEN_FILE =
  process.env.DK_CA_TOKEN_FILE ?? "/workspace/source/ca-token";

if (!existsSync(DK_TOKEN_FILE)) {
  process.exit(0);
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageNpmrc = join(process.cwd(), ".npmrc");
const pnpmConfigDir = join(
  process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config"),
  "pnpm",
);
const targets = [join(repoRoot, ".npmrc"), join(pnpmConfigDir, "auth.ini")];

function fail(message) {
  console.error(`${LOG_PREFIX} ${message}`);
  process.exit(1);
}

if (!existsSync(packageNpmrc)) {
  fail(`running in DK but ${packageNpmrc} doesn't exist`);
}

// DK writes one line like:
// //main-<account>.d.codeartifact.<region>.amazonaws.com/npm/<repo>/
//   :_authToken=<token>   (a single line in the file)
const authLines = readFileSync(packageNpmrc, "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.startsWith("//") && line.includes(":_authToken="));

if (authLines.length === 0) {
  fail(`running in DK but ${packageNpmrc} has no _authToken line`);
}

// pnpm 11 may look up the registry key with or without the trailing slash
// before ":_authToken", so both forms are written.
const linesToWrite = ["always-auth=true"];
for (const line of authLines) {
  linesToWrite.push(line);
  const withoutSlash = line.replace("/:_authToken=", ":_authToken=");
  if (withoutSlash !== line) linesToWrite.push(withoutSlash);
}

for (const target of targets) {
  const existing = existsSync(target)
    ? readFileSync(target, "utf8")
        .split("\n")
        .map((line) => line.trim())
    : [];
  const missing = linesToWrite.filter((line) => !existing.includes(line));

  if (missing.length === 0) {
    console.log(`${LOG_PREFIX} ${target} already has the auth lines`);
    continue;
  }

  // Owner-only: 0700 for a created directory, 0600 for the file. chmod also
  // covers a file that already existed (the root .npmrc).
  mkdirSync(dirname(target), { recursive: true, mode: 0o700 });
  appendFileSync(target, `\n${missing.join("\n")}\n`, { mode: 0o600 });
  chmodSync(target, 0o600);

  const hosts = authLines.map((line) => line.split(":_authToken=")[0]);
  console.log(
    `${LOG_PREFIX} added auth for ${hosts.join(", ")} to ${target} ` +
      `(${missing.length} line(s))`,
  );
}
