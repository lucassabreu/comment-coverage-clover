export class Coverage {
  total: number;
  covered: number;
  percentual: number | undefined;
  constructor(total: number, covered: number) {
    this.total = Number(total);
    this.covered = Number(covered);
    this.percentual =
      this.total == 0
        ? undefined
        : parseFloat((this.covered / this.total).toFixed(4));
  }
}

export interface Metrics {
  lines: Coverage;
  methods: Coverage;
  branches: Coverage;
}

export interface File {
  name: string;
  metrics: Metrics;
}

export class Folder {
  constructor(public name: string, public files: File[] = []) {}

  push(...files: File[]): Folder {
    this.files.push(...files);
    return this;
  }

  get(name: string): File | null {
    const i = this.files.findIndex((f) => f.name === name);
    return i === -1 ? null : this.files[i];
  }
}

export class Stats {
  constructor(public total: Metrics, public folders: Map<string, Folder>) {}

  get(folder: string, file: string): File | null {
    return this.folders.get(folder)?.get(file);
  }
}
