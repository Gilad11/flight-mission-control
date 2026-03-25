'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect /history to /archive
export default function HistoryRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/archive');
  }, [router]);
  return null;
}
