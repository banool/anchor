import * as ImagePicker from 'expo-image-picker'
import React, { useRef, useState } from 'react'
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import {
    createMessageWithMentionsAndLinks,
    getCollaboratorsByChild,
    getLinkableContacts,
    getLinkableEntries,
    getLinkableMedicalData,
    getLinkableMedications,
    getLinkableReminders
} from '../lib/database'
import { ThemedText } from './ThemedText'
import { ThemedView } from './ThemedView'

interface MessageComposerProps {
  childId: string
  replyToId?: string
  initialContent?: string
  onSend?: (messageId: string) => void
  onCancel?: () => void
  placeholder?: string
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface LinkableEntity {
  id: string
  title?: string
  name?: string
  type?: string
  content?: string
  description?: string
}

interface Mention {
  userId: string
  startIndex: number
  endIndex: number
  user: User
}

interface EntityLink {
  entityType: string
  entityId: string
  linkText: string
  startIndex: number
  endIndex: number
}

interface Attachment {
  id: string
  uri: string
  type: string
  name: string
  size: number
}

export default function MessageComposer({
  childId,
  replyToId,
  initialContent = '',
  onSend,
  onCancel,
  placeholder = 'Type your message...'
}: MessageComposerProps) {
  const { user } = useAuth()
  const [content, setContent] = useState(initialContent)
  const [mentions, setMentions] = useState<Mention[]>([])
  const [links, setLinks] = useState<EntityLink[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [showMentionPicker, setShowMentionPicker] = useState(false)
  const [showLinkPicker, setShowLinkPicker] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [linkSearch, setLinkSearch] = useState('')
  const [collaborators, setCollaborators] = useState<User[]>([])
  const [linkableEntities, setLinkableEntities] = useState<LinkableEntity[]>([])
  const [selectedLinkType, setSelectedLinkType] = useState<string>('entry')
  const [loading, setLoading] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const textInputRef = useRef<TextInput>(null)

  const linkTypes = [
    { key: 'entry', label: 'Todos/Notes' },
    { key: 'medication', label: 'Medications' },
    { key: 'reminder', label: 'Reminders' },
    { key: 'contact', label: 'Contacts' },
    { key: 'medicalData', label: 'Medical Data' }
  ]

  const handleSend = async () => {
    if (!content.trim() && attachments.length === 0) {
      Alert.alert('Error', 'Please enter a message or attach an image')
      return
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to send messages')
      return
    }

    setLoading(true)
    try {
      const messageData = {
        content: content.trim(),
        authorId: user.id,
        childId,
        replyToId
      }

      // Convert attachments to the format expected by the database
      const attachmentData = attachments.map(att => ({
        fileName: att.name,
        originalName: att.name,
        mimeType: att.type,
        size: att.size,
        url: att.uri, // This would need to be uploaded to Firebase Storage first
        thumbnailUrl: att.type.startsWith('image/') ? att.uri : undefined
      }))

            const messageResult = await createMessageWithMentionsAndLinks(
        messageData,
        mentions,
        links,
        attachmentData
      )

      // Clear the composer
      setContent('')
      setMentions([])
      setLinks([])
      setAttachments([])

      onSend?.('placeholder-message-id')
    } catch (error) {
      console.error('Error sending message:', error)
      Alert.alert('Error', 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const handleAttachImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant permission to access your photo library')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        allowsMultipleSelection: false
      })

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0]
        const newAttachment: Attachment = {
          id: Date.now().toString(),
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.fileName || 'image.jpg',
          size: asset.fileSize || 0
        }
        setAttachments(prev => [...prev, newAttachment])
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'Failed to pick image')
    }
  }

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId))
  }

  const handleMentionPress = async () => {
    setShowMentionPicker(true)
    try {
      const collaboratorsData = await getCollaboratorsByChild(childId)
      setCollaborators(collaboratorsData.map((c: any) => c.user))
    } catch (error) {
      console.error('Error loading collaborators:', error)
    }
  }

  const handleLinkPress = async () => {
    setShowLinkPicker(true)
    await loadLinkableEntities(selectedLinkType)
  }

  const loadLinkableEntities = async (entityType: string) => {
    try {
      let entities: LinkableEntity[] = []

      switch (entityType) {
        case 'entry':
          entities = await getLinkableEntries(childId)
          break
        case 'medication':
          entities = await getLinkableMedications(childId)
          break
        case 'reminder':
          entities = await getLinkableReminders(childId)
          break
        case 'contact':
          entities = await getLinkableContacts(childId)
          break
        case 'medicalData':
          entities = await getLinkableMedicalData(childId)
          break
      }

      setLinkableEntities(entities)
    } catch (error) {
      console.error('Error loading linkable entities:', error)
    }
  }

  const handleAddMention = (selectedUser: User) => {
    const mentionText = `@${selectedUser.name}`
    const newContent = content.slice(0, cursorPosition) + mentionText + content.slice(cursorPosition)

    const newMention: Mention = {
      userId: selectedUser.id,
      startIndex: cursorPosition,
      endIndex: cursorPosition + mentionText.length,
      user: selectedUser
    }

    setContent(newContent)
    setMentions(prev => [...prev, newMention])
    setShowMentionPicker(false)
    setCursorPosition(cursorPosition + mentionText.length)
  }

  const handleAddLink = (entity: LinkableEntity) => {
    const linkText = `[${entity.title || entity.name}]`
    const newContent = content.slice(0, cursorPosition) + linkText + content.slice(cursorPosition)

    const newLink: EntityLink = {
      entityType: selectedLinkType,
      entityId: entity.id,
      linkText,
      startIndex: cursorPosition,
      endIndex: cursorPosition + linkText.length
    }

    setContent(newContent)
    setLinks(prev => [...prev, newLink])
    setShowLinkPicker(false)
    setCursorPosition(cursorPosition + linkText.length)
  }

  const renderAttachments = () => {
    if (attachments.length === 0) return null

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        {attachments.map((attachment) => (
          <View key={attachment.id} style={{ marginRight: 10, position: 'relative' }}>
            <Image
              source={{ uri: attachment.uri }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 8,
                backgroundColor: '#f0f0f0'
              }}
            />
            <TouchableOpacity
              onPress={() => handleRemoveAttachment(attachment.id)}
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: '#ff4444',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <ThemedText style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>×</ThemedText>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    )
  }

  const renderMentionPicker = () => (
    <Modal visible={showMentionPicker} animationType="slide" transparent>
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
      }}>
        <ThemedView style={{
          maxHeight: Dimensions.get('window').height * 0.5,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20
        }}>
          <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
            Mention someone
          </ThemedText>

          <FlatList
            data={collaborators}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleAddMention(item)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: '#e0e0e0'
                }}
              >
                {item.avatar ? (
                  <Image
                    source={{ uri: item.avatar }}
                    style={{ width: 40, height: 40, borderRadius: 20, marginRight: 15 }}
                  />
                ) : (
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#007AFF',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 15
                  }}>
                    <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>
                      {item.name.charAt(0).toUpperCase()}
                    </ThemedText>
                  </View>
                )}
                <View>
                  <ThemedText style={{ fontWeight: '600' }}>{item.name}</ThemedText>
                  <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>{item.email}</ThemedText>
                </View>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            onPress={() => setShowMentionPicker(false)}
            style={{
              marginTop: 15,
              padding: 15,
              backgroundColor: '#007AFF',
              borderRadius: 10,
              alignItems: 'center'
            }}
          >
            <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Cancel</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Modal>
  )

  const renderLinkPicker = () => (
    <Modal visible={showLinkPicker} animationType="slide" transparent>
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
      }}>
        <ThemedView style={{
          maxHeight: Dimensions.get('window').height * 0.6,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20
        }}>
          <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
            Link to item
          </ThemedText>

          {/* Link type selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
            {linkTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                onPress={() => {
                  setSelectedLinkType(type.key)
                  loadLinkableEntities(type.key)
                }}
                style={{
                  paddingHorizontal: 15,
                  paddingVertical: 8,
                  marginRight: 10,
                  backgroundColor: selectedLinkType === type.key ? '#007AFF' : '#f0f0f0',
                  borderRadius: 20
                }}
              >
                <ThemedText style={{
                  color: selectedLinkType === type.key ? 'white' : '#333',
                  fontWeight: selectedLinkType === type.key ? 'bold' : 'normal'
                }}>
                  {type.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={linkableEntities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleAddLink(item)}
                style={{
                  padding: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: '#e0e0e0'
                }}
              >
                <ThemedText style={{ fontWeight: '600' }}>
                  {item.title || item.name}
                </ThemedText>
                {item.content && (
                  <ThemedText style={{ fontSize: 12, opacity: 0.7, marginTop: 5 }}>
                    {item.content.length > 100 ? item.content.substring(0, 100) + '...' : item.content}
                  </ThemedText>
                )}
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            onPress={() => setShowLinkPicker(false)}
            style={{
              marginTop: 15,
              padding: 15,
              backgroundColor: '#007AFF',
              borderRadius: 10,
              alignItems: 'center'
            }}
          >
            <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Cancel</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Modal>
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ backgroundColor: 'white' }}
    >
      <ThemedView style={{ padding: 15, borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
        {/* Attachments */}
        {renderAttachments()}

        {/* Text input */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          backgroundColor: '#f8f9fa',
          borderRadius: 20,
          paddingHorizontal: 15,
          paddingVertical: 10,
          marginBottom: 10
        }}>
          <TextInput
            ref={textInputRef}
            value={content}
            onChangeText={setContent}
            onSelectionChange={(event) => setCursorPosition(event.nativeEvent.selection.start)}
            placeholder={placeholder}
            multiline
            style={{
              flex: 1,
              maxHeight: 100,
              fontSize: 16,
              paddingVertical: 5
            }}
          />
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={handleAttachImage}
              style={{
                padding: 10,
                backgroundColor: '#007AFF',
                borderRadius: 20,
                marginRight: 10
              }}
            >
              <ThemedText style={{ color: 'white', fontSize: 12 }}>📷</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleMentionPress}
              style={{
                padding: 10,
                backgroundColor: '#007AFF',
                borderRadius: 20,
                marginRight: 10
              }}
            >
              <ThemedText style={{ color: 'white', fontSize: 12 }}>@</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLinkPress}
              style={{
                padding: 10,
                backgroundColor: '#007AFF',
                borderRadius: 20,
                marginRight: 10
              }}
            >
              <ThemedText style={{ color: 'white', fontSize: 12 }}>🔗</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row' }}>
            {onCancel && (
              <TouchableOpacity
                onPress={onCancel}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  backgroundColor: '#6c757d',
                  borderRadius: 20,
                  marginRight: 10
                }}
              >
                <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Cancel</ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleSend}
              disabled={loading || (!content.trim() && attachments.length === 0)}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: loading || (!content.trim() && attachments.length === 0) ? '#ccc' : '#007AFF',
                borderRadius: 20
              }}
            >
              <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>
                {loading ? 'Sending...' : 'Send'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>

      {renderMentionPicker()}
      {renderLinkPicker()}
    </KeyboardAvoidingView>
  )
}
