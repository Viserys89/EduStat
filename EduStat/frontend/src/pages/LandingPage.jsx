import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const POINTS = [[3, 87], [66, 46], [131, 70], [194, 3], [265, 25]];

function ChartDecoration({ className = "" }) {
  return (
    <svg
      viewBox="0 0 268 90"
      className={`pointer-events-none absolute hidden w-[268px] md:block ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <polyline
        points={POINTS.map((p) => p.join(",")).join(" ")}
        stroke="#38BDF8"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />
      {POINTS.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#38BDF8" fillOpacity="0.6" />
      ))}
    </svg>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="glass-hero relative flex min-h-[620px] w-full max-w-[1104px] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center md:min-h-[700px]">
        <ChartDecoration className="right-6 top-10" />
        <ChartDecoration className="bottom-14 left-7" />

        <div className="relative flex flex-col items-center">
          <Logo />
          <span className="mt-2 font-heading text-[32px] font-semibold leading-none text-white">
            EduStat
          </span>

          <h1 className="mt-10 font-heading text-4xl font-bold leading-[1.15] tracking-[-0.03em] text-white sm:text-5xl lg:text-[64px]">
            Understand Your Data.
            <span className="block text-sky">Discover Your Insights.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-ink-soft sm:text-lg">
            Transform educational data into meaningful statistical insights.
          </p>

          <button type="button" onClick={() => navigate("/input")} className="btn-primary mt-12">
            Mulai Analisis
          </button>
        </div>
      </section>
    </main>
  );
}