#!/usr/bin/env npx tsx
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

const type = process.argv[2];
if (!["major", "minor", "patch"].includes(type)) {
  console.error("Usage: tsx scripts/release.ts <major|minor|patch>");
  process.exit(1);
}

const pkgPath = resolve(rootDir, "package.json");
const changelogPath = resolve(rootDir, "CHANGELOG.md");

const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
const [major, minor, patch] = pkg.version.split(".").map(Number);

let newVersion: string;
if (type === "major") {
  newVersion = `${major + 1}.0.0`;
} else if (type === "minor") {
  newVersion = `${major}.${minor + 1}.0`;
} else {
  newVersion = `${major}.${minor}.${patch + 1}`;
}

try {
  execSync(`git rev-parse v${newVersion}`, { cwd: rootDir, stdio: "pipe" });
  console.error(
    `Error: Tag v${newVersion} already exists. Please update the version in package.json manually first.`,
  );
  process.exit(1);
} catch {
  // Tag does not exist, proceed
}

const today = new Date().toISOString().split("T")[0];

const changelogContent = readFileSync(changelogPath, "utf-8");

// Find the content after "## [Unreleased]\n\n" (two newlines = empty line)
const unreleasedHeader = "## [Unreleased]\n\n";
const unreleasedIndex = changelogContent.indexOf(unreleasedHeader);
const afterUnreleased = changelogContent.substring(
  unreleasedIndex + unreleasedHeader.length,
);

// Find the next ## section
const nextSectionMatch = afterUnreleased.match(/^## /m);

let newChangelog: string;
// Replace the content between Unreleased header and next ## section
newChangelog =
  changelogContent.substring(0, unreleasedIndex) +
  unreleasedHeader +
  `## [${newVersion}] - ${today}\n\n` +
  afterUnreleased;

// Update the links at the bottom
const previousVersion = pkg.version;

const oldUnreleasedLink = `[Unreleased]: https://github.com/lucassabreu/comment-coverage-clover/compare/v${previousVersion}...HEAD`;
const newUnreleasedLink = `[Unreleased]: https://github.com/lucassabreu/comment-coverage-clover/compare/v${newVersion}...HEAD`;
const newVersionLink = `[${newVersion}]: https://github.com/lucassabreu/comment-coverage-clover/compare/v${previousVersion}...v${newVersion}`;

newChangelog = newChangelog.replace(
  oldUnreleasedLink,
  `${newUnreleasedLink}\n${newVersionLink}`,
);

writeFileSync(changelogPath, newChangelog);
pkg.version = newVersion;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

console.log(`Released version ${newVersion}`);

execSync(`git add package.json CHANGELOG.md`, {
  cwd: rootDir,
  stdio: "inherit",
});
execSync(`git commit -m "release: v${newVersion}"`, {
  cwd: rootDir,
  stdio: "inherit",
});
execSync(`git tag -a v${newVersion} -m "v${newVersion}"`, {
  cwd: rootDir,
  stdio: "inherit",
});
execSync(`git push origin main --tags`, { cwd: rootDir, stdio: "inherit" });

console.log("Done!");
