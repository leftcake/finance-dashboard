'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardClient, {
  type DashboardUser,
} from '@/components/dashboard/DashboardClient';
import { getCurrentUser } from '@/lib/auth';
import { profileSlugFromUser, slugMatchesUser } from '@/lib/user-slug';

export default function UserDashboardRoute() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.username === 'string' ? params.username : '';
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.replace('/login');
      return;
    }
    if (!slugMatchesUser(slug, u)) {
      router.replace(`/${profileSlugFromUser(u)}`);
      return;
    }
    setUser({
      id: u.id,
      email: u.email,
      username: u.username,
    });
    setReady(true);
  }, [slug, router]);

  if (!ready || !user) {
    return (
      <div className="container-custom flex min-h-screen items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  return <DashboardClient user={user} />;
}
