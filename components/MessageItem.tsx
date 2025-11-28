import React, { useState } from 'react'
import { Alert, Image, Linking, TouchableOpacity, View } from 'react-native'
import { ThemedText } from './ThemedText'
import { ThemedView } from './ThemedView'

interface Message {
  id: string
  content: string
  authorId: string
  childId: string
  createdAt: string
  updatedAt: string
  isEdited: boolean
  editedAt?: string
  replyToId?: string
  author: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  attachments?: Array<{
    id: string
    fileName: string
    originalName: string
    mimeType: string
    size: number
    url: string
    thumbnailUrl?: string
  }>
  mentions?: Array<{
    id: string
    userId: string
    startIndex: number
    endIndex: number
    user: {
      id: string
      name: string
      email: string
      avatar?: string
    }
  }>
  links?: Array<{
    id: string
    entityType: string
    entityId: string
    linkText: string
    startIndex: number
    endIndex: number
  }>
  replies?: Message[]
}

interface MessageItemProps {
  message: Message
  currentUserId?: string
  onReply?: (messageId: string) => void
  onEdit?: (messageId: string, content: string) => void
  onDelete?: (messageId: string) => void
}

export default function MessageItem({ message, currentUserId, onReply, onEdit, onDelete }: MessageItemProps) {
  const [showActions, setShowActions] = useState(false)
  const isOwnMessage = currentUserId === message.authorId

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const handleLongPress = () => {
    setShowActions(!showActions)
  }

  const handleReply = () => {
    onReply?.(message.id)
    setShowActions(false)
  }

  const handleEdit = () => {
    onEdit?.(message.id, message.content)
    setShowActions(false)
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete?.(message.id) }
      ]
    )
    setShowActions(false)
  }

  const handleLinkPress = async (link: { entityType: string; entityId: string; linkText: string }) => {
    // Handle different entity types
    switch (link.entityType) {
      case 'entry':
        // Navigate to entry details
        console.log('Navigate to entry:', link.entityId)
        break
      case 'medication':
        // Navigate to medication details
        console.log('Navigate to medication:', link.entityId)
        break
      case 'reminder':
        // Navigate to reminder details
        console.log('Navigate to reminder:', link.entityId)
        break
      case 'contact':
        // Navigate to contact details
        console.log('Navigate to contact:', link.entityId)
        break
      case 'medicalData':
        // Navigate to medical data details
        console.log('Navigate to medical data:', link.entityId)
        break
      default:
        console.log('Unknown entity type:', link.entityType)
    }
  }

  const renderContent = () => {
    if (!message.mentions?.length && !message.links?.length) {
      return (
        <ThemedText style={{ fontSize: 16, lineHeight: 22 }}>
          {message.content}
        </ThemedText>
      )
    }

    // Create an array of text segments with mentions and links
    const segments: Array<{ text: string; type: 'text' | 'mention' | 'link'; data?: any }> = []
    const mentions = message.mentions || []
    const links = message.links || []

    // Combine and sort mentions and links by start index
    const allMarkers = [
      ...mentions.map(m => ({ ...m, type: 'mention' as const })),
      ...links.map(l => ({ ...l, type: 'link' as const }))
    ].sort((a, b) => a.startIndex - b.startIndex)

    let currentIndex = 0

    allMarkers.forEach((marker) => {
      // Add text before the marker
      if (currentIndex < marker.startIndex) {
        segments.push({
          text: message.content.slice(currentIndex, marker.startIndex),
          type: 'text'
        })
      }

      // Add the marker
      segments.push({
        text: message.content.slice(marker.startIndex, marker.endIndex),
        type: marker.type,
        data: marker
      })

      currentIndex = marker.endIndex
    })

    // Add remaining text
    if (currentIndex < message.content.length) {
      segments.push({
        text: message.content.slice(currentIndex),
        type: 'text'
      })
    }

    return (
      <ThemedText style={{ fontSize: 16, lineHeight: 22 }}>
        {segments.map((segment, index) => {
          if (segment.type === 'mention') {
            return (
              <ThemedText key={index} style={{ color: '#007AFF', fontWeight: '600' }}>
                {segment.text}
              </ThemedText>
            )
          } else if (segment.type === 'link') {
            return (
              <TouchableOpacity key={index} onPress={() => handleLinkPress(segment.data)}>
                <ThemedText style={{ color: '#007AFF', textDecorationLine: 'underline' }}>
                  {segment.text}
                </ThemedText>
              </TouchableOpacity>
            )
          } else {
            return (
              <ThemedText key={index}>
                {segment.text}
              </ThemedText>
            )
          }
        })}
      </ThemedText>
    )
  }

  const renderAttachments = () => {
    if (!message.attachments?.length) return null

    return (
      <View style={{ marginTop: 12 }}>
        {message.attachments.map((attachment) => (
          <View key={attachment.id} style={{ marginBottom: 8 }}>
            {attachment.mimeType.startsWith('image/') ? (
              <TouchableOpacity
                onPress={() => {
                  // Open image in full screen
                  Linking.openURL(attachment.url)
                }}
              >
                <Image
                  source={{ uri: attachment.thumbnailUrl || attachment.url }}
                  style={{
                    width: 200,
                    height: 150,
                    borderRadius: 8,
                    backgroundColor: '#f0f0f0'
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => Linking.openURL(attachment.url)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#e9ecef'
                }}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontWeight: '600', fontSize: 14 }}>
                    {attachment.originalName}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                    {(attachment.size / 1024).toFixed(1)} KB
                  </ThemedText>
                </View>
                <ThemedText style={{ color: '#007AFF', fontSize: 14 }}>
                  Open
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    )
  }

  return (
    <ThemedView style={{ marginBottom: 16 }}>
      <TouchableOpacity
        onLongPress={handleLongPress}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          padding: 12,
          backgroundColor: isOwnMessage ? '#e3f2fd' : '#f8f9fa',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#e9ecef'
        }}
      >
        {/* Avatar */}
        <View style={{ marginRight: 12 }}>
          {message.author.avatar ? (
            <Image
              source={{ uri: message.author.avatar }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#f0f0f0'
              }}
            />
          ) : (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#007AFF',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <ThemedText style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                {message.author.name?.charAt(0).toUpperCase() || 'U'}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Message content */}
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <ThemedText style={{ fontWeight: '600', fontSize: 14, marginRight: 8 }}>
              {message.author.name || 'Unknown User'}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
              {formatDate(message.createdAt)} at {formatTime(message.createdAt)}
            </ThemedText>
            {message.isEdited && (
              <ThemedText style={{ fontSize: 12, opacity: 0.7, marginLeft: 4 }}>
                (edited)
              </ThemedText>
            )}
          </View>

          {/* Content */}
          {renderContent()}

          {/* Attachments */}
          {renderAttachments()}

          {/* Reply indicator */}
          {message.replyToId && (
            <View style={{ marginTop: 8, paddingLeft: 12, borderLeftWidth: 3, borderLeftColor: '#007AFF' }}>
              <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                Reply to message
              </ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Actions */}
      {showActions && (
        <View style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginTop: 8,
          paddingHorizontal: 12
        }}>
          <TouchableOpacity
            onPress={handleReply}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: '#007AFF',
              borderRadius: 6,
              marginRight: 8
            }}
          >
            <ThemedText style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
              Reply
            </ThemedText>
          </TouchableOpacity>

          {isOwnMessage && (
            <>
              <TouchableOpacity
                onPress={handleEdit}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: '#6c757d',
                  borderRadius: 6,
                  marginRight: 8
                }}
              >
                <ThemedText style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                  Edit
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: '#dc3545',
                  borderRadius: 6
                }}
              >
                <ThemedText style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                  Delete
                </ThemedText>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </ThemedView>
  )
}
