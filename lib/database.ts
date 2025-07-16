import { PrismaClient } from '@prisma/client'
import { logCrashlytics, setCrashlyticsAttribute } from './firebase'

const prisma = new PrismaClient()

// Base where clause for soft deletion
const withoutDeleted = { deletedAt: null }

// Helper function to soft delete by setting deletedAt
const softDelete = async (model: any, id: string) => {
  try {
    setCrashlyticsAttribute('operation', 'soft_delete')
    setCrashlyticsAttribute('model', model.name || 'unknown')

    const result = await model.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    logCrashlytics(`Soft deleted ${model.name || 'record'} with ID: ${id}`)
    return result
  } catch (error) {
    logCrashlytics(`Error soft deleting ${model.name || 'record'} with ID: ${id}`, error as Error)
    throw error
  }
}

// Enhanced error handling wrapper
const withErrorHandling = async <T>(
  operation: string,
  fn: () => Promise<T>,
  context?: Record<string, string>
): Promise<T> => {
  try {
    setCrashlyticsAttribute('operation', operation)
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        setCrashlyticsAttribute(key, value)
      })
    }

    const startTime = Date.now()
    const result = await fn()
    const duration = Date.now() - startTime

    logCrashlytics(`${operation} completed successfully in ${duration}ms`)
    return result
  } catch (error) {
    logCrashlytics(`Error in ${operation}`, error as Error)
    throw error
  }
}

// User operations
export const createUser = async (data: {
  email: string
  name?: string | null
  avatar?: string | null
  phone?: string | null
  firebaseUid: string
}) => {
  return withErrorHandling(
    'createUser',
    async () => {
      return await prisma.user.create({
        data: {
          email: data.email,
          name: data.name || null,
          avatar: data.avatar || null,
          phone: data.phone || null,
          // Note: firebaseUid is not in the current schema, but we'll handle it in the context
        }
      })
    },
    {
      email: data.email,
      hasName: data.name ? 'true' : 'false',
      hasAvatar: data.avatar ? 'true' : 'false',
      hasPhone: data.phone ? 'true' : 'false'
    }
  )
}

export const getUserByEmail = async (email: string) => {
  return withErrorHandling(
    'getUserByEmail',
    async () => {
      return await prisma.user.findMany({
        where: {
          email,
          ...withoutDeleted
        }
      })
    },
    {
      email
    }
  )
}

export const getUserById = async (id: string) => {
  return withErrorHandling(
    'getUserById',
    async () => {
      return await prisma.user.findUnique({
        where: {
          id,
          ...withoutDeleted
        }
      })
    },
    {
      userId: id
    }
  )
}

export const updateUser = async (id: string, data: {
  name?: string | null
  avatar?: string | null
  phone?: string | null
}) => {
  return withErrorHandling(
    'updateUser',
    async () => {
      return await prisma.user.update({
        where: {
          id,
          ...withoutDeleted
        },
        data
      })
    },
    {
      userId: id,
      updateFields: Object.keys(data).join(',')
    }
  )
}

export const deleteUser = async (id: string) => {
  return await softDelete(prisma.user, id)
}

// Entry operations
export const getEntries = async (childId: string, filters?: {
  tags?: string[]
  priority?: string
  assignedToId?: string
  isCompleted?: boolean
}) => {
  return withErrorHandling(
    'getEntries',
    async () => {
      const where: any = {
        childId,
        ...withoutDeleted
      }

      if (filters?.tags?.length) {
        where.tags = { hasEvery: filters.tags }
      }

      if (filters?.priority) {
        where.priority = filters.priority
      }

      if (filters?.assignedToId) {
        where.assignedToId = filters.assignedToId
      }

      if (filters?.isCompleted !== undefined) {
        where.completedAt = filters.isCompleted ? { not: null } : null
      }

      return await prisma.entry.findMany({
        where,
        include: {
          user: true,
          assignedTo: true,
          assignedBy: true
        },
        orderBy: { createdAt: 'desc' }
      })
    },
    {
      childId,
      hasFilters: filters ? 'true' : 'false',
      filterCount: filters ? Object.keys(filters).length.toString() : '0'
    }
  )
}

export const createEntry = async (data: {
  title: string
  description?: string
  data?: any
  priority?: string
  tags?: string[]
  dueDate?: Date
  assignedToId?: string
  userId: string
  childId: string
}) => {
  return withErrorHandling(
    'createEntry',
    async () => {
      return await prisma.entry.create({
        data: {
          ...data,
          assignedById: data.userId // Set the creator as assignedBy
        },
        include: {
          user: true,
          assignedTo: true,
          assignedBy: true
        }
      })
    },
    {
      childId: data.childId,
      userId: data.userId,
      hasDescription: data.description ? 'true' : 'false',
      priority: data.priority || 'none',
      tagCount: data.tags?.length.toString() || '0'
    }
  )
}

export const updateEntry = async (id: string, data: {
  title?: string
  description?: string
  data?: any
  priority?: string
  tags?: string[]
  dueDate?: Date
  assignedToId?: string
  completedAt?: Date
  privateAt?: Date
  pinnedAt?: Date
}) => {
  return withErrorHandling(
    'updateEntry',
    async () => {
      return await prisma.entry.update({
        where: { id, ...withoutDeleted },
        data,
        include: {
          user: true,
          assignedTo: true,
          assignedBy: true
        }
      })
    },
    {
      entryId: id,
      updateFields: Object.keys(data).join(','),
      fieldCount: Object.keys(data).length.toString()
    }
  )
}

export const deleteEntry = async (id: string) => {
  return await softDelete(prisma.entry, id)
}

// Medication operations
export const getMedications = async (childId: string, activeOnly = true) => {
  return withErrorHandling(
    'getMedications',
    async () => {
      const where: any = {
        childId,
        ...withoutDeleted
      }

      if (activeOnly) {
        where.activeAt = { not: null }
        where.inactiveAt = null
      }

      return await prisma.medication.findMany({
        where,
        include: {
          logs: {
            where: withoutDeleted,
            orderBy: { administeredAt: 'desc' }
          }
        }
      })
    },
    {
      childId,
      activeOnly: activeOnly.toString()
    }
  )
}

export const createMedication = async (data: {
  name: string
  dosage: string
  timing: string
  frequency?: string
  notes?: string
  childId: string
}) => {
  return withErrorHandling(
    'createMedication',
    async () => {
      return await prisma.medication.create({ data })
    },
    {
      childId: data.childId,
      medicationName: data.name,
      dosage: data.dosage,
      timing: data.timing
    }
  )
}

export const logMedication = async (data: {
  medicationId: string
  administeredBy: string
  dosageGiven: string
  notes?: string
  administeredAt?: Date
}) => {
  return withErrorHandling(
    'logMedication',
    async () => {
      return await prisma.medicationLog.create({ data })
    },
    {
      medicationId: data.medicationId,
      administeredBy: data.administeredBy,
      dosageGiven: data.dosageGiven
    }
  )
}

export const deleteMedication = async (id: string) => {
  return await softDelete(prisma.medication, id)
}

// Medical measurements
export const getMedicalMeasurements = async (childId: string, type?: string) => {
  return withErrorHandling(
    'getMedicalMeasurements',
    async () => {
      const where: any = {
        childId,
        ...withoutDeleted
      }

      if (type) {
        where.type = type
      }

      return await prisma.medicalMeasurement.findMany({
        where,
        orderBy: { measuredAt: 'desc' }
      })
    },
    {
      childId,
      type: type || 'all',
      hasTypeFilter: type ? 'true' : 'false'
    }
  )
}

export const createMedicalMeasurement = async (data: {
  type: string
  value: number
  unit: string
  notes?: string
  additionalValue?: number
  testName?: string
  normalRange?: string
  measuredBy?: string
  childId: string
}) => {
  return withErrorHandling(
    'createMedicalMeasurement',
    async () => {
      return await prisma.medicalMeasurement.create({ data })
    },
    {
      childId: data.childId,
      type: data.type,
      value: data.value.toString(),
      unit: data.unit,
      measuredBy: data.measuredBy || 'unknown'
    }
  )
}

export const deleteMedicalMeasurement = async (id: string) => {
  return await softDelete(prisma.medicalMeasurement, id)
}

// Reminders
export const getReminders = async (childId: string, activeOnly = true) => {
  return withErrorHandling(
    'getReminders',
    async () => {
      const where: any = {
        childId,
        ...withoutDeleted
      }

      if (activeOnly) {
        where.completedAt = null
      }

      return await prisma.reminder.findMany({
        where,
        orderBy: { nextDueAt: 'asc' }
      })
    },
    {
      childId,
      activeOnly: activeOnly.toString()
    }
  )
}

export const createReminder = async (data: {
  title: string
  description?: string
  type: string
  frequency?: string
  resetOnCompletion?: boolean
  nextDueAt?: Date
  assignedTo?: string
  childId: string
}) => {
  return withErrorHandling(
    'createReminder',
    async () => {
      return await prisma.reminder.create({ data })
    },
    {
      childId: data.childId,
      title: data.title,
      type: data.type,
      frequency: data.frequency || 'none',
      assignedTo: data.assignedTo || 'unassigned'
    }
  )
}

export const deleteReminder = async (id: string) => {
  return await softDelete(prisma.reminder, id)
}

// Messages
export const getMessages = async (childId: string, limit = 50) => {
  return withErrorHandling(
    'getMessages',
    async () => {
      return await prisma.message.findMany({
        where: {
          childId,
          ...withoutDeleted
        },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    },
    {
      childId,
      limit: limit.toString()
    }
  )
}

export const createMessage = async (data: {
  content: string
  type?: string
  mentionedUsers?: string[]
  tags?: string[]
  attachments?: string[]
  userId: string
  childId: string
}) => {
  return withErrorHandling(
    'createMessage',
    async () => {
      return await prisma.message.create({
        data,
        include: { user: true }
      })
    },
    {
      childId: data.childId,
      userId: data.userId,
      type: data.type || 'text',
      contentLength: data.content.length.toString(),
      hasMentions: data.mentionedUsers && data.mentionedUsers.length > 0 ? 'true' : 'false',
      hasAttachments: data.attachments && data.attachments.length > 0 ? 'true' : 'false'
    }
  )
}

export const deleteMessage = async (id: string) => {
  return await softDelete(prisma.message, id)
}

// Contacts
export const getContacts = async (childId: string, type?: string) => {
  return withErrorHandling(
    'getContacts',
    async () => {
      const where: any = {
        childId,
        ...withoutDeleted
      }

      if (type) {
        where.type = type
      }

      return await prisma.contact.findMany({
        where,
        orderBy: { name: 'asc' }
      })
    },
    {
      childId,
      type: type || 'all',
      hasTypeFilter: type ? 'true' : 'false'
    }
  )
}

export const createContact = async (data: {
  name: string
  type: string
  phone?: string
  email?: string
  address?: string
  specialty?: string
  department?: string
  hospital?: string
  availability?: string
  notes?: string
  childId: string
}) => {
  return withErrorHandling(
    'createContact',
    async () => {
      return await prisma.contact.create({ data })
    },
    {
      childId: data.childId,
      name: data.name,
      type: data.type,
      specialty: data.specialty || 'none',
      hospital: data.hospital || 'unknown'
    }
  )
}

export const deleteContact = async (id: string) => {
  return await softDelete(prisma.contact, id)
}

// Invitations
export const createInvitation = async (data: {
  email: string
  role: string
  expiresAt: Date
  senderId: string
  childId: string
}) => {
  return withErrorHandling(
    'createInvitation',
    async () => {
      const token = Math.random().toString(36).substring(2, 15)

      return await prisma.invitation.create({
        data: {
          ...data,
          token
        }
      })
    },
    {
      childId: data.childId,
      senderId: data.senderId,
      email: data.email,
      role: data.role
    }
  )
}

export const acceptInvitation = async (token: string, userId: string) => {
  return withErrorHandling(
    'acceptInvitation',
    async () => {
      const invitation = await prisma.invitation.findUnique({
        where: { token, ...withoutDeleted }
      })

      if (!invitation || invitation.expiresAt < new Date()) {
        throw new Error('Invalid or expired invitation')
      }

      // Create collaboration
      await prisma.collaboration.create({
        data: {
          userId,
          childId: invitation.childId,
          role: invitation.role
        }
      })

      // Update invitation
      return await prisma.invitation.update({
        where: { token },
        data: {
          status: 'accepted',
          acceptedAt: new Date(),
          receiverId: userId
        }
      })
    },
    {
      token,
      userId
    }
  )
}

export const deleteInvitation = async (id: string) => {
  return await softDelete(prisma.invitation, id)
}

// Notifications
export const getNotifications = async (userId: string, unreadOnly = false) => {
  return withErrorHandling(
    'getNotifications',
    async () => {
      const where: any = {
        userId,
        ...withoutDeleted
      }

      if (unreadOnly) {
        where.readAt = null
      }

      return await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      })
    },
    {
      userId,
      unreadOnly: unreadOnly.toString()
    }
  )
}

export const createNotification = async (data: {
  title: string
  message: string
  type: string // "entry", "reminder", "message", "medication", "contact", "invitation", "collaboration", "system"
  relatedItemId?: string // ID of the related item
  data?: any
  scheduledAt?: Date
  userId: string
  childId?: string
}) => {
  return withErrorHandling(
    'createNotification',
    async () => {
      return await prisma.notification.create({ data })
    },
    {
      userId: data.userId,
      childId: data.childId || 'none',
      type: data.type,
      relatedItemId: data.relatedItemId || 'none',
      hasScheduledAt: data.scheduledAt ? 'true' : 'false'
    }
  )
}

export const markNotificationRead = async (id: string) => {
  return withErrorHandling(
    'markNotificationRead',
    async () => {
      return await prisma.notification.update({
        where: { id, ...withoutDeleted },
        data: { readAt: new Date() }
      })
    },
    {
      notificationId: id
    }
  )
}

export const deleteNotification = async (id: string) => {
  return await softDelete(prisma.notification, id)
}

// Helper function to create notifications for specific models
export const createNotificationForItem = async (params: {
  title: string
  message: string
  modelType: 'entry' | 'reminder' | 'message' | 'medication' | 'contact' | 'invitation' | 'collaboration'
  relatedItemId: string
  userId: string
  childId?: string
  data?: any
  scheduledAt?: Date
}) => {
  return withErrorHandling(
    'createNotificationForItem',
    async () => {
      return await createNotification({
        title: params.title,
        message: params.message,
        type: params.modelType,
        relatedItemId: params.relatedItemId,
        userId: params.userId,
        childId: params.childId,
        data: params.data,
        scheduledAt: params.scheduledAt
      })
    },
    {
      modelType: params.modelType,
      relatedItemId: params.relatedItemId,
      userId: params.userId,
      childId: params.childId || 'none'
    }
  )
}

// Helper function to get notifications for a specific item
export const getNotificationsForItem = async (modelType: string, relatedItemId: string) => {
  return await prisma.notification.findMany({
    where: {
      type: modelType,
      relatedItemId,
      ...withoutDeleted
    },
    include: {
      user: true,
      child: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

// Collaborations
export const getCollaborations = async (childId: string) => {
  return await prisma.collaboration.findMany({
    where: {
      childId,
      ...withoutDeleted
    },
    include: { user: true }
  })
}

export const deleteCollaboration = async (id: string) => {
  return await softDelete(prisma.collaboration, id)
}

// Export prisma client for direct use
export { prisma }
export default prisma
