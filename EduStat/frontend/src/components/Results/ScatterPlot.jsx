import { useMemo } from "react";
import { CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { axisScale } from "../../utils/chart";
import { fmtAuto } from "../../utils/format";

const TICK = { fill: "#94a3b8", fontSize: 12 };
const AXIS_LINE = { stroke: "rgba(255,255,255,0.15)" };
const AXIS_TITLE = { fill: "#94a3b8", fontSize: 12 };

function PointTooltip({ active, payload, xLabel, yLabel }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/15 bg-[#1a2842] px-3 py-2 text-xs shadow-lg">
      <p className="text-ink-soft">{xLabel}: <span className="font-medium text-white">{fmtAuto(p.x)}</span></p>
      <p className="text-ink-soft">{yLabel}: <span className="font-medium text-white">{fmtAuto(p.y)}</span></p>
    </div>
  );
}

/** Scatter plot; `line` (opsional) = dua titik garis regresi [{x, y}, {x, y}]. */
export default function ScatterPlot({ points, line, xLabel, yLabel, height = 320 }) {
  const { x, y } = useMemo(
    () => ({
      x: axisScale(points.map((p) => p.x)),
      y: axisScale([...points.map((p) => p.y), ...(line ?? []).map((p) => p.y)]),
    }),
    [points, line]
  );

  return (
    <div style={{ height }} role="img" aria-label={`Diagram pencar ${xLabel} terhadap ${yLabel}`}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 4 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" />
          <XAxis
            type="number" dataKey="x" name={xLabel}
            domain={x.domain} ticks={x.ticks} tickFormatter={fmtAuto}
            tick={TICK} tickLine={false} axisLine={AXIS_LINE}
            label={{ value: xLabel, position: "insideBottom", offset: -14, ...AXIS_TITLE }}
          />
          <YAxis
            type="number" dataKey="y" name={yLabel}
            domain={y.domain} ticks={y.ticks} tickFormatter={fmtAuto} width={56}
            tick={TICK} tickLine={false} axisLine={AXIS_LINE}
            label={{ value: yLabel, angle: -90, position: "insideLeft", offset: 6, ...AXIS_TITLE }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.25)" }}
            content={<PointTooltip xLabel={xLabel} yLabel={yLabel} />}
          />
          <Scatter data={points} fill="#38BDF8" fillOpacity={0.65} isAnimationActive={false} />
          {line && <ReferenceLine segment={line} stroke="#38BDF8" strokeWidth={2} ifOverflow="visible" />}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
