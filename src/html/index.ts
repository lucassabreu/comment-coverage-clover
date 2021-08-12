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

let baseUrl = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/blob/${context.sha}`;

if (getInput("dir-prefix-keep")) {
  baseUrl = `${baseUrl}/${getInput("dir-prefix-keep")}`.replace(/\/$/, "");
}

const c2s = (c: Coverage, lang: string): string =>
  span(
    c.percentual === undefined
      ? "-"
      : c.percentual.toLocaleString(lang, {
          style: "percent",
          minimumFractionDigits: 2,
        }),
    {
      title:
        c.covered.toLocaleString(lang, { useGrouping: true }) +
        " out of " +
        c.total.toLocaleString(lang, { useGrouping: true }),
    }
  );

const line = (name: string, m: Metrics, lang: string) =>
  tr(
    td(name),
    td(c2s(m.lines, lang)),
    td(c2s(m.methods, lang)),
    td(c2s(m.branchs, lang))
  );

const total = (name: string, c: Coverage, lang: string) =>
  c.total > 0 && fragment(b(name + ":"), " ", c2s(c, lang));

const link = (folder: string, file: string) =>
  a(`${baseUrl}/${folder}/${file}`, file);

export const html = (s: Stats, lang: string): string =>
  details(
    summary(
      "Summary - ",
      [
        total("Lines", s.total.lines, lang),
        total("Methods", s.total.methods, lang),
        total("Branchs", s.total.branchs, lang),
      ]
        .filter((v) => v)
        .join(" | ")
    ),
    "<br/>",
    table(
      thead(tr(th("Files"), th("Lines"), th("Methods"), th("Branchs"))),
      tbody(
        ...Array.from(s.folders.entries()).map(([, folder]) =>
          fragment(
            tr(td(b(folder.name), { colspan: 4 })),
            ...folder.files.map((f: File) =>
              line(`&nbsp; &nbsp;${link(folder.name, f.name)}`, f.metrics, lang)
            )
          )
        )
      )
    )
  );
