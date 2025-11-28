import React, { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MessageComposer from '../../components/MessageComposer'
import MessageList from '../../components/MessageList'
import { ThemedText } from '../../components/ThemedText'
import { ThemedView } from '../../components/ThemedView'
import { useAuth } from '../../contexts/AuthContext'
import { getChildrenByOwner } from '../../lib/database'

interface Child {
  id: string
  name: string
  dateOfBirth?: string
  diagnosis?: string
}

export default function MessagesScreen() {
  const { user } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyToMessage, setReplyToMessage] = useState<string | null>(null)
  const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(null)

  useEffect(() => {
    loadChildren()
  }, [user])

  const loadChildren = async () => {
    if (!user) return

    try {
      setLoading(true)
      const childrenData = await getChildrenByOwner(user.id)
      setChildren(childrenData)

      // Select the first child by default
      if (childrenData.length > 0) {
        setSelectedChild(childrenData[0])
      }
    } catch (error) {
      console.error('Error loading children:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMessageSent = (messageId: string) => {
    // Clear reply/edit state after sending
    setReplyToMessage(null)
    setEditingMessage(null)

    // Optionally scroll to the new message or show a success indicator
    console.log('Message sent:', messageId)
  }

  const handleReply = (messageId: string) => {
    setReplyToMessage(messageId)
    setEditingMessage(null)
  }

  const handleEdit = (messageId: string, content: string) => {
    setEditingMessage({ id: messageId, content })
    setReplyToMessage(null)
  }

  const handleDelete = (messageId: string) => {
    // Handle message deletion
    console.log('Delete message:', messageId)
  }

  const handleCancelComposer = () => {
    setReplyToMessage(null)
    setEditingMessage(null)
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>Loading...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    )
  }

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
            Please log in
          </ThemedText>
          <ThemedText style={{ textAlign: 'center', opacity: 0.7 }}>
            You need to be logged in to view messages
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    )
  }

  if (children.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
            No children found
          </ThemedText>
          <ThemedText style={{ textAlign: 'center', opacity: 0.7 }}>
            You need to add a child to start messaging
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    )
  }

  if (!selectedChild) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
            Select a child
          </ThemedText>
          <ThemedText style={{ textAlign: 'center', opacity: 0.7 }}>
            Please select a child to view their messages
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ThemedView style={{ flex: 1 }}>
          {/* Header */}
          <View style={{
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0',
            backgroundColor: '#f8f9fa'
          }}>
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
              Messages
            </ThemedText>
            <ThemedText style={{ fontSize: 14, opacity: 0.7, textAlign: 'center', marginTop: 4 }}>
              {selectedChild.name}
            </ThemedText>

            {/* Child selector (if multiple children) */}
            {children.length > 1 && (
              <View style={{ marginTop: 12 }}>
                <ThemedText style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
                  Select child:
                </ThemedText>
                <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {children.map((child) => (
                    <View
                      key={child.id}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        marginHorizontal: 4,
                        marginVertical: 2,
                        backgroundColor: selectedChild.id === child.id ? '#007AFF' : '#e0e0e0',
                        borderRadius: 15
                      }}
                      onTouchEnd={() => setSelectedChild(child)}
                    >
                      <ThemedText style={{
                        color: selectedChild.id === child.id ? 'white' : '#333',
                        fontSize: 12,
                        fontWeight: selectedChild.id === child.id ? 'bold' : 'normal'
                      }}>
                        {child.name}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Message List */}
          <View style={{ flex: 1 }}>
            <MessageList
              childId={selectedChild.id}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </View>

          {/* Message Composer */}
          <MessageComposer
            childId={selectedChild.id}
            replyToId={replyToMessage || undefined}
            initialContent={editingMessage?.content}
            onSend={handleMessageSent}
            onCancel={handleCancelComposer}
            placeholder={
              replyToMessage
                ? 'Reply to message...'
                : editingMessage
                ? 'Edit message...'
                : 'Type your message...'
            }
          />
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
