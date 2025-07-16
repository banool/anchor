import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AddEntryScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to smart entry system
    router.push('/smart-entry');
  }, [router]);

  return null;
}
