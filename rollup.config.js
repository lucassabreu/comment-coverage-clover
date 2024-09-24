import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import externals from "rollup-plugin-node-externals";
import typescript from "rollup-plugin-typescript2";
import fs from "fs";

const pkg = JSON.parse(fs.readFileSync("package.json"));

export default {
  input: pkg.source,
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: true,
    },
  ],
  treeshake: true,
  plugins: [
    externals({
      builtin: true,
      deps: false,
    }),
    resolve({
      preferBuiltins: true,
      mainFields: ["main"],
    }),
    commonjs({}),
    typescript({
      useTsconfigDeclarationDir: true,
    }),
    json(),
  ],
};
