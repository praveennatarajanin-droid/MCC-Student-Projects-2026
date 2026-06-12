'use client';

import { useEffect, useState, ReactNode } from 'react';

/**
 * ClientOnly — renders children only after client-side mount.
 * Use this to wrap pages/components that suffer hydration mismatches
 * caused by browser extensions injecting attributes (e.g. bis_skin_checked).
 */
export default function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
