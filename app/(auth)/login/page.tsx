'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';
import { fetchSessionUser } from '@/lib/auth';
import { profileSlugFromUser } from '@/lib/user-slug';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await fetchSessionUser();
      if (cancelled) return;
      if (u) {
        router.replace(`/${profileSlugFromUser(u)}`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="container-custom flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="text-3xl font-bold text-[var(--text-primary)]">
          Finance Dashboard
        </Link>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Personal financial statement tracker
        </p>
      </div>
      <AuthForm />
    </div>
  );
}
