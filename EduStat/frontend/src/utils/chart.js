function niceStep(raw) {
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  return ([1, 2, 5, 10].find((m) => norm <= m) ?? 10) * mag;
}

const clean = (v) => Number(v.toFixed(10));

// Domain dan tick sumbu yang "rapi" untuk sekumpulan nilai.
export function axisScale(values, targetTicks = 5) {
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const pad = (max - min) * 0.05;
  const step = niceStep((max - min + 2 * pad) / targetTicks);
  const lo = Math.floor((min - pad) / step) * step;
  const hi = Math.ceil((max + pad) / step) * step;
  const ticks = [];
  for (let v = lo; v <= hi + step / 1000; v += step) ticks.push(clean(v));
  return { domain: [clean(lo), clean(hi)], ticks };
}

export const pointsFrom = (rows, xKey, yKey) => rows.map((r) => ({ x: r[xKey], y: r[yKey] }));
