import { Info, TriangleAlert } from "lucide-react";
import Card from "./Card";

export default function NotesCard({ items, title = "Catatan dan Keterbatasan" }) {
  if (!items?.length) return null;
  return (
    <Card title={title} subtitle="Hal yang perlu diperhatikan saat membaca hasil analisis.">
      <ul className="space-y-3">
        {items.map((w, i) => {
          const warn = w.level === "warning";
          const Icon = warn ? TriangleAlert : Info;
          return (
            <li key={i} className="flex items-start gap-3 text-sm text-ink-soft">
              <Icon size={18} className={`mt-0.5 shrink-0 ${warn ? "text-warning" : "text-sky"}`} aria-hidden="true" />
              <span>{w.message}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
