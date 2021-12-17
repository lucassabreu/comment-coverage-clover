import { getInput } from "@actions/core";
import { context } from "@actions/github/lib/utils";

import { Coverage, File, Metrics, Stats } from "../types";

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

const p2s = (p: number | undefined, lang: string): string =>
  p === undefined
    ? "-"
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

const line = (name: string, m: Metrics, lang: string) =>
  tr(
    td(name),
    td(c2s(m.lines, lang)),
    td(c2s(m.methods, lang)),
    td(c2s(m.branchs, lang))
  );

const compare = (n: Coverage, o: Coverage, lang: string): string =>
  span(
    n.percentual == o.percentual
      ? ":stop_button:"
      : n.percentual < o.percentual
      ? ":arrow_down_small:"
      : ":arrow_up_small:",
    {
      title: `Was ${p2s(o.percentual || 0, lang)} before`,
    }
  );

const total = (name: string, c: Coverage, oldC?: Coverage) =>
  c.total > 0 &&
  fragment(
    b(name + ":"),
    " ",
    c2s(c, lang),
    " ",
    !oldC ? "" : compare(c, oldC, lang)
  );

const link = (folder: string, file: string) =>
  a(`${baseUrl}/${folder}/${file}`, file);

export const html = (withTable: boolean, c: Stats, o?: Stats): string =>
  (withTable ? tableWrap(c) : span)(
    "Summary - ".concat(
      [
        total("Lines", c.total.lines, o?.total.lines),
        total("Methods", c.total.methods, o?.total.methods),
        total("Branchs", c.total.branchs, o?.total.branchs),
      ]
        .filter((v) => v)
        .join(" | ")
    )
  );

const tableWrap =
  (c: Stats) =>
  (summaryText: string): string =>
    details(
      summary(summaryText),
      "<br/>",
      table(
        thead(tr(th("Files"), th("Lines"), th("Methods"), th("Branchs"))),
        tbody(
          ...Array.from(c.folders.entries()).map(([, folder]) =>
            fragment(
              tr(td(b(folder.name), { colspan: 4 })),
              ...folder.files.map((f: File) =>
                line(
                  `&nbsp; &nbsp;${link(folder.name, f.name)}`,
                  f.metrics,
                  lang
                )
              )
            )
          )
        )
      )
    );
