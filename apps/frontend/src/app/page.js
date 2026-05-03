/**
 * @fileoverview Root page — redirects authenticated users to dashboard,
 * unauthenticated users to login.
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default function RootPage() {
  const cookieStore = cookies();
  const hasToken = cookieStore.has('accessToken');

  if (hasToken) {
    redirect('/dashboard/dashboard');
  } else {
    redirect('/auth/login');
  }
}
