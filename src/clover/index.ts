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
      package?: { file: CloverFileXML | CloverFileXML[] }[];
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

  const allFiles = (packages || []).reduce(
    (acc, p) => [...acc, ...(Array.isArray(p.file) ? p.file : [p.file])],
    files || []
  );

  return new Stats(
    {
      lines: new Coverage(m.statements, m.coveredstatements),
      methods: new Coverage(m.methods, m.coveredmethods),
      branchs: new Coverage(m.conditionals, m.coveredconditionals),
    },
    allFiles
      .sort((a, b) => (getCloverFileName(a) < getCloverFileName(b) ? -1 : 1))
      .map((file) => ({
        ...file,
        folder: getCloverFileName(file).split("/").slice(0, -1).join("/"),
      }))
      .reduce(
        (acc, file) => {
          const mAttrs = file.metrics._attributes;

          acc.set(
            file.folder,
            (acc.get(file.folder) || new Folder(file.folder)).push({
              name: getCloverFileName(file).split("/").pop(),
              metrics: {
                lines: new Coverage(mAttrs.statements, mAttrs.coveredstatements),
                methods: new Coverage(mAttrs.methods, mAttrs.coveredmethods),
                branchs: new Coverage(mAttrs.conditionals, mAttrs.coveredconditionals),
              },
            })
          );

          return acc;
        },
        new Map<string, Folder>()
      )
  );
};

function getCloverFileName(file: CloverFileXML): string {
  return file._attributes.path || file._attributes.name;
}
