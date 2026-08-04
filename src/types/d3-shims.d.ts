// d3-shape and d3-array ship no bundled types, and @types/d3-shape /
// @types/d3-array aren't installed. bklit's vendor chart primitives
// (pie-center-shell.tsx, series-path-utils.ts, time-series-chart-shell.tsx)
// import a handful of functions from them — these are minimal signatures
// covering only what those files actually call, not a full port of the
// real @types packages.
declare module "d3-shape" {
  export interface PieArcDatum<T> {
    data: T;
    value: number;
    index: number;
    startAngle: number;
    endAngle: number;
    padAngle: number;
  }

  export interface Pie<T> {
    (data: T[]): PieArcDatum<T>[];
    value(accessor: (d: T, i: number, data: T[]) => number): this;
    startAngle(angle: number | ((data: T[]) => number)): this;
    endAngle(angle: number | ((data: T[]) => number)): this;
    padAngle(angle: number | ((data: T[]) => number)): this;
    sort(comparator: ((a: T, b: T) => number) | null): this;
  }
  export function pie<T = unknown>(): Pie<T>;

  export interface Line<T> {
    (data: T[]): string | null;
    x(accessor: (d: T, i: number, data: T[]) => number): this;
    y(accessor: (d: T, i: number, data: T[]) => number): this;
    curve(curveFactory: unknown): this;
  }
  export function line<T = [number, number]>(): Line<T>;
}

declare module "d3-array" {
  export interface Bisector<T, U> {
    left(array: T[], x: U, lo?: number, hi?: number): number;
    right(array: T[], x: U, lo?: number, hi?: number): number;
    center(array: T[], x: U, lo?: number, hi?: number): number;
  }
  export function bisector<T, U>(accessor: (d: T) => U): Bisector<T, U>;
  export function extent<T>(
    array: readonly T[],
    accessor: (d: T, i: number, array: readonly T[]) => number
  ): [number, number] | [undefined, undefined];
}
