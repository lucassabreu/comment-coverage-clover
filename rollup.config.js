import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import externals from "rollup-plugin-node-externals";
import typescript from "rollup-plugin-typescript2";

const pkg = require("./package.json");

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
    commonjs({
      // dynamicRequireTargets: [
      //   // include using a glob pattern (either a string or an array of strings)
      //   "node_modules/logform/*.js",
      //   "node_modules/logform/*.js",
      //   // exclude files that are known to not be required dynamically, this allows for better optimizations
      //   "!node_modules/logform/index.js",
      //   "!node_modules/logform/format.js",
      //   "!node_modules/logform/levels.js",
      //   "!node_modules/logform/browser.js",
      // ],
    }),
    typescript({
      useTsconfigDeclarationDir: true,
    }),
    json(),
  ],
};
