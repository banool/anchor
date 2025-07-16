import { Image } from 'expo-image';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to Anchor!</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* User Profile Section */}
      <ThemedView style={styles.profileContainer}>
        <ThemedText type="subtitle">Profile</ThemedText>
        <ThemedView style={styles.profileCard}>
          <ThemedView style={styles.profileHeader}>
            <ThemedView style={styles.avatarContainer}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <Ionicons name="person-circle" size={48} color="#007AFF" />
              )}
            </ThemedView>
            <ThemedView style={styles.userInfo}>
              <ThemedText type="defaultSemiBold">{user?.name || 'User'}</ThemedText>
              <ThemedText style={styles.email}>{user?.email}</ThemedText>
            </ThemedView>
          </ThemedView>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Getting Started</ThemedText>
        <ThemedText>
          Welcome to Anchor, your central hub for managing your child&apos;s medical journey.
          Use the tabs below to navigate:
        </ThemedText>
        <ThemedText>
          • <ThemedText type="defaultSemiBold">Home</ThemedText> - Overview and quick access
        </ThemedText>
        <ThemedText>
          • <ThemedText type="defaultSemiBold">Calendar</ThemedText> - Appointments and schedules
        </ThemedText>
        <ThemedText>
          • <ThemedText type="defaultSemiBold">Add Entry</ThemedText> - Quick entry creation
        </ThemedText>
        <ThemedText>
          • <ThemedText type="defaultSemiBold">To-Dos</ThemedText> - Task management
        </ThemedText>
        <ThemedText>
          • <ThemedText type="defaultSemiBold">Reports</ThemedText> - Medical reports and data
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileContainer: {
    gap: 8,
    marginVertical: 16,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userInfo: {
    flex: 1,
  },
  email: {
    opacity: 0.7,
    fontSize: 14,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  signOutText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
