import type { ServiceIcon } from "@/lib/services/service-theme";

/** Line icons drawn on a 24×24 grid, stroke = currentColor. */
const PATHS: Record<ServiceIcon, React.ReactNode> = {
  sprout: (
    <>
      <path d="M12 20v-8" />
      <path d="M12 12c0-3 2-5 6-5 0 3-2 5-6 5Z" />
      <path d="M12 14c0-3-2-5-6-5 0 3 2 5 6 5Z" />
      <path d="M6 20h12" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="18" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <path d="M8.4 18H14a3.6 3.6 0 0 0 0-7.2H10A3.6 3.6 0 0 1 10 3.6h5.6" />
    </>
  ),
  truck: (
    <>
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="17" cy="18" r="1.8" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 6-14 15-14 0 9-6 14-15 14Z" />
      <path d="M5 19c3-5 7-8 12-9" />
    </>
  ),
  badge: (
    <>
      <path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6Z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.3-4.3" />
    </>
  ),
  seal: (
    <>
      <path d="m12 2 2.4 2 3-.6.6 3 2 2.4-2 2.4-.6 3-3-.6L12 22l-2.4-2-3 .6-.6-3-2-2.4 2-2.4.6-3 3 .6Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  droplet: (
    <>
      <path d="M12 3c3.5 4 6 7 6 10a6 6 0 0 1-12 0c0-3 2.5-6 6-10Z" />
      <path d="M5 4 19 19" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21c4-4.5 7-8 7-11a7 7 0 0 0-14 0c0 3 3 6.5 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  handshake: (
    <>
      <path d="m3 12 4-4 5 4 2-2 4 3-4 5-3-3" />
      <path d="m3 12 3 3M17 8l4-1" />
    </>
  ),
  flask: (
    <>
      <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3" />
      <path d="M7.5 15h9" />
    </>
  ),
};

export function ServiceIcon({
  name,
  className,
  strokeWidth = 1.6,
}: {
  name: ServiceIcon;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}
