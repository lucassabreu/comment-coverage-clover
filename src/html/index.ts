import { getInput } from "@actions/core";
import { context } from "@actions/github/lib/utils";

import { Coverage, File, Icons, Metrics, Stats } from "../types";

import {
  a,
  b,
  details,
  fragment,
  span,
  summary,
  table,
  tbody,
  td,
  th,
  thead,
  tr,
} from "./helper";

const lang = getInput("lang") || "en-US";
let baseUrl = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/blob/${context.sha}`;

if (getInput("dir-prefix-keep")) {
  baseUrl = `${baseUrl}/${getInput("dir-prefix-keep")}`.replace(/\/$/, "");
}

const p2s = (p: number | undefined, lang: string, zero = "-"): string =>
  p === undefined || p == 0
    ? zero
    : p.toLocaleString(lang, {
        style: "percent",
        minimumFractionDigits: 2,
      });

const c2s = (c: Coverage, lang: string): string =>
  span(p2s(c.percentual, lang), {
    title:
      c.covered.toLocaleString(lang, { useGrouping: true }) +
      " out of " +
      c.total.toLocaleString(lang, { useGrouping: true }),
  });

const json = (o: any, ident = true) =>
  `<pre>${JSON.stringify(o, null, ident ? 2 : null)}</pre>`;

const compareFile = (
  n: Coverage,
  o: null | Coverage,
  lang: string,
  icons: Icons
) =>
  " " +
  (o === null
    ? span(icons.new, { title: "new file" })
    : compare(n, o, lang, true, icons));

interface Stringable {
  toString: () => string;
}

const limitedFragment = (
  limit: number,
  noSpaceLeft: string,
  ...children: Stringable[]
) => {
  limit -= noSpaceLeft.length;
  let html = "";
  for (let c of children) {
    const s = c.toString();
    if (s.length > limit) return html + noSpaceLeft;
    limit -= s.length;
    html += s;
  }

  return html;
};

const line = (
  name: string,
  m: Metrics,
  lang: string,
  icons: Icons,
  o: Metrics = null,
  showDelta = false,
  showBranchesColumn = true
) =>
  tr(
    td(name),
    ...["lines", "methods", ...(showBranchesColumn ? ["branches"] : [])].map(
      (p) =>
        td(
          c2s(m[p], lang) +
            (!showDelta ? "" : compareFile(m[p], o && o[p], lang, icons)),
          {
            align: "right",
          }
        )
    )
  );

const compare = (
  n: Coverage,
  o: Coverage,
  lang: string,
  showDelta = false,
  icons: Icons
): string =>
  span(
    n.percentual == o.percentual
      ? icons.equals
      : n.percentual < o.percentual
      ? icons.decreased
      : icons.increased,
    {
      title:
        `Was ${p2s(o.percentual || 0, lang, "0%")} before` +
        (showDelta && (n.percentual || 0) !== (o.percentual || 0)
          ? ` (${n.percentual > o.percentual ? "+" : "-"}${p2s(
              Math.abs(n.percentual - o.percentual),
              lang
            )})`
          : ""),
    }
  );

const total = (name: string, icons: Icons, c: Coverage, oldC?: Coverage) =>
  c.total > 0 &&
  fragment(
    b(name + ":"),
    " ",
    c2s(c, lang),
    " ",
    !oldC ? "" : compare(c, oldC, lang, false, icons)
  );

const link = (folder: string, file: string) =>
  a(`${baseUrl}/${folder}/${file}`, file);

export const html = (
  c: Stats,
  o: Stats = null,
  configs: {
    withTable: boolean;
    deltaPerFile: boolean;
    showBranchesColumn: boolean;
    icons: Icons;
  }
): string =>
  (configs.withTable
    ? tableWrap(
        c,
        configs.icons,
        o,
        configs.deltaPerFile,
        configs.showBranchesColumn
      )
    : span)(
    "Summary - ".concat(
      [
        total("Lines", configs.icons, c.total.lines, o?.total.lines),

        total("Methods", configs.icons, c.total.methods, o?.total.methods),
        configs.showBranchesColumn &&
          total("Branches", configs.icons, c.total.branches, o?.total.branches),
      ]
        .filter((v) => v)
        .join(" | ")
    )
  );

const tableWrap =
  (
    c: Stats,
    icons: Icons,
    o: Stats = null,
    showDelta = false,
    showBranchesColumn = true
  ) =>
  (summaryText: string): string =>
    details(
      summary(summaryText),
      "<br />",
      table(
        thead(
          tr(
            th("Files"),
            th("Lines"),
            th("Methods"),
            showBranchesColumn && th("Branches")
          )
        ),
        tbody(
          c.folders.size === 0
            ? tr(td("No files reported or matching filters", { colspan: 4 }))
            : limitedFragment(
                65536 - 4000,
                tr(td(b("Table truncated to fit comment"), { colspan: 4 })),
                ...Array.from(c.folders.entries())
                  .map(([k, folder]) => [
                    tr(td(b(folder.name), { colspan: 4 })),
                    ...folder.files.map((f: File) =>
                      line(
                        `&nbsp; &nbsp;${link(folder.name, f.name)}`,
                        f.metrics,
                        lang,
                        icons,
                        o?.get(k, f.name)?.metrics,
                        showDelta,
                        showBranchesColumn
                      )
                    ),
                  ])
                  .reduce((accum, item) => [...accum, ...item], [])
              )
        )
      )
    );
