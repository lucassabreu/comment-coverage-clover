import { getInput } from "@actions/core";
import { Stats } from "../types";

const percs = {
  0: 0,
  10: 0,
  20: 0,
  30: 0,
  40: 0,
  50: 0,
  60: 0,
  70: 0,
  80: 0,
  90: 0,
  100: 0,
};

const reduce = (s: Stats) =>
  Array.from(s.folders.values())
    .reduce((files, f) => [...files, ...f.files], [])
    .map((f) => Math.round((f.metrics.lines.percentual || 0) * 10) * 10)
    .reduce((m, perc) => Object.assign(m, { [perc]: m[perc] + 1 }), percs);

const size = Number(getInput("chart-size") || 23);
const emptyChar = "░";
const fullChar = "█";

const bar = (c: number, max: number) =>
  fullChar.repeat(Math.ceil((c / max) * size)).padEnd(size, emptyChar);

const p2s = (p: number) =>
  p
    .toLocaleString("en", { style: "percent", minimumFractionDigits: 1 })
    .padStart(5);

const tostr = (e: Record<string, number>) => {
  const max = Math.max(...Object.values(e));
  const sum = Object.values(e).reduce((a, v) => a + v, 0);

  return (
    `Cover ┌─${"─".repeat(size)}─┐ Freq.\n` +
    Object.keys(e)
      .map((k) => `${k.padStart(4)}% │ ${bar(e[k], max)} │ ${p2s(e[k] / sum)}`)
      .join("\n") +
    `\n      └─${"─".repeat(size)}─┘`
  );
};

export const chart = (s: Stats) => "\n```\n" + tostr(reduce(s)) + "\n```\n";
