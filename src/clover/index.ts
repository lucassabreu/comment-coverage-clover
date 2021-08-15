import { xml2json } from "xml-js";
import { Coverage, Stats } from "../types";

interface CloverXMLMetrics {
  _attributes: {
    loc: number;
    ncloc: number;
    classes: number;
    methods: number;
    conditionals: number;
    statements: number;
    elements: number;
    coveredclasses: number;
    coveredmethods: number;
    coveredconditionals: number;
    coveredstatements: number;
    coveredelements: number;
  };
}

interface CloverFileXML {
  _attributes: { name: string };
  class: {
    name: string;
  };
  metrics: CloverXMLMetrics;
}

interface CloverXML {
  coverage: {
    generated: string;
    project: {
      timespamp: number;
      file?: CloverFileXML[];
      package?: { file: CloverFileXML[] }[];
      metrics: CloverXMLMetrics & { files: number };
    };
  };
}

export const fromString = (str: string, onlyWithCover: boolean): Stats => {
  const {
    coverage: {
      project: {
        metrics: { _attributes: m },
        file: files,
        package: packages,
      },
    },
  } = JSON.parse(xml2json(str, { compact: true })) as CloverXML;

  let allFiles = (packages || []).reduce(
    (files, p) => [...files, ...p.file],
    files || []
  );

  if (onlyWithCover)
    allFiles = allFiles.filter(
      (f) => f.metrics._attributes.coveredstatements > 0
    );

  return {
    total: {
      lines: new Coverage(m.statements, m.coveredstatements),
      methods: new Coverage(m.methods, m.coveredmethods),
      branchs: new Coverage(m.conditionals, m.coveredconditionals),
    },
    folders: allFiles
      .map((f) => ({
        ...f,
        folder: f._attributes.name.split("/").slice(0, -1).join("/"),
      }))
      .reduce(
        (
          files,
          { folder, _attributes: { name }, metrics: { _attributes: m } }
        ) =>
          files.set(
            folder,
            Object.assign(files[folder] || { name: folder }, {
              files: [
                ...(files[folder]?.files || []),
                {
                  name: name.split("/").pop(),
                  metrics: {
                    lines: new Coverage(m.statements, m.coveredstatements),
                    methods: new Coverage(m.methods, m.coveredmethods),
                    branchs: new Coverage(
                      m.conditionals,
                      m.coveredconditionals
                    ),
                  },
                },
              ],
            })
          ),
        new Map()
      ),
  } as Stats;
};
