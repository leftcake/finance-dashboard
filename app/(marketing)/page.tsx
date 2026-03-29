'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchSessionUser } from '@/lib/auth';
import { profileSlugFromUser } from '@/lib/user-slug';

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await fetchSessionUser();
      if (cancelled) return;
      if (u) {
        router.replace(`/${profileSlugFromUser(u)}`);
      } else {
        setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="container-custom flex min-h-screen items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container-custom flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-3xl font-bold">Finance Dashboard</h1>
      <p className="mb-8 max-w-md text-[var(--text-secondary)]">
        Personal financial statement tracker — sign in to manage transactions, charts, and savings
        goals.
      </p>
      <Link
        href="/login"
        className="rounded-lg bg-[var(--text-primary)] px-6 py-3 font-medium text-[var(--bg-primary)] transition-opacity hover:opacity-80"
      >
        Sign in
      </Link>
    </div>
  );
}
