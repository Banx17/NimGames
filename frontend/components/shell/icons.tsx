import type { SVGProps } from "react";

// NimGames inline icon set — no icon package, no dependencies.
// All icons inherit `currentColor` so parents control the tint.

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 10.5 12 3.5l8.5 7v9.5a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z" />
    </svg>
  );
}

export function GamesIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WalletIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M16 12.2h5M3 9.2h11" />
      <circle cx="16.5" cy="12.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MoreIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="5.5" cy="5.5" r="1.4" />
      <circle cx="18.5" cy="5.5" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="5.5" cy="18.5" r="1.4" />
      <circle cx="18.5" cy="18.5" r="1.4" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5c.4 3.9 1.5 5.7 4 6.5-2.5.8-3.6 2.5-4 6.5-.4-4-1.5-5.7-4-6.5 2.5-.8 3.6-2.6 4-6.5Z" />
      <path d="M18.5 14c.2 2 1 3 2.5 3.5-1.5.5-2.3 1.5-2.5 3.5-.2-2-1-3-2.5-3.5 1.5-.5 2.3-1.5 2.5-3.5Z" />
    </svg>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M13 2.5 4.5 13.5h6l-.8 8L18.5 10h-6l.5-7.5Z" />
    </svg>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5.5H4.5v1.5A3 3 0 0 0 7 10M17 5.5h2.5V7A3 3 0 0 1 17 10" />
      <path d="M12 14v3.5M9 20.5h6M10.5 17.5h3v3h-3z" />
    </svg>
  );
}

export function LogoPlaceholder(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="4" width="17" height="16" rx="5" />
      <path d="M12 7.5c.5 2.6 1.5 3.8 3.5 4.3-2 .5-3 1.7-3.5 4.4-.5-2.7-1.5-3.9-3.5-4.4 2-.5 3-1.7 3.5-4.3Z" />
    </svg>
  );
}
