import {
  debug,
  error,
  getBooleanInput,
  getInput,
  setFailed,
  summary,
} from "@actions/core";
import { getOctokit } from "@actions/github";
import { context } from "@actions/github/lib/utils";
import { existsSync, readFile } from "fs";
import { promisify } from "util";

import { chart } from "./chart";
import { fromString } from "./clover";
import { html } from "./html";
import { Stats, File, Metrics } from "./types";

const workspace = getInput("dir-prefix") || process.env.GITHUB_WORKSPACE;
const token = getInput("github-token") || process.env.GITHUB_TOKEN;
const file = getInput("file") || process.env.FILE;
let baseFile = getInput("base-file") || process.env.BASE_FILE;
const onlyWithCover = getBooleanInput("only-with-cover");
const onlyWithCoverableLines = getBooleanInput("only-with-coverable-lines");
const withChart = getBooleanInput("with-chart");
const withTable = getBooleanInput("with-table");
const showBranchesColumn = getBooleanInput("with-branches");
const tableWithOnlyBellow = Number(getInput("table-below-coverage") || 100);
const tableWithOnlyAbove = Number(getInput("table-above-coverage") || 0);
const tableWithChangeAbove = Number(getInput("table-coverage-change") || 0);
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
const showPercentageChangePerFile = getBooleanInput(
  "show-percentage-change-on-table"
);

const comment = async (
  cStats: Stats,
  oldStats: null | Stats,
  coverageType: keyof Metrics
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

  return (
    (withChart ? chart(cStats, oldStats) : "") +
    html(
      filter(
        cStats,
        {
          cover: onlyWithCover,
          coverableLines: onlyWithCoverableLines,
        },
        {
          type: coverageType,
          min: tableWithOnlyAbove,
          max: tableWithOnlyBellow,
          delta: tableWithChangeAbove,
        },
        oldStats
      ),
      oldStats,
      {
        withTable,
        deltaPerFile: showPercentageChangePerFile,
        showBranchesColumn,
      }
    )
  );
};

const filter = (
  s: Stats,
  onlyWith: {
    cover: boolean;
    coverableLines: boolean;
  },
  onlyBetween: {
    type: keyof Metrics;
    min: number;
    max: number;
    delta: number;
  },
  o: Stats = null
): Stats => {
  const filters: ((f: File, folder: string) => boolean)[] = [];

  if (onlyWith.cover) filters.push((f) => f.metrics.lines.covered !== 0);

  if (onlyWith.coverableLines) filters.push((f) => f.metrics.lines.total !== 0);

  if (onlyBetween.type) {
    if (onlyBetween.min > 0 || onlyBetween.max < 100)
      filters.push((f) =>
        between(
          f.metrics[onlyBetween.type].percentual * 100,
          onlyBetween.min,
          onlyBetween.max
        )
      );

    if (onlyBetween.delta > 0 && o !== null)
      filters.push((f, folder) => {
        const of = o.get(folder, f.name);

        return (
          !of ||
          Math.abs(
            f.metrics[onlyBetween.type].percentual -
              of.metrics[onlyBetween.type].percentual
          ) *
            100 >
            onlyBetween.delta
        );
      });
  }

  if (filters.length === 0) {
    return s;
  }

  s.folders.forEach((folder, key) => {
    folder.files = folder.files.filter((f) =>
      filters.reduce((r, fn) => r && fn(f, key), true)
    );
    if (folder.files.length === 0) {
      s.folders.delete(key);
    }
  });

  return s;
};

const between = (v: number, min: number, max: number) =>
  min <= (v || 0) && (v || 0) <= max;

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
  if (!["lines", "methods", "branches"].includes(tableWithTypeLimit)) {
    error(`there is no coverage type ${tableWithTypeLimit}`);
    return;
  }

  if (!context.payload.pull_request)
    throw (
      "this action requires a pull request context to be able to comment\n" +
      "https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request"
    );
  if (!github)
    throw token
      ? "no Github token was informed !"
      : "the Github token informed is not valid";

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

${await comment(cStats, oldStats, tableWithTypeLimit as keyof Metrics)}

${signature}`;

  let filter = (c: any) => c?.user?.type === "Bot";

  try {
    const u = await github.rest.users.getAuthenticated();
    filter = (c: any) => c?.user?.login === u.data.login;

    debug("Using a PAT from " + u.data.login);
  } catch (e) {}

  let commentId = null;
  try {
    const comments = (
      await github.rest.issues.listComments({
        ...context.repo,
        issue_number: context.issue.number,
      })
    ).data.filter(filter);

    for (let i = comments.length - 1; i >= 0; i--) {
      const c = comments[i];
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

  const v = summary.addHeading("saddest?").addQuote("sad").addSeparator();

  throw v.stringify();
  await v.write();

  await github.rest.issues.createComment({
    ...context.repo,
    issue_number: context.issue.number,
    body,
  });
};

run().catch((err: Error) => setFailed(err + " Stack: " + err.stack));
