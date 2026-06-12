import React from "react";

export function MccLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Subtle outer dashboard orbit */}
      <circle cx="50" cy="50" r="46" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.3" />
      
      {/* Layered Document Cards (representing Portfolio items) */}
      {/* Card 1 (Back) */}
      <rect x="42" y="16" width="30" height="42" rx="4" opacity="0.4" strokeWidth="2.5" />
      
      {/* Card 2 (Middle) */}
      <rect x="34" y="24" width="30" height="42" rx="4" opacity="0.7" strokeWidth="2.5" />
      
      {/* Main Card (Front - Dossier / Portfolio Folder) */}
      <rect x="22" y="34" width="36" height="46" rx="5" fill="none" strokeWidth="3.5" />
      
      {/* Folder Tab / Binder Clip */}
      <path d="M 32 34 L 32 28 C 32 26, 34 24, 37 24 L 43 24 C 46 24, 48 26, 48 28 L 48 34" strokeWidth="2.5" opacity="0.9" />
      
      {/* Dossier details: horizontal tracking lines */}
      <line x1="30" y1="46" x2="50" y2="46" strokeWidth="3" opacity="0.9" />
      <line x1="30" y1="54" x2="46" y2="54" strokeWidth="3" opacity="0.9" />
      <line x1="30" y1="62" x2="40" y2="62" strokeWidth="3" opacity="0.9" />
      
      {/* Verification / Success Badge (Circle + Checkmark) */}
      <circle cx="68" cy="68" r="14" className="text-mcc-crimson dark:text-mcc-gold" fill="currentColor" stroke="none" />
      <path d="M 62 68 L 66 72 L 74 64" stroke="currentColor" strokeWidth="3.5" className="text-white dark:text-slate-900" fill="none" />
    </svg>
  );
}
