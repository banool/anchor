import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { getMessagesByChild } from '../lib/database'
import MessageItem from './MessageItem'
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

interface MessageListProps {
  childId: string
  onReply?: (messageId: string) => void
  onEdit?: (messageId: string, content: string) => void
  onDelete?: (messageId: string) => void
}

export default function MessageList({ childId, onReply, onEdit, onDelete }: MessageListProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const flatListRef = useRef<FlatList>(null)

  const loadMessages = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const fetchedMessages = await getMessagesByChild(childId)
      setMessages(fetchedMessages)
    } catch (err) {
      setError('Failed to load messages')
      console.error('Error loading messages:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [childId])

  const handleRefresh = () => {
    loadMessages(true)
  }

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageItem
      message={item}
      currentUserId={user?.id}
      onReply={onReply}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )

  const renderEmpty = () => (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <ThemedText style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
        No messages yet
      </ThemedText>
      <ThemedText style={{ textAlign: 'center', opacity: 0.7 }}>
        Start the conversation by sending the first message
      </ThemedText>
    </ThemedView>
  )

  const renderError = () => (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <ThemedText style={{ fontSize: 18, fontWeight: '600', marginBottom: 8, color: 'red' }}>
        Error loading messages
      </ThemedText>
      <ThemedText style={{ textAlign: 'center', opacity: 0.7 }}>
        {error}
      </ThemedText>
    </ThemedView>
  )

  const renderLoading = () => (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <ThemedText style={{ marginTop: 10, opacity: 0.7 }}>
        Loading messages...
      </ThemedText>
    </ThemedView>
  )

  if (loading && !refreshing) {
    return renderLoading()
  }

  if (error && !refreshing) {
    return renderError()
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="$color"
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        inverted // Show newest messages at the bottom
      />
    </ThemedView>
  )
}
