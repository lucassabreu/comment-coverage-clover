export class Coverage {
  total: number;
  covered: number;
  percentual: number | undefined;
  constructor(total: number, covered: number) {
    this.total = Number(total);
    this.covered = Number(covered);
    this.percentual = this.total == 0 ? undefined : this.covered / this.total;
  }
}

export interface Metrics {
  lines: Coverage;
  methods: Coverage;
  branchs: Coverage;
}

export interface File {
  name: string;
  metrics: Metrics;
}

export interface Stats {
  total: Metrics;
  folders: Map<
    string,
    {
      name: string;
      files: File[];
    }
  >;
}
