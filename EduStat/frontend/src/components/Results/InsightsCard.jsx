export default function InsightsCard({ items }) {
  if (!items?.length) return null;
  return (
    <section className="rounded-[28px] border border-sky/25 bg-sky/[0.06] p-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-sky" aria-hidden="true" />
        Insight
      </h2>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft">
        {items.map((text, i) => (
          <li key={i}>{text}</li>
        ))}
      </ul>
    </section>
  );
}
