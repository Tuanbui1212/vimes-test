'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { APP_PATHS } from '@/constants';

export default function DepartmentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(APP_PATHS.SUPPLIERS.ROOT);
  }, [router]);

  return null;
}
