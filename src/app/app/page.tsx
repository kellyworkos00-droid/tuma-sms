import type { Metadata } from 'next';

import { Dashboard } from '@/components/Dashboard';
import { providerMode, senderId } from '@/lib/provider';

export const metadata: Metadata = { title: 'Send', robots: { index: false, follow: false } };

// Read on every visit. Built as a static page, this would keep saying "demo" after going live.
export const dynamic = 'force-dynamic';

export default function AppPage() {
  return <Dashboard mode={providerMode()} sender={senderId()} />;
}
