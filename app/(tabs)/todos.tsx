import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ScrollView, StyleSheet } from 'react-native';

export default function TodosScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title">To-Dos</ThemedText>
        <ThemedText type="subtitle">Task Management</ThemedText>

        <ThemedView style={styles.section}>
          <ThemedText>
            This is where you&apos;ll manage your to-do items, assign tasks to team members,
            and track progress on important activities.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold">Coming Soon:</ThemedText>
          <ThemedText>• Task creation and assignment</ThemedText>
          <ThemedText>• Priority levels and due dates</ThemedText>
          <ThemedText>• Push notifications for assignments</ThemedText>
          <ThemedText>• Recurring task support</ThemedText>
          <ThemedText>• Task completion tracking</ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  section: {
    gap: 8,
    marginBottom: 16,
  },
});
