import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ScrollView, StyleSheet } from 'react-native';

export default function ReportsScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title">Reports</ThemedText>
        <ThemedText type="subtitle">Medical Reports & Data</ThemedText>

        <ThemedView style={styles.section}>
          <ThemedText>
            Generate comprehensive reports and visualizations for your child&apos;s medical data,
            appointments, and progress tracking.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold">Coming Soon:</ThemedText>
          <ThemedText>• Growth charts and percentile tracking</ThemedText>
          <ThemedText>• Medication administration reports</ThemedText>
          <ThemedText>• Blood work and lab results visualization</ThemedText>
          <ThemedText>• Appointment summaries by specialist</ThemedText>
          <ThemedText>• Custom date range reporting</ThemedText>
          <ThemedText>• PDF export functionality</ThemedText>
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
