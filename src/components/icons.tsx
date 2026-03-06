import Image from 'next/image';
import type { SVGProps } from "react";
import logoImg from '@/app/web-app-manifest-512x512.png';


/**
 * Logo component using the web-app-manifest-512x512.png image.
 */
export function Logo({ className, ...props }: { className?: string } & any) {
  return (
    <div className={className} {...props}>
      <Image 
        src={logoImg}
        alt="ClassSync Logo" 
        width={80} 
        height={80} 
        priority
        className="object-contain w-full h-full"
      />
    </div>
  );
}

// Keeping the other options as SVGs just in case
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
