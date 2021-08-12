export class Coverage {
  total: number;
  covered: number;
  percentual: number;
  constructor(total: number, covered: number) {
    this.total = total;
    this.covered = covered;
    if (this.total > 0) this.percentual = this.covered / this.total;
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
