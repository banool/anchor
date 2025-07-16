import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SmartEntryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const entryTypes = [
    {
      id: 'todo',
      title: 'To-Do',
      description: 'Add a task or recurring reminder',
      icon: 'checklist',
      color: '#4CAF50',
      route: '/smart-entry/todo'
    },
    {
      id: 'note',
      title: 'General Note',
      description: 'Add a general note or observation',
      icon: 'note.text',
      color: '#2196F3',
      route: '/smart-entry/note'
    },
    {
      id: 'question',
      title: 'Question for Specialist',
      description: 'Ask a question for a specific specialist',
      icon: 'questionmark.circle',
      color: '#FF9800',
      route: '/smart-entry/question'
    },
    {
      id: 'medication',
      title: 'Took Medication',
      description: 'Log medication taken or add new medication',
      icon: 'pills',
      color: '#9C27B0',
      route: '/smart-entry/medication'
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Add New Entry
        </Text>
        <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          What would you like to add?
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {entryTypes.map((entry) => (
          <TouchableOpacity
            key={entry.id}
            style={[styles.optionCard, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
            onPress={() => router.push(entry.route as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: entry.color }]}>
              <IconSymbol
                name={entry.icon as any}
                size={32}
                color="white"
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.optionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                {entry.title}
              </Text>
              <Text style={[styles.optionDescription, { color: Colors[colorScheme ?? 'light'].text }]}>
                {entry.description}
              </Text>
            </View>
            <IconSymbol
              name="chevron.right"
              size={20}
              color={Colors[colorScheme ?? 'light'].text}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={[styles.cancelText, { color: Colors[colorScheme ?? 'light'].text }]}>
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  optionsContainer: {
    flex: 1,
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
