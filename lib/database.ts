import type { Appointment, Child, Medication, Note, Question, Todo } from '@prisma/client';
import { prisma } from './prisma';

// User operations
export const userService = {
  async create(data: { email: string; name?: string }) {
    return await prisma.user.create({ data })
  },

  async findByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } })
  },

  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        children: true,
        collaborations: true,
      }
    })
  },
}

// Child operations
export const childService = {
  async create(data: {
    name: string
    parentId: string
    dateOfBirth?: Date
    diagnosis?: string
    allergies?: string
    bloodType?: string
    currentWeight?: number
    currentHeight?: number
    headCirc?: number
    ngTubePlacement?: string
    keyNotes?: string
  }) {
    return await prisma.child.create({ data })
  },

  async findById(id: string) {
    return await prisma.child.findUnique({
      where: { id },
      include: {
        parent: true,
        medications: true,
        appointments: true,
        todos: true,
        notes: true,
        questions: true,
      }
    })
  },

  async findByParentId(parentId: string) {
    return await prisma.child.findMany({
      where: { parentId },
      include: {
        medications: true,
        appointments: true,
        todos: true,
        notes: true,
        questions: true,
      }
    })
  },

  async update(id: string, data: Partial<Child>) {
    return await prisma.child.update({
      where: { id },
      data,
    })
  },
}

// Medication operations
export const medicationService = {
  async create(data: {
    name: string
    dosage: string
    timing: string
    isPRN?: boolean
    notes?: string
    childId: string
  }) {
    return await prisma.medication.create({ data })
  },

  async findByChildId(childId: string) {
    return await prisma.medication.findMany({
      where: { childId },
      orderBy: { name: 'asc' }
    })
  },

  async update(id: string, data: Partial<Medication>) {
    return await prisma.medication.update({
      where: { id },
      data,
    })
  },

  async delete(id: string) {
    return await prisma.medication.delete({ where: { id } })
  },
}

// Appointment operations
export const appointmentService = {
  async create(data: {
    title: string
    description?: string
    datetime: Date
    location?: string
    specialist?: string
    childId: string
  }) {
    return await prisma.appointment.create({ data })
  },

  async findByChildId(childId: string) {
    return await prisma.appointment.findMany({
      where: { childId },
      orderBy: { datetime: 'asc' }
    })
  },

  async findUpcoming(childId: string) {
    return await prisma.appointment.findMany({
      where: {
        childId,
        datetime: {
          gte: new Date()
        }
      },
      orderBy: { datetime: 'asc' }
    })
  },

  async update(id: string, data: Partial<Appointment>) {
    return await prisma.appointment.update({
      where: { id },
      data,
    })
  },

  async delete(id: string) {
    return await prisma.appointment.delete({ where: { id } })
  },
}

// Todo operations
export const todoService = {
  async create(data: {
    title: string
    description?: string
    priority?: string
    assignedTo?: string
    dueDate?: Date
    childId: string
  }) {
    return await prisma.todo.create({ data })
  },

  async findByChildId(childId: string) {
    return await prisma.todo.findMany({
      where: { childId },
      orderBy: [
        { completed: 'asc' },
        { dueDate: 'asc' },
        { priority: 'desc' }
      ]
    })
  },

  async findPending(childId: string) {
    return await prisma.todo.findMany({
      where: {
        childId,
        completed: false
      },
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' }
      ]
    })
  },

  async markComplete(id: string) {
    return await prisma.todo.update({
      where: { id },
      data: {
        completed: true,
        completedAt: new Date()
      }
    })
  },

  async update(id: string, data: Partial<Todo>) {
    return await prisma.todo.update({
      where: { id },
      data,
    })
  },

  async delete(id: string) {
    return await prisma.todo.delete({ where: { id } })
  },
}

// Note operations
export const noteService = {
  async create(data: {
    title?: string
    content: string
    type?: string
    tags?: string[]
    isPinned?: boolean
    childId: string
  }) {
    return await prisma.note.create({ data })
  },

  async findByChildId(childId: string) {
    return await prisma.note.findMany({
      where: { childId },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    })
  },

  async findByTags(childId: string, tags: string[]) {
    return await prisma.note.findMany({
      where: {
        childId,
        tags: {
          hasSome: tags
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  },

  async update(id: string, data: Partial<Note>) {
    return await prisma.note.update({
      where: { id },
      data,
    })
  },

  async delete(id: string) {
    return await prisma.note.delete({ where: { id } })
  },
}

// Question operations
export const questionService = {
  async create(data: {
    question: string
    specialist?: string
    tags?: string[]
    childId: string
  }) {
    return await prisma.question.create({ data })
  },

  async findByChildId(childId: string) {
    return await prisma.question.findMany({
      where: { childId },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' }
      ]
    })
  },

  async findPending(childId: string) {
    return await prisma.question.findMany({
      where: {
        childId,
        status: 'pending'
      },
      orderBy: { createdAt: 'desc' }
    })
  },

  async markAnswered(id: string, answer: string) {
    return await prisma.question.update({
      where: { id },
      data: {
        answer,
        status: 'answered',
        answeredAt: new Date()
      }
    })
  },

  async update(id: string, data: Partial<Question>) {
    return await prisma.question.update({
      where: { id },
      data,
    })
  },

  async delete(id: string) {
    return await prisma.question.delete({ where: { id } })
  },
}
