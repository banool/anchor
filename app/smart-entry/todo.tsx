import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createEntry, createReminder } from '@/lib/database';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface TodoFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  assignedToId?: string;
  dueDate?: Date;
  isRecurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly';
}

export default function TodoFormScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [formData, setFormData] = useState<TodoFormData>({
    title: '',
    description: '',
    priority: 'medium',
    tags: [],
    isRecurring: false,
  });

  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app, these would come from your database/state
  const existingTags = [
    'medical', 'oncology', 'hospital', 'home', 'urgent', 'medication',
    'appointment', 'lab', 'dietician', 'social-worker', 'insurance'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#4CAF50' },
    { value: 'medium', label: 'Medium', color: '#FF9800' },
    { value: 'high', label: 'High', color: '#F44336' },
    { value: 'urgent', label: 'Urgent', color: '#9C27B0' }
  ];

  const recurringTypes = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddExistingTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    setIsLoading(true);
    try {
      // Create the entry
      const entryData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        tags: formData.tags,
        dueDate: formData.dueDate,
        userId: 'current-user-id', // Replace with actual user ID
        childId: 'current-child-id', // Replace with actual child ID
        assignedToId: formData.assignedToId,
        data: {
          isRecurring: formData.isRecurring,
          recurringType: formData.recurringType
        }
      };

      await createEntry(entryData);

      // If recurring, also create a reminder
      if (formData.isRecurring && formData.recurringType) {
        await createReminder({
          title: formData.title,
          description: formData.description,
          type: 'task',
          frequency: formData.recurringType,
          resetOnCompletion: true,
          nextDueAt: formData.dueDate,
          assignedTo: formData.assignedToId,
          childId: 'current-child-id' // Replace with actual child ID
        });
      }

      Alert.alert('Success', 'To-Do created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Failed to create todo:', error);
      Alert.alert('Error', 'Failed to create to-do. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          New To-Do
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          <Text style={[styles.saveButton, { opacity: isLoading ? 0.5 : 1 }]}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
            Title *
          </Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: Colors[colorScheme ?? 'light'].background,
              color: Colors[colorScheme ?? 'light'].text,
              borderColor: Colors[colorScheme ?? 'light'].text + '20'
            }]}
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholder="Enter task title"
            placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
            Description
          </Text>
          <TextInput
            style={[styles.textArea, {
              backgroundColor: Colors[colorScheme ?? 'light'].background,
              color: Colors[colorScheme ?? 'light'].text,
              borderColor: Colors[colorScheme ?? 'light'].text + '20'
            }]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Enter task description"
            placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Priority Selection */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
            Priority
          </Text>
          <View style={styles.priorityContainer}>
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority.value}
                style={[
                  styles.priorityButton,
                  {
                    backgroundColor: formData.priority === priority.value ? priority.color : 'transparent',
                    borderColor: priority.color
                  }
                ]}
                onPress={() => setFormData(prev => ({ ...prev, priority: priority.value as any }))}
              >
                <Text style={[
                  styles.priorityText,
                  { color: formData.priority === priority.value ? 'white' : priority.color }
                ]}>
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tags Section */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
            Tags
          </Text>

          {/* Current Tags */}
          <View style={styles.tagsContainer}>
            {formData.tags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.tag}
                onPress={() => handleRemoveTag(tag)}
              >
                <Text style={styles.tagText}>{tag}</Text>
                <IconSymbol name="xmark" size={14} color="white" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Add New Tag */}
          <View style={styles.addTagContainer}>
            <TextInput
              style={[styles.tagInput, {
                backgroundColor: Colors[colorScheme ?? 'light'].background,
                color: Colors[colorScheme ?? 'light'].text,
                borderColor: Colors[colorScheme ?? 'light'].text + '20'
              }]}
              value={newTag}
              onChangeText={setNewTag}
              placeholder="Add new tag"
              placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
              onSubmitEditing={handleAddTag}
            />
            <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
              <IconSymbol name="plus" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Existing Tags */}
          <Text style={[styles.subLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
            Existing Tags:
          </Text>
          <View style={styles.existingTagsContainer}>
            {existingTags.filter(tag => !formData.tags.includes(tag)).map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.existingTag}
                onPress={() => handleAddExistingTag(tag)}
              >
                <Text style={[styles.existingTagText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {tag}
                </Text>
                <IconSymbol name="plus" size={14} color={Colors[colorScheme ?? 'light'].text} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recurring Section */}
        <View style={styles.inputGroup}>
          <View style={styles.recurringHeader}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Recurring Task
            </Text>
            <TouchableOpacity
              style={[styles.toggle, { backgroundColor: formData.isRecurring ? '#4CAF50' : '#ccc' }]}
              onPress={() => setFormData(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}
            >
              <View style={[
                styles.toggleHandle,
                { transform: [{ translateX: formData.isRecurring ? 20 : 0 }] }
              ]} />
            </TouchableOpacity>
          </View>

          {formData.isRecurring && (
            <View style={styles.recurringOptions}>
              <Text style={[styles.subLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                Repeat every:
              </Text>
              <View style={styles.recurringButtonsContainer}>
                {recurringTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.recurringButton,
                      {
                        backgroundColor: formData.recurringType === type.value ? '#4CAF50' : 'transparent',
                        borderColor: '#4CAF50'
                      }
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, recurringType: type.value as any }))}
                  >
                    <Text style={[
                      styles.recurringButtonText,
                      { color: formData.recurringType === type.value ? 'white' : '#4CAF50' }
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  saveButton: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  addTagContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  addTagButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  existingTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  existingTag: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  existingTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  recurringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleHandle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
  },
  recurringOptions: {
    marginTop: 16,
  },
  recurringButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  recurringButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  recurringButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
