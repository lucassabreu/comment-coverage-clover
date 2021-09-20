import { error, getInput, setFailed } from "@actions/core";
import { getOctokit } from "@actions/github";
import { context } from "@actions/github/lib/utils";
import { readFile, existsSync } from "fs";
import { promisify } from "util";
import { chart } from "./chart";
import { fromString } from "./clover";
import { html } from "./html";
import { Stats } from "./types";

const workspace = getInput("dir-prefix") || process.env.GITHUB_WORKSPACE;
const token = getInput("github-token") || process.env.GITHUB_TOKEN;
const file = getInput("file") || process.env.FILE;
let baseFile = getInput("base-file") || process.env.BASE_FILE;
const onlyWithCover = getInput("only-with-cover") == "true";
const withChart = getInput("with-chart") == "true";
const withTable = getInput("with-table") == "true";
const signature = `<sub data-file=${JSON.stringify(file)}>${
  getInput("signature") ||
  ':robot: comment via <a href="https://github.com/lucassabreu/comment-coverage-clover">lucassabreu/comment-coverage-clover</a>'
}</sub>`;
const github = token && getOctokit(token);
const maxLineCoverageDecrease = getInput("max-line-coverage-decrease");
const maxMethodCoverageDecrease = getInput("max-method-coverage-decrease");
const minLineCoverage = Number(getInput("min-line-coverage"));
const minMethodCoverage = Number(getInput("min-method-coverage"));

const comment = async (cStats: Stats, oldStats?: Stats) => {
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
    html(withTable, rmWithoutCover(cStats, onlyWithCover), oldStats)
  );
};

const rmWithoutCover = (s: Stats, onlyWithCover: boolean): Stats => {
  if (!onlyWithCover) return s;

  s.folders.forEach((folder, key) => {
    folder.files = folder.files.filter((f) => f.metrics.lines.covered !== 0);
    if (folder.files.length === 0) s.folders.delete(key);
  });

  return s;
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

const run = async () => {
  if (!github) return;

  const commit = context.payload.pull_request
    ? context.payload.pull_request.head.sha
    : context.sha;

  const cStats = fromString((await promisify(readFile)(file)).toString());

  if (baseFile && !existsSync(baseFile)) {
    error(`file ${baseFile} was not found`);
    baseFile = undefined;
  }

  const oldStats =
    baseFile && fromString((await promisify(readFile)(baseFile)).toString());

  const msgs = Array.from(checkThreshold(cStats, oldStats));

  msgs.map(setFailed);

  const body = `
Coverage report for commit: ${commit.substring(0, 7)}
File: \`${file}\`

${msgs.map((m) => `> :warning: ${m}`).join("\n")}

${await comment(cStats, oldStats)}

${signature}`;

  const check = {
    name: "PHPUnit Report",
    head_sha: commit,
    owner: context.repo.owner,
    repo: context.repo.repo,
    output: {
      title: "Coverage Report",
      summary: comment,
    },
    conclusion: msgs.length ? "failed" : "success",
    status: "completed",
  };

  console.log(check);

  github.rest.checks.create(check);

  if (!context.payload.pull_request) return;

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
    console.error(e);
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

run();
