'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';

/** Wraps the app with NextAuth SessionProvider (must be a Client Component) */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
