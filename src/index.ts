import { error, getInput, setFailed } from "@actions/core";
import { getOctokit } from "@actions/github";
import { context } from "@actions/github/lib/utils";
import { existsSync, readFile } from "fs";
import { promisify } from "util";

import { chart } from "./chart";
import { fromString } from "./clover";
import { html } from "./html";
import { Stats, File } from "./types";

const workspace = getInput("dir-prefix") || process.env.GITHUB_WORKSPACE;
const token = getInput("github-token") || process.env.GITHUB_TOKEN;
const file = getInput("file") || process.env.FILE;
let baseFile = getInput("base-file") || process.env.BASE_FILE;
const onlyWithCover = getInput("only-with-cover") == "true";
const onlyWithCoverableLines = getInput("only-with-coverable-lines") == "true";
const withChart = getInput("with-chart") == "true";
const withTable = getInput("with-table") == "true";
const tableWithOnlyBellow = Number(getInput("table-below-coverage") || 100);
const tableWithOnlyAbove = Number(getInput("table-above-coverage") || 0);
const tableWithTypeLimit = getInput("table-type-coverage") || "lines";
const signature = `<sub data-file=${JSON.stringify(file)}>${
  getInput("signature") ||
  ':robot: comment via <a href="https://github.com/lucassabreu/comment-coverage-clover">lucassabreu/comment-coverage-clover</a>'
}</sub>`;
const github = token && getOctokit(token);
const maxLineCoverageDecrease = getInput("max-line-coverage-decrease");
const maxMethodCoverageDecrease = getInput("max-method-coverage-decrease");
const minLineCoverage = Number(getInput("min-line-coverage"));
const minMethodCoverage = Number(getInput("min-method-coverage"));

const comment = async (
  cStats: Stats,
  oldStats: null | Stats,
  coverageType: string
) => {
  const w = workspace.endsWith("/") ? workspace : workspace.concat("/");
  cStats.folders.forEach((v, k) =>
    cStats.folders.set(
      k,
      Object.assign(v, {
        name: v.name.startsWith(w) ? v.name.slice(w.length) : v.name,
      })
    )
  );

  cStats = filterConverage(
    cStats,
    coverageType,
    tableWithOnlyAbove,
    tableWithOnlyBellow
  );

  return (
    (withChart ? chart(cStats, oldStats) : "") +
    html(
      withTable,
      rmWithout(cStats, {
        cover: onlyWithCover,
        coverableLines: onlyWithCoverableLines,
      }),
      oldStats
    )
  );
};

const rmWithout = (
  s: Stats,
  onlyWith: {
    cover: boolean;
    coverableLines: boolean;
  }
): Stats => {
  let filters: ((f: File) => boolean)[] = [];
  if (onlyWith.cover) {
    filters.push((f) => f.metrics.lines.covered !== 0);
  }
  if (onlyWith.coverableLines) {
    filters.push((f) => f.metrics.lines.total !== 0);
  }

  if (filters === []) return s;

  s.folders.forEach((folder, key) => {
    folder.files = folder.files.filter((f) =>
      filters.reduce((r, fn) => r && fn(f), true)
    );
    if (folder.files.length === 0) s.folders.delete(key);
  });

  return s;
};

const between = (v: number, min: number, max: number) =>
  min <= (v || 0) && (v || 0) <= max;

const filterConverage = (
  c: Stats,
  type: string,
  min: number,
  max: number
): Stats => {
  if (min <= 0 && max >= 100) return c;

  c.folders.forEach((f, k) => {
    const files = f.files.filter((f) =>
      between(f.metrics[type].percentual * 100, min, max)
    );

    if (files.length === 0) {
      return c.folders.delete(k);
    }

    c.folders.set(k, Object.assign(f, { files }));
  });

  return c;
};

function* checkThreshold(c: Stats, o?: Stats) {
  const f = (n: number) => n.toFixed(2) + "%";
  if (minLineCoverage > c.total.lines.percentual * 100) {
    yield `Minimum line coverage is ${f(minLineCoverage)}, currently it is ${f(
      c.total.lines.percentual * 100
    )}`;
  }

  if (minMethodCoverage > c.total.methods.percentual * 100) {
    yield `Minimum method coverage is ${f(
      minMethodCoverage
    )}, currently it is ${f(c.total.methods.percentual * 100)}`;
  }

  if (o === undefined) return;

  const lcdiff = (o.total.lines.percentual - c.total.lines.percentual) * 100;
  if (maxLineCoverageDecrease && lcdiff >= Number(maxLineCoverageDecrease)) {
    yield `Line coverage was down by ${f(lcdiff)} (max is ${f(
      Number(maxLineCoverageDecrease)
    )})`;
  }

  const mcdiff =
    (o.total.methods.percentual - c.total.methods.percentual) * 100;
  if (
    maxMethodCoverageDecrease &&
    mcdiff >= Number(maxMethodCoverageDecrease)
  ) {
    yield `Methods coverage was down by ${f(mcdiff)} (max is ${f(
      Number(maxMethodCoverageDecrease)
    )})`;
  }
}

const notFoundMessage =
  "was not found, please check if the path is valid, or if it exists.";

const run = async () => {
  if (!["lines", "methods", "branchs"].includes(tableWithTypeLimit)) {
    error(`there is no coverage type ${tableWithTypeLimit}`);
    return;
  }

  if (!github) return;
  if (!context.payload.pull_request) return;

  const commit = context.payload.pull_request?.head.sha.substring(0, 7);

  if (!existsSync(file)) {
    throw `file "${file}" ${notFoundMessage}`;
  }

  const cStats = fromString((await promisify(readFile)(file)).toString());

  if (baseFile && !existsSync(baseFile)) {
    error(`base file "${baseFile}" ${notFoundMessage}`);
    baseFile = undefined;
  }

  const oldStats =
    baseFile && fromString((await promisify(readFile)(baseFile)).toString());

  const msgs = Array.from(checkThreshold(cStats, oldStats));

  msgs.map(setFailed);

  const body = `
Coverage report for commit: ${commit}
File: \`${file}\`

${msgs.map((m) => `> :warning: ${m}`).join("\n")}

${await comment(cStats, oldStats, tableWithTypeLimit)}

${signature}`;

  let commentId = null;
  try {
    const comments = (
      await github.rest.issues.listComments({
        ...context.repo,
        issue_number: context.issue.number,
      })
    ).data;

    for (let i = comments.length - 1; i >= 0; i--) {
      const c = comments[i];
      if (c.user?.type !== "Bot") continue;
      if (!c.body?.includes(signature)) continue;
      commentId = c.id;
    }
  } catch (e) {
    error(e);
  }

  if (commentId) {
    try {
      await github.rest.issues.updateComment({
        ...context.repo,
        comment_id: commentId,
        body,
      });
      return;
    } catch {}
  }

  await github.rest.issues.createComment({
    ...context.repo,
    issue_number: context.issue.number,
    body,
  });
};

run().catch(setFailed);
