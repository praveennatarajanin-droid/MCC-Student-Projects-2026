import type { Metadata } from 'next';
import PublicPortfolioClient from './PublicPortfolioClient';

interface PageProps {
  params: Promise<{ username: string }>;
}

// ── Server-side per-student SEO metadata ──────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5129'}/api/public/student/${username}`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      return {
        title: 'Portfolio Not Found | MCC Student Portfolios',
        description: 'This student portfolio does not exist or is awaiting approval.',
      };
    }

    const profile = await res.json();
    const name: string = profile.user?.name ?? username;
    const dept: string = profile.department?.name ?? 'Madras Christian College';
    const headline: string = profile.headline || `Student at ${dept}`;
    const bio: string = profile.bio
      ? profile.bio.slice(0, 160)
      : `Explore ${name}'s verified academic portfolio from ${dept} at Madras Christian College.`;

    const skills: string[] = profile.skills
      ? profile.skills.split(';').filter(Boolean).slice(0, 6)
      : [];

    const canonicalUrl = `https://mccportfolio.edu/student/${username}`;

    return {
      title: `${name} — ${headline} | MCC Portfolio`,
      description: bio,
      keywords: [name, dept, 'MCC', 'Madras Christian College', 'student portfolio', ...skills].join(', '),
      authors: [{ name }],
      openGraph: {
        title: `${name} | MCC Student Portfolio`,
        description: bio,
        url: canonicalUrl,
        siteName: 'MCC Student Portfolios',
        locale: 'en_IN',
        type: 'profile',
      },
      twitter: {
        card: 'summary',
        title: `${name} | MCC Portfolio`,
        description: bio,
      },
      alternates: {
        canonical: canonicalUrl,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch {
    return {
      title: `${username} | MCC Student Portfolio`,
      description: 'Student portfolio from Madras Christian College.',
    };
  }
}

// ── Page (renders client component) ──────────────────────────────────────────
export default async function PublicPortfolioPage({ params }: PageProps) {
  const { username } = await params;
  return <PublicPortfolioClient username={username} />;
}
