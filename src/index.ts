import { error, getInput } from "@actions/core";
import { getOctokit } from "@actions/github";
import { context } from "@actions/github/lib/utils";
import { readFile, existsSync } from "fs";
import { promisify } from "util";
import { fromString } from "./clover";
import { html } from "./html";
import { Stats } from "./types";

const workspace = getInput("dir-prefix") || process.env.GITHUB_WORKSPACE;
const token = getInput("github-token") || process.env.GITHUB_TOKEN;
const file = getInput("file") || process.env.FILE;
const baseFile = getInput("base-file") || process.env.BASE_FILE;
const onlyWithCover = getInput("only-with-cover") == "true";
const signature = `<sub data-file=${JSON.stringify(file)}>${
  getInput("signature") ||
  ':robot: comment via <a href="https://github.com/lucassabreu/comment-coverage-clover">lucassabreu/comment-coverage-clover</a>'
}</sub>`;
const github = token && getOctokit(token);

const comment = async (file: string, baseFile?: string) => {
  let cStats = fromString((await promisify(readFile)(file)).toString());

  if (baseFile && !existsSync(baseFile)) {
    error(`file ${baseFile} was not found`);
    baseFile = undefined;
  }

  const oldStats =
    baseFile && fromString((await promisify(readFile)(baseFile)).toString());

  const w = workspace.endsWith("/") ? workspace : workspace.concat("/");
  cStats.folders.forEach((v, k) =>
    cStats.folders.set(
      k,
      Object.assign(v, {
        name: v.name.startsWith(w) ? v.name.slice(w.length) : v.name,
      })
    )
  );

  return html(rmWithoutCover(cStats, onlyWithCover), oldStats);
};

const rmWithoutCover = (s: Stats, onlyWithCover: boolean): Stats => {
  if (!onlyWithCover) return s;

  s.folders.forEach((folder, key) => {
    folder.files = folder.files.filter((f) => f.metrics.lines.covered !== 0);
    if (folder.files.length === 0) s.folders.delete(key);
  });

  return s;
};

const run = async () => {
  if (!github) return;
  if (!context.payload.pull_request) return;

  const commit = context.payload.pull_request?.head.sha.substring(0, 7);

  const body = `
  Coverage report for commit: ${commit}
  File: \`${file}\`

  ${await comment(file, baseFile)}
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
