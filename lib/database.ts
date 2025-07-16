import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Base where clause for soft deletion
const withoutDeleted = { deletedAt: null }

// Helper function to soft delete by setting deletedAt
const softDelete = async (model: any, id: string) => {
  return await model.update({
    where: { id },
    data: { deletedAt: new Date() }
  })
}

// Entry operations
export const getEntries = async (childId: string, filters?: {
  tags?: string[]
  priority?: string
  assignedToId?: string
  isCompleted?: boolean
}) => {
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
  return await prisma.entry.update({
    where: { id, ...withoutDeleted },
    data,
    include: {
      user: true,
      assignedTo: true,
      assignedBy: true
    }
  })
}

export const deleteEntry = async (id: string) => {
  return await softDelete(prisma.entry, id)
}

// Medication operations
export const getMedications = async (childId: string, activeOnly = true) => {
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
}

export const createMedication = async (data: {
  name: string
  dosage: string
  timing: string
  frequency?: string
  notes?: string
  childId: string
}) => {
  return await prisma.medication.create({ data })
}

export const logMedication = async (data: {
  medicationId: string
  administeredBy: string
  dosageGiven: string
  notes?: string
  administeredAt?: Date
}) => {
  return await prisma.medicationLog.create({ data })
}

export const deleteMedication = async (id: string) => {
  return await softDelete(prisma.medication, id)
}

// Medical measurements
export const getMedicalMeasurements = async (childId: string, type?: string) => {
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
  return await prisma.medicalMeasurement.create({ data })
}

export const deleteMedicalMeasurement = async (id: string) => {
  return await softDelete(prisma.medicalMeasurement, id)
}

// Reminders
export const getReminders = async (childId: string, activeOnly = true) => {
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
  return await prisma.reminder.create({ data })
}

export const deleteReminder = async (id: string) => {
  return await softDelete(prisma.reminder, id)
}

// Messages
export const getMessages = async (childId: string, limit = 50) => {
  return await prisma.message.findMany({
    where: {
      childId,
      ...withoutDeleted
    },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
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
  return await prisma.message.create({
    data,
    include: { user: true }
  })
}

export const deleteMessage = async (id: string) => {
  return await softDelete(prisma.message, id)
}

// Contacts
export const getContacts = async (childId: string, type?: string) => {
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
  return await prisma.contact.create({ data })
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
  const token = Math.random().toString(36).substring(2, 15)

  return await prisma.invitation.create({
    data: {
      ...data,
      token
    }
  })
}

export const acceptInvitation = async (token: string, userId: string) => {
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
}

export const deleteInvitation = async (id: string) => {
  return await softDelete(prisma.invitation, id)
}

// Notifications
export const getNotifications = async (userId: string, unreadOnly = false) => {
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
  return await prisma.notification.create({ data })
}

export const markNotificationRead = async (id: string) => {
  return await prisma.notification.update({
    where: { id, ...withoutDeleted },
    data: { readAt: new Date() }
  })
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
  return await createNotification({
    title: params.title,
    message: params.message,
    type: params.modelType,
    relatedItemId: params.relatedItemId,
    data: params.data,
    scheduledAt: params.scheduledAt,
    userId: params.userId,
    childId: params.childId
  })
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
