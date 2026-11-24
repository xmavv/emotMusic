import { randomInt, type Random } from "./random";

type Vectors = readonly (readonly number[])[];
type Pair = readonly [number, number];
type Pairs = { neighbors: Pair[]; midNear: Pair[]; further: Pair[] };

export type PacmapOptions = {
  nNeighbors?: number;
  midNearRatio?: number;
  furtherRatio?: number;
  learningRate?: number;
  random?: Random;
};

const phaseIterations = [100, 100, 250] as const;
const initialMidNearWeight = 1000;
const adamBeta1 = 0.9;
const adamBeta2 = 0.999;

export function pacmap(
  data: Vectors,
  {
    nNeighbors = 10,
    midNearRatio = 0.5,
    furtherRatio = 2,
    learningRate = 1,
    random = Math.random,
  }: PacmapOptions = {},
): [number, number][] {
  if (data.length < 3) return data.map(() => [0, 0]);

  const x = normalize(data);
  const neighborCount = Math.min(nNeighbors, x.length - 1);
  const neighbors = findScaledNeighbors(x, neighborCount);
  const pairs: Pairs = {
    neighbors: neighbors.flatMap((row, i) => row.map((j): Pair => [i, j])),
    midNear: sampleMidNearPairs(
      x,
      Math.max(1, Math.floor(neighborCount * midNearRatio)),
      random,
    ),
    further: sampleFurtherPairs(
      neighbors,
      Math.floor(neighborCount * furtherRatio),
      random,
    ),
  };

  return optimize(initializeWithPca(x, random), pairs, learningRate);
}

export function euclideanDistance(a: readonly number[], b: readonly number[]) {
  let sum = 0;
  for (let d = 0; d < a.length; d++) {
    sum += (a[d] - b[d]) ** 2;
  }

  return Math.sqrt(sum);
}

function normalize(data: Vectors) {
  let min = Infinity;
  let max = -Infinity;
  for (const row of data) {
    for (const value of row) {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }

  const span = max - min || 1;
  const x = data.map((row) => row.map((value) => (value - min) / span));
  const means = new Array<number>(x[0].length).fill(0);
  for (const row of x) {
    row.forEach((value, d) => (means[d] += value / x.length));
  }
  for (const row of x) {
    row.forEach((_, d) => (row[d] -= means[d]));
  }

  return x;
}

function findScaledNeighbors(x: number[][], neighborCount: number) {
  const candidateCount = Math.min(neighborCount + 50, x.length - 1);
  const candidates = x.map((row, i) => {
    const distances: { index: number; distance: number }[] = [];
    x.forEach((other, j) => {
      if (j !== i)
        distances.push({ index: j, distance: euclideanDistance(row, other) });
    });
    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, candidateCount);
  });

  const sigmas = candidates.map((row) => {
    const local = row.slice(3, 6);
    const mean = local.length
      ? local.reduce((sum, { distance }) => sum + distance, 0) / local.length
      : (row.at(-1)?.distance ?? 0);

    return Math.max(mean, 1e-10);
  });

  return candidates.map((row, i) => {
    const scaled = row.map(({ index, distance }) => ({
      index,
      distance: distance ** 2 / sigmas[i] / sigmas[index],
    }));
    scaled.sort((a, b) => a.distance - b.distance);

    return scaled.slice(0, neighborCount).map(({ index }) => index);
  });
}

function sampleMidNearPairs(x: number[][], count: number, random: Random) {
  const sampleSize = Math.min(6, x.length - 1);
  const pairs: Pair[] = [];

  x.forEach((row, i) => {
    for (let k = 0; k < count; k++) {
      const sampled = sampleIndices(
        x.length,
        sampleSize,
        random,
        (j) => j !== i,
      );
      const distances = sampled.map((j) => euclideanDistance(row, x[j]));
      const order = sampled.map((_, index) => index);
      order.sort((a, b) => distances[a] - distances[b]);
      pairs.push([i, sampled[order[Math.min(1, order.length - 1)]]]);
    }
  });

  return pairs;
}

function sampleFurtherPairs(
  neighbors: number[][],
  count: number,
  random: Random,
) {
  const n = neighbors.length;
  const pairs: Pair[] = [];

  neighbors.forEach((row, i) => {
    const excluded = new Set(row);
    const size = Math.min(count, n - 1 - excluded.size);
    const isAllowed = (j: number) => j !== i && !excluded.has(j);
    for (const j of sampleIndices(n, size, random, isAllowed)) {
      pairs.push([i, j]);
    }
  });

  return pairs;
}

function sampleIndices(
  n: number,
  size: number,
  random: Random,
  isAllowed: (index: number) => boolean,
) {
  const picked = new Set<number>();
  while (picked.size < size) {
    const index = randomInt(random, n);
    if (isAllowed(index)) picked.add(index);
  }

  return [...picked];
}

function initializeWithPca(x: number[][], random: Random) {
  const dims = x[0].length;
  const covariance = Array.from({ length: dims }, () =>
    new Array<number>(dims).fill(0),
  );
  for (const row of x) {
    for (let a = 0; a < dims; a++) {
      for (let b = 0; b < dims; b++) {
        covariance[a][b] += row[a] * row[b];
      }
    }
  }

  const components: number[][] = [];
  for (let c = 0; c < 2; c++) {
    let vector = Array.from({ length: dims }, () => random() - 0.5);
    for (let iteration = 0; iteration < 100; iteration++) {
      const next = covariance.map((row) => dot(row, vector));
      for (const component of components) {
        const projection = dot(next, component);
        component.forEach((value, d) => (next[d] -= projection * value));
      }

      const norm = Math.hypot(...next);
      if (norm === 0) break;
      vector = next.map((value) => value / norm);
    }
    components.push(vector);
  }

  return x.map((row) =>
    components.map((component) => 0.01 * dot(row, component)),
  );
}

function dot(a: readonly number[], b: readonly number[]) {
  let sum = 0;
  for (let d = 0; d < a.length; d++) {
    sum += a[d] * b[d];
  }

  return sum;
}

function optimize(
  initial: number[][],
  pairs: Pairs,
  learningRate: number,
): [number, number][] {
  const y = Float64Array.from(initial.flat());
  const gradient = new Float64Array(y.length);
  const m = new Float64Array(y.length);
  const v = new Float64Array(y.length);
  const totalIterations = phaseIterations.reduce<number>(
    (sum, count) => sum + count,
    0,
  );

  for (let iteration = 0; iteration < totalIterations; iteration++) {
    const weights = getPhaseWeights(iteration);
    gradient.fill(0);
    addPairGradients(y, gradient, pairs.neighbors, weights.neighbors, 10, 1);
    addPairGradients(y, gradient, pairs.midNear, weights.midNear, 10000, 1);
    addPairGradients(y, gradient, pairs.further, weights.further, 1, -1);

    const step =
      (learningRate * Math.sqrt(1 - adamBeta2 ** (iteration + 1))) /
      (1 - adamBeta1 ** (iteration + 1));
    for (let k = 0; k < y.length; k++) {
      m[k] += (1 - adamBeta1) * (gradient[k] - m[k]);
      v[k] += (1 - adamBeta2) * (gradient[k] ** 2 - v[k]);
      y[k] -= (step * m[k]) / (Math.sqrt(v[k]) + 1e-7);
    }
  }

  return initial.map((_, i) => [y[2 * i], y[2 * i + 1]]);
}

function getPhaseWeights(iteration: number) {
  const [first, second] = phaseIterations;
  if (iteration < first) {
    const progress = iteration / first;
    return {
      neighbors: 2,
      midNear: (1 - progress) * initialMidNearWeight + progress * 3,
      further: 1,
    };
  }
  if (iteration < first + second) {
    return { neighbors: 3, midNear: 3, further: 1 };
  }

  return { neighbors: 1, midNear: 0, further: 1 };
}

// Loss per pair is d / (scale + d) for attraction and 1 / (1 + d) for repulsion,
// where d = 1 + squared embedding distance.
function addPairGradients(
  y: Float64Array,
  gradient: Float64Array,
  pairs: readonly Pair[],
  weight: number,
  scale: number,
  direction: 1 | -1,
) {
  if (weight === 0) return;

  for (const [i, j] of pairs) {
    const dx = y[2 * i] - y[2 * j];
    const dy = y[2 * i + 1] - y[2 * j + 1];
    const distance = 1 + dx * dx + dy * dy;
    const coefficient =
      (direction * weight * 2 * scale) / (scale + distance) ** 2;
    gradient[2 * i] += coefficient * dx;
    gradient[2 * i + 1] += coefficient * dy;
    gradient[2 * j] -= coefficient * dx;
    gradient[2 * j + 1] -= coefficient * dy;
  }
}
