import Card from "./Card";
import CorrelationGauge from "./CorrelationGauge";

export default function PearsonCard({ pair, disclaimer }) {
  return (
    <Card title="Korelasi Pearson">
      <CorrelationGauge result={pair.pearson} pairLabel={`${pair.x_label} vs ${pair.y_label}`} />
      <p className="mt-6 border-t border-white/10 pt-5 text-xs italic leading-relaxed text-slate-300">
        &ldquo;{disclaimer}&rdquo;
      </p>
    </Card>
  );
}
