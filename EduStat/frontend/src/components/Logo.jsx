import logoSvg from "../assets/Dual-Tone Graduation Analytics Logos 2.svg";

export default function Logo({ className = "h-16 w-20" }) {
  return (
    <img
      src={logoSvg}
      alt="EduStat Logo"
      className={`${className} object-contain`}
    />
  );
}