import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createEntry, createMedication, logMedication } from '@/lib/database';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface MedicationFormData {
  mode: 'log' | 'add';
  existingMedicationId?: string;
  medicationName: string;
  dosage: string;
  timing: string;
  frequency?: string;
  notes: string;
  tags: string[];
  administeredBy: string;
  administeredAt: Date;
}

export default function MedicationFormScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [formData, setFormData] = useState<MedicationFormData>({
    mode: 'log',
    medicationName: '',
    dosage: '',
    timing: '',
    notes: '',
    tags: [],
    administeredBy: '',
    administeredAt: new Date(),
  });

  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app, these would come from your database/state
  const existingMedications = [
    { id: '1', name: 'Mercaptopurine', dosage: '25mg', timing: 'Evening with food', frequency: 'daily' },
    { id: '2', name: 'Methotrexate', dosage: '15mg', timing: 'Monday morning', frequency: 'weekly' },
    { id: '3', name: 'Ondansetron', dosage: '4mg', timing: 'As needed', frequency: 'as_needed' },
    { id: '4', name: 'Prednisone', dosage: '10mg', timing: 'Morning with food', frequency: 'daily' },
    { id: '5', name: 'Leucovorin', dosage: '25mg', timing: 'Tuesday morning', frequency: 'weekly' },
  ];

  const existingTags = [
    'chemotherapy', 'anti-nausea', 'steroid', 'antibiotic', 'pain-relief',
    'rescue-medication', 'oral', 'injection', 'IV', 'PRN', 'scheduled',
    'morning', 'evening', 'with-food', 'empty-stomach'
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'as_needed', label: 'As Needed (PRN)' },
  ];

  const teamMembers = [
    { id: 'parent1', name: 'Sarah Johnson', role: 'Parent' },
    { id: 'parent2', name: 'Mike Johnson', role: 'Parent' },
    { id: 'nurse1', name: 'Emily Rodriguez', role: 'Nurse' },
    { id: 'myself', name: 'Myself', role: 'Current User' },
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

  const handleMedicationSelect = (medication: any) => {
    setFormData(prev => ({
      ...prev,
      existingMedicationId: medication.id,
      medicationName: medication.name,
      dosage: medication.dosage,
      timing: medication.timing,
      frequency: medication.frequency,
    }));
  };

  const handleSave = async () => {
    if (!formData.medicationName.trim()) {
      Alert.alert('Error', 'Please enter medication name');
      return;
    }

    if (!formData.dosage.trim()) {
      Alert.alert('Error', 'Please enter dosage');
      return;
    }

    if (!formData.administeredBy.trim()) {
      Alert.alert('Error', 'Please specify who administered the medication');
      return;
    }

    setIsLoading(true);
    try {
      if (formData.mode === 'add') {
        // Create new medication first
        const newMedication = await createMedication({
          name: formData.medicationName,
          dosage: formData.dosage,
          timing: formData.timing,
          frequency: formData.frequency,
          notes: formData.notes,
          childId: 'current-child-id' // Replace with actual child ID
        });

        // Log the medication
        await logMedication({
          medicationId: newMedication.id,
          administeredBy: formData.administeredBy,
          dosageGiven: formData.dosage,
          notes: formData.notes,
          administeredAt: formData.administeredAt
        });

        // Create an entry for the new medication
        await createEntry({
          title: `Added new medication: ${formData.medicationName}`,
          description: `New medication added and first dose administered. Dosage: ${formData.dosage}, Timing: ${formData.timing}`,
          tags: [...formData.tags, 'medication', 'new-medication'],
          userId: 'current-user-id', // Replace with actual user ID
          childId: 'current-child-id', // Replace with actual child ID
          data: {
            medicationType: 'new-medication',
            medicationId: newMedication.id,
            medicationName: formData.medicationName,
            dosage: formData.dosage,
            administeredBy: formData.administeredBy,
            administeredAt: formData.administeredAt,
            createdVia: 'smart-entry'
          }
        });

        Alert.alert('Success', 'New medication added and logged successfully!');
      } else {
        // Log existing medication
        if (!formData.existingMedicationId) {
          Alert.alert('Error', 'Please select a medication');
          return;
        }

        await logMedication({
          medicationId: formData.existingMedicationId,
          administeredBy: formData.administeredBy,
          dosageGiven: formData.dosage,
          notes: formData.notes,
          administeredAt: formData.administeredAt
        });

        // Create an entry for the medication log
        await createEntry({
          title: `Took medication: ${formData.medicationName}`,
          description: `Medication administered. ${formData.notes ? `Notes: ${formData.notes}` : ''}`,
          tags: [...formData.tags, 'medication', 'medication-log'],
          userId: 'current-user-id', // Replace with actual user ID
          childId: 'current-child-id', // Replace with actual child ID
          data: {
            medicationType: 'medication-log',
            medicationId: formData.existingMedicationId,
            medicationName: formData.medicationName,
            dosage: formData.dosage,
            administeredBy: formData.administeredBy,
            administeredAt: formData.administeredAt,
            createdVia: 'smart-entry'
          }
        });

        Alert.alert('Success', 'Medication logged successfully!');
      }

      setTimeout(() => router.back(), 500);
    } catch (error) {
      console.error('Failed to save medication:', error);
      Alert.alert('Error', 'Failed to save medication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMedication = existingMedications.find(m => m.id === formData.existingMedicationId);

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Medication Entry
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          <Text style={[styles.saveButton, { opacity: isLoading ? 0.5 : 1 }]}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/* Mode Selection */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
            What would you like to do?
          </Text>
          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                {
                  backgroundColor: formData.mode === 'log' ? '#9C27B0' : 'transparent',
                  borderColor: '#9C27B0'
                }
              ]}
              onPress={() => setFormData(prev => ({ ...prev, mode: 'log' }))}
            >
              <IconSymbol
                name="pill"
                size={20}
                color={formData.mode === 'log' ? 'white' : '#9C27B0'}
              />
              <Text style={[
                styles.modeText,
                { color: formData.mode === 'log' ? 'white' : '#9C27B0' }
              ]}>
                Log Existing Medication
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                {
                  backgroundColor: formData.mode === 'add' ? '#9C27B0' : 'transparent',
                  borderColor: '#9C27B0'
                }
              ]}
              onPress={() => setFormData(prev => ({ ...prev, mode: 'add' }))}
            >
              <IconSymbol
                name="plus.circle"
                size={20}
                color={formData.mode === 'add' ? 'white' : '#9C27B0'}
              />
              <Text style={[
                styles.modeText,
                { color: formData.mode === 'add' ? 'white' : '#9C27B0' }
              ]}>
                Add New Medication
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Existing Medication Selection */}
        {formData.mode === 'log' && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Select Medication *
            </Text>
            {selectedMedication && (
              <View style={styles.selectedMedication}>
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{selectedMedication.name}</Text>
                  <Text style={styles.medicationDetails}>
                    {selectedMedication.dosage} • {selectedMedication.timing}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setFormData(prev => ({ ...prev, existingMedicationId: undefined }))}>
                  <IconSymbol name="xmark.circle" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            )}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medicationList}>
              {existingMedications.map((medication) => (
                <TouchableOpacity
                  key={medication.id}
                  style={[
                    styles.medicationCard,
                    {
                      backgroundColor: formData.existingMedicationId === medication.id ? '#9C27B0' : Colors[colorScheme ?? 'light'].background,
                      borderColor: formData.existingMedicationId === medication.id ? '#9C27B0' : Colors[colorScheme ?? 'light'].text + '20'
                    }
                  ]}
                  onPress={() => handleMedicationSelect(medication)}
                >
                  <Text style={[
                    styles.medicationCardName,
                    { color: formData.existingMedicationId === medication.id ? 'white' : Colors[colorScheme ?? 'light'].text }
                  ]}>
                    {medication.name}
                  </Text>
                  <Text style={[
                    styles.medicationCardDetails,
                    { color: formData.existingMedicationId === medication.id ? 'white' : Colors[colorScheme ?? 'light'].text }
                  ]}>
                    {medication.dosage}
                  </Text>
                  <Text style={[
                    styles.medicationCardTiming,
                    { color: formData.existingMedicationId === medication.id ? 'white' : Colors[colorScheme ?? 'light'].text }
                  ]}>
                    {medication.timing}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* New Medication Details */}
        {formData.mode === 'add' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                Medication Name *
              </Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: Colors[colorScheme ?? 'light'].background,
                  color: Colors[colorScheme ?? 'light'].text,
                  borderColor: Colors[colorScheme ?? 'light'].text + '20'
                }]}
                value={formData.medicationName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, medicationName: text }))}
                placeholder="Enter medication name"
                placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                Timing Instructions
              </Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: Colors[colorScheme ?? 'light'].background,
                  color: Colors[colorScheme ?? 'light'].text,
                  borderColor: Colors[colorScheme ?? 'light'].text + '20'
                }]}
                value={formData.timing}
                onChangeText={(text) => setFormData(prev => ({ ...prev, timing: text }))}
                placeholder="e.g., With food, Morning, Evening"
                placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                Frequency
              </Text>
              <View style={styles.frequencyContainer}>
                {frequencyOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.frequencyButton,
                      {
                        backgroundColor: formData.frequency === option.value ? '#9C27B0' : 'transparent',
                        borderColor: '#9C27B0'
                      }
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, frequency: option.value }))}
                  >
                    <Text style={[
                      styles.frequencyText,
                      { color: formData.frequency === option.value ? 'white' : '#9C27B0' }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Dosage Given */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
            Dosage Given *
          </Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: Colors[colorScheme ?? 'light'].background,
              color: Colors[colorScheme ?? 'light'].text,
              borderColor: Colors[colorScheme ?? 'light'].text + '20'
            }]}
            value={formData.dosage}
            onChangeText={(text) => setFormData(prev => ({ ...prev, dosage: text }))}
            placeholder="e.g., 25mg, 1 tablet, 5ml"
            placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
          />
        </View>

        {/* Administered By */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
            Administered By *
          </Text>
          <View style={styles.administeredByContainer}>
            {teamMembers.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={[
                  styles.administeredByButton,
                  {
                    backgroundColor: formData.administeredBy === member.name ? '#9C27B0' : 'transparent',
                    borderColor: '#9C27B0'
                  }
                ]}
                onPress={() => setFormData(prev => ({ ...prev, administeredBy: member.name }))}
              >
                <Text style={[
                  styles.administeredByText,
                  { color: formData.administeredBy === member.name ? 'white' : '#9C27B0' }
                ]}>
                  {member.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
            Notes
          </Text>
          <TextInput
            style={[styles.textArea, {
              backgroundColor: Colors[colorScheme ?? 'light'].background,
              color: Colors[colorScheme ?? 'light'].text,
              borderColor: Colors[colorScheme ?? 'light'].text + '20'
            }]}
            value={formData.notes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            placeholder="Any additional notes about administration..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].text + '60'}
            multiline
            numberOfLines={3}
          />
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
  modeContainer: {
    gap: 12,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  modeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedMedication: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#9C27B0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  medicationDetails: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  medicationList: {
    marginTop: 8,
  },
  medicationCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
    minWidth: 140,
  },
  medicationCardName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  medicationCardDetails: {
    fontSize: 12,
    marginBottom: 2,
  },
  medicationCardTiming: {
    fontSize: 11,
    opacity: 0.8,
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  frequencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  administeredByContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  administeredByButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  administeredByText: {
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
    backgroundColor: '#9C27B0',
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
    backgroundColor: '#9C27B0',
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
});
