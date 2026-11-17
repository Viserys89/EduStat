import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { VARIABLES, VAR_LABELS } from "../../config/analysis";
import { fmtAuto } from "../../utils/format";
import Card from "./Card";

const TICK = { fill: "#94a3b8", fontSize: 11 };

function BinTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/15 bg-[#1a2842] px-3 py-2 text-xs shadow-lg">
      <p className="text-ink-soft">{d.range}</p>
      <p className="font-medium text-white">{d.count} observasi</p>
    </div>
  );
}

function Histogram({ bins, label }) {
  const data = bins.map((b) => ({
    label: fmtAuto(b.start),
    range: `${fmtAuto(b.start)} - ${fmtAuto(b.end)}`,
    count: b.count,
  }));
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink-soft">{label}</p>
      <div className="h-44" role="img" aria-label={`Histogram ${label}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap={2}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="label" tick={TICK} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.15)" }} interval="preserveStartEnd" minTickGap={10} />
            <YAxis allowDecimals={false} tick={TICK} tickLine={false} axisLine={false} width={32} />
            <Tooltip cursor={{ fill: "rgba(255,255,255,0.06)" }} content={<BinTooltip />} />
            <Bar dataKey="count" fill="#38BDF8" fillOpacity={0.8} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function HistogramCard({ histograms }) {
  return (
    <Card title="Distribusi Data" subtitle="Histogram setiap variabel numerik (jumlah kelas mengikuti aturan Sturges).">
      <div className="grid gap-6 md:grid-cols-3">
        {VARIABLES.map((key) => (
          <Histogram key={key} bins={histograms[key]} label={VAR_LABELS[key]} />
        ))}
      </div>
    </Card>
  );
}
