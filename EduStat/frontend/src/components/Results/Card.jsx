export default function Card({ title, subtitle, icon: Icon, action, children, className = "" }) {
  return (
    <section className={`glass-card p-6 ${className}`}>
      {(title || action) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-heading text-xl font-semibold text-white">
              {Icon && <Icon size={20} className="text-teal" aria-hidden="true" />}
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
