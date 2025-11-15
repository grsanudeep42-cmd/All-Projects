import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext'; // ✅ Import

function ProtectedLayout() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      router.replace('/');
    }
  }, [token, segments, isLoading, router]);

  if (isLoading) {
    return null;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider> {/* ✅ Wrap around router */}
        <ProtectedLayout />
      </NotificationProvider>
    </AuthProvider>
  );
}
