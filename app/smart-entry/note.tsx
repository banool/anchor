import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createEntry } from '@/lib/database';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface NoteFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  isPinned: boolean;
  isPrivate: boolean;
}

export default function NoteFormScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    description: '',
    priority: 'medium',
    tags: [],
    isPinned: false,
    isPrivate: false,
  });

  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app, these would come from your database/state
  const existingTags = [
    'medical', 'oncology', 'hospital', 'home', 'medication', 'symptoms',
    'appointment', 'lab', 'dietician', 'social-worker', 'insurance',
    'side-effects', 'nutrition', 'sleep', 'mood', 'family', 'school'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#4CAF50' },
    { value: 'medium', label: 'Medium', color: '#FF9800' },
    { value: 'high', label: 'High', color: '#F44336' },
    { value: 'urgent', label: 'Urgent', color: '#9C27B0' }
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
      const entryData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        tags: formData.tags,
        userId: 'current-user-id', // Replace with actual user ID
        childId: 'current-child-id', // Replace with actual child ID
        pinnedAt: formData.isPinned ? new Date() : undefined,
        privateAt: formData.isPrivate ? new Date() : undefined,
        data: {
          noteType: 'general',
          createdVia: 'smart-entry'
        }
      };

      await createEntry(entryData);

      Alert.alert('Success', 'Note created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Failed to create note:', error);
      Alert.alert('Error', 'Failed to create note. Please try again.');
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
          New Note
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
            placeholder="Enter note title"
            placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
            Note Content
          </Text>
          <TextInput
            style={[styles.textArea, {
              backgroundColor: Colors[colorScheme ?? 'light'].background,
              color: Colors[colorScheme ?? 'light'].text,
              borderColor: Colors[colorScheme ?? 'light'].text + '20'
            }]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Enter your note content here..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
            multiline
            numberOfLines={6}
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

        {/* Note Options */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
            Note Options
          </Text>

          {/* Pin Note */}
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <IconSymbol name="pin" size={20} color={Colors[colorScheme ?? 'light'].text} />
              <Text style={[styles.optionText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Pin this note
              </Text>
              <Text style={[styles.optionDescription, { color: Colors[colorScheme ?? 'light'].text }]}>
                Pinned notes appear at the top
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, { backgroundColor: formData.isPinned ? '#4CAF50' : '#ccc' }]}
              onPress={() => setFormData(prev => ({ ...prev, isPinned: !prev.isPinned }))}
            >
              <View style={[
                styles.toggleHandle,
                { transform: [{ translateX: formData.isPinned ? 20 : 0 }] }
              ]} />
            </TouchableOpacity>
          </View>

          {/* Private Note */}
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <IconSymbol name="lock" size={20} color={Colors[colorScheme ?? 'light'].text} />
              <Text style={[styles.optionText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Private note
              </Text>
              <Text style={[styles.optionDescription, { color: Colors[colorScheme ?? 'light'].text }]}>
                Only you can see this note
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, { backgroundColor: formData.isPrivate ? '#4CAF50' : '#ccc' }]}
              onPress={() => setFormData(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
            >
              <View style={[
                styles.toggleHandle,
                { transform: [{ translateX: formData.isPrivate ? 20 : 0 }] }
              ]} />
            </TouchableOpacity>
          </View>
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
    minHeight: 120,
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
    backgroundColor: '#2196F3',
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
    backgroundColor: '#2196F3',
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
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 'auto',
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
});
