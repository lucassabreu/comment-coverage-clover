import { xml2json } from "xml-js";
import { Coverage, Folder, Stats } from "../types";

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
  _attributes: {
    name: string;
    path?: string;
  };
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

export const fromString = (str: string): Stats => {
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

  return new Stats(
    {
      lines: new Coverage(m.statements, m.coveredstatements),
      methods: new Coverage(m.methods, m.coveredmethods),
      branchs: new Coverage(m.conditionals, m.coveredconditionals),
    },
    allFiles
      .sort((a, b) => (a._attributes.name < b._attributes.name ? -1 : 1))
      .map((f) => ({
        ...f,
        folder: (f._attributes.path || f._attributes.name).split("/").slice(0, -1).join("/"),
      }))
      .reduce(
        (
          files,
          { folder, _attributes: { path, name }, metrics: { _attributes: m } }
        ) =>
          files.set(
            folder,
            (files.get(folder) || new Folder(folder)).push({
              name: (path || name).split("/").pop(),
              metrics: {
                lines: new Coverage(m.statements, m.coveredstatements),
                methods: new Coverage(m.methods, m.coveredmethods),
                branchs: new Coverage(m.conditionals, m.coveredconditionals),
              },
            })
          ),
        new Map<string, Folder>()
      )
  );
};
