import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createEntry } from '@/lib/database';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface QuestionFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  specialistId?: string;
  assignedToId?: string;
  dueDate?: Date;
  isUrgent: boolean;
}

export default function QuestionFormScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [formData, setFormData] = useState<QuestionFormData>({
    title: '',
    description: '',
    priority: 'medium',
    tags: [],
    isUrgent: false,
  });

  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app, these would come from your database/state
  const existingTags = [
    'oncology', 'surgery', 'dietician', 'social-worker', 'pharmacy',
    'radiology', 'laboratory', 'nursing', 'psychology', 'physical-therapy',
    'medication', 'side-effects', 'nutrition', 'pain-management', 'insurance'
  ];

  const specialists = [
    { id: '1', name: 'Dr. Michael Chen', specialty: 'Pediatric Oncology', type: 'doctor' },
    { id: '2', name: 'Dr. Sarah Williams', specialty: 'Pediatric Surgery', type: 'surgeon' },
    { id: '3', name: 'Maria Rodriguez', specialty: 'Clinical Nutrition', type: 'dietician' },
    { id: '4', name: 'James Thompson', specialty: 'Pharmacy', type: 'pharmacist' },
    { id: '5', name: 'Dr. Lisa Park', specialty: 'Radiology', type: 'radiologist' },
    { id: '6', name: 'Anna Foster', specialty: 'Social Work', type: 'social-worker' },
    { id: '7', name: 'Dr. Robert Kim', specialty: 'Psychology', type: 'psychologist' },
  ];

  const teamMembers = [
    { id: 'parent1', name: 'Sarah Johnson', role: 'Parent' },
    { id: 'parent2', name: 'Mike Johnson', role: 'Parent' },
    { id: 'nurse1', name: 'Emily Rodriguez', role: 'Nurse' },
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
      Alert.alert('Error', 'Please enter a question title');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter your question');
      return;
    }

    if (!formData.specialistId) {
      Alert.alert('Error', 'Please select a specialist');
      return;
    }

    setIsLoading(true);
    try {
      const selectedSpecialist = specialists.find(s => s.id === formData.specialistId);

      const entryData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        tags: [...formData.tags, selectedSpecialist?.specialty.toLowerCase().replace(/\s+/g, '-') || ''],
        userId: 'current-user-id', // Replace with actual user ID
        childId: 'current-child-id', // Replace with actual child ID
        assignedToId: formData.assignedToId,
        dueDate: formData.dueDate,
        data: {
          questionType: 'specialist',
          specialistId: formData.specialistId,
          specialistName: selectedSpecialist?.name,
          specialistSpecialty: selectedSpecialist?.specialty,
          isUrgent: formData.isUrgent,
          status: 'pending',
          createdVia: 'smart-entry'
        }
      };

      await createEntry(entryData);

      Alert.alert('Success', 'Question created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Failed to create question:', error);
      Alert.alert('Error', 'Failed to create question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSpecialist = specialists.find(s => s.id === formData.specialistId);

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Question for Specialist
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
            Question Title *
          </Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: Colors[colorScheme ?? 'light'].background,
              color: Colors[colorScheme ?? 'light'].text,
              borderColor: Colors[colorScheme ?? 'light'].text + '20'
            }]}
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholder="Enter question title"
            placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
          />
        </View>

        {/* Question Content */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
            Question Content *
          </Text>
          <TextInput
            style={[styles.textArea, {
              backgroundColor: Colors[colorScheme ?? 'light'].background,
              color: Colors[colorScheme ?? 'light'].text,
              borderColor: Colors[colorScheme ?? 'light'].text + '20'
            }]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Enter your question details here..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Specialist Selection */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
            Select Specialist *
          </Text>
          {selectedSpecialist && (
            <View style={styles.selectedSpecialist}>
              <View style={styles.specialistInfo}>
                <Text style={[styles.specialistName, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {selectedSpecialist.name}
                </Text>
                <Text style={[styles.specialistSpecialty, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {selectedSpecialist.specialty}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setFormData(prev => ({ ...prev, specialistId: undefined }))}>
                <IconSymbol name="xmark.circle" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialistList}>
            {specialists.map((specialist) => (
              <TouchableOpacity
                key={specialist.id}
                style={[
                  styles.specialistCard,
                  {
                    backgroundColor: formData.specialistId === specialist.id ? '#FF9800' : Colors[colorScheme ?? 'light'].background,
                    borderColor: formData.specialistId === specialist.id ? '#FF9800' : Colors[colorScheme ?? 'light'].text + '20'
                  }
                ]}
                onPress={() => setFormData(prev => ({ ...prev, specialistId: specialist.id }))}
              >
                <Text style={[
                  styles.specialistCardName,
                  { color: formData.specialistId === specialist.id ? 'white' : Colors[colorScheme ?? 'light'].text }
                ]}>
                  {specialist.name}
                </Text>
                <Text style={[
                  styles.specialistCardSpecialty,
                  { color: formData.specialistId === specialist.id ? 'white' : Colors[colorScheme ?? 'light'].text }
                ]}>
                  {specialist.specialty}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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

        {/* Assign to Someone */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
            Assign to Someone (Optional)
          </Text>
          <Text style={[styles.subLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
            Who should ask this question?
          </Text>
          <View style={styles.assigneeContainer}>
            <TouchableOpacity
              style={[
                styles.assigneeButton,
                {
                  backgroundColor: !formData.assignedToId ? '#4CAF50' : 'transparent',
                  borderColor: '#4CAF50'
                }
              ]}
              onPress={() => setFormData(prev => ({ ...prev, assignedToId: undefined }))}
            >
              <Text style={[
                styles.assigneeText,
                { color: !formData.assignedToId ? 'white' : '#4CAF50' }
              ]}>
                I&apos;ll ask
              </Text>
            </TouchableOpacity>
            {teamMembers.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={[
                  styles.assigneeButton,
                  {
                    backgroundColor: formData.assignedToId === member.id ? '#4CAF50' : 'transparent',
                    borderColor: '#4CAF50'
                  }
                ]}
                onPress={() => setFormData(prev => ({ ...prev, assignedToId: member.id }))}
              >
                <Text style={[
                  styles.assigneeText,
                  { color: formData.assignedToId === member.id ? 'white' : '#4CAF50' }
                ]}>
                  {member.name}
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
            Common Tags:
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

        {/* Urgent Toggle */}
        <View style={styles.inputGroup}>
          <View style={styles.urgentHeader}>
            <View style={styles.urgentInfo}>
              <IconSymbol name="exclamationmark.triangle" size={20} color="#FF6B6B" />
              <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                Mark as Urgent
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, { backgroundColor: formData.isUrgent ? '#FF6B6B' : '#ccc' }]}
              onPress={() => setFormData(prev => ({ ...prev, isUrgent: !prev.isUrgent }))}
            >
              <View style={[
                styles.toggleHandle,
                { transform: [{ translateX: formData.isUrgent ? 20 : 0 }] }
              ]} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.subLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
            Urgent questions will be highlighted and prioritized
          </Text>
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
    opacity: 0.8,
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  selectedSpecialist: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  specialistInfo: {
    flex: 1,
  },
  specialistName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  specialistSpecialty: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  specialistList: {
    marginTop: 8,
  },
  specialistCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
    minWidth: 160,
  },
  specialistCardName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  specialistCardSpecialty: {
    fontSize: 12,
    opacity: 0.8,
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
  assigneeContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  assigneeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  assigneeText: {
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
    backgroundColor: '#FF9800',
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
    backgroundColor: '#FF9800',
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
  urgentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urgentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
