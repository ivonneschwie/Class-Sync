import type { SVGProps } from "react";

// The original logo
function LogoOld(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M10.24 6.5a8 8 0 0 0-4.24 6" />
      <path d="m16 6-2.5 2.5" />
      <path d="M13.76 9.5a8 8 0 0 1 4.24 6" />
      <path d="M3 10h18" />
      <path d="M8 18v-4" />
      <path d="M16 18v-4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
    </svg>
  );
}

/**
 * Logo Option 1 (Default): A calendar with a sync icon, representing scheduled synchronization.
 */
export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M12 14v-1a2 2 0 0 1 2-2h1" />
      <path d="M15 19v-1a2 2 0 0 0-2-2h-1" />
      <path d="M12 19h-1a2 2 0 0 1-2-2v-1" />
      <path d="M9 14h1a2 2 0 0 0 2-2v-1" />
    </svg>
  );
}

/**
 * Logo Option 2: A book with a clock face, representing study and time management.
 */
export function LogoOption2(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="10" x2="12" y2="12" />
      <line x1="12" y1="12" x2="14" y2="14" />
    </svg>
  );
}

/**
 * Logo Option 3: A calendar with a checkmark, representing completed tasks or a clear schedule.
 */
export function LogoOption3(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="m9 16 2 2 4-4" />
    </svg>
  );
}
