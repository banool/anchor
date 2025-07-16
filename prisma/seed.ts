import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clean up existing data (optional - comment out if you want to keep existing data)
  await prisma.notification.deleteMany()
  await prisma.invitation.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.message.deleteMany()
  await prisma.reminder.deleteMany()
  await prisma.medicalMeasurement.deleteMany()
  await prisma.medicationLog.deleteMany()
  await prisma.medication.deleteMany()
  await prisma.entry.deleteMany()
  await prisma.collaboration.deleteMany()
  await prisma.child.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const parentUser = await prisma.user.create({
    data: {
      email: 'parent@example.com',
      name: 'Sarah Johnson',
      phone: '+1-555-0123',
      avatar: 'https://example.com/avatars/sarah.jpg'
    }
  })

  const doctorUser = await prisma.user.create({
    data: {
      email: 'doctor@hospital.com',
      name: 'Dr. Michael Chen',
      phone: '+1-555-0456',
      avatar: 'https://example.com/avatars/doctor.jpg'
    }
  })

  const nurseUser = await prisma.user.create({
    data: {
      email: 'nurse@hospital.com',
      name: 'Emily Rodriguez',
      phone: '+1-555-0789',
      avatar: 'https://example.com/avatars/nurse.jpg'
    }
  })

  const grandparentUser = await prisma.user.create({
    data: {
      email: 'grandma@family.com',
      name: 'Martha Johnson',
      phone: '+1-555-0321'
    }
  })

  // Create child
  const child = await prisma.child.create({
    data: {
      name: 'Alex Johnson',
      dateOfBirth: new Date('2018-03-15'),
      diagnosis: 'Acute Lymphoblastic Leukemia (ALL)',
      allergies: 'Penicillin, Shellfish',
      bloodType: 'O+',
      currentWeight: 22.5,
      currentHeight: 1.1,
      headCircumference: 51.5,
      ngTubePlacement: 'Right nostril, 8cm depth',
      keyMedicalNotes: 'Currently in maintenance phase of treatment. Responds well to oral medications.',
      emergencyContact: 'Sarah Johnson +1-555-0123',
      hospitalId: 'CH-2024-0156',
      primaryPhysician: 'Dr. Michael Chen',
      ownerId: parentUser.id
    }
  })

  // Create collaborations
  await prisma.collaboration.create({
    data: {
      userId: parentUser.id,
      childId: child.id,
      role: 'owner',
      canViewMedical: true,
      canEditMedical: true,
      canViewNotes: true,
      canEditNotes: true,
      canViewCalendar: true,
      canEditCalendar: true,
      canViewTodos: true,
      canEditTodos: true,
      canViewMessages: true,
      canSendMessages: true,
      canInviteOthers: true
    }
  })

  await prisma.collaboration.create({
    data: {
      userId: doctorUser.id,
      childId: child.id,
      role: 'doctor',
      canViewMedical: true,
      canEditMedical: true,
      canViewNotes: true,
      canEditNotes: true,
      canViewCalendar: true,
      canEditCalendar: true,
      canViewTodos: true,
      canEditTodos: true,
      canViewMessages: true,
      canSendMessages: true,
      canInviteOthers: false
    }
  })

  await prisma.collaboration.create({
    data: {
      userId: nurseUser.id,
      childId: child.id,
      role: 'nurse',
      canViewMedical: true,
      canEditMedical: false,
      canViewNotes: true,
      canEditNotes: true,
      canViewCalendar: true,
      canEditCalendar: false,
      canViewTodos: true,
      canEditTodos: true,
      canViewMessages: true,
      canSendMessages: true,
      canInviteOthers: false
    }
  })

  await prisma.collaboration.create({
    data: {
      userId: grandparentUser.id,
      childId: child.id,
      role: 'family',
      canViewMedical: false,
      canEditMedical: false,
      canViewNotes: true,
      canEditNotes: false,
      canViewCalendar: true,
      canEditCalendar: false,
      canViewTodos: true,
      canEditTodos: false,
      canViewMessages: true,
      canSendMessages: true,
      canInviteOthers: false
    }
  })

  // Create medications
  const medication1 = await prisma.medication.create({
    data: {
      name: 'Mercaptopurine',
      dosage: '25mg',
      timing: 'Evening with food',
      frequency: 'daily',
      notes: 'Take 2 hours after dinner. Monitor for nausea.',
      childId: child.id
    }
  })

  const medication2 = await prisma.medication.create({
    data: {
      name: 'Methotrexate',
      dosage: '15mg',
      timing: 'Monday morning',
      frequency: 'weekly',
      notes: 'Take on empty stomach. Follow with leucovorin rescue.',
      childId: child.id
    }
  })

  const medication3 = await prisma.medication.create({
    data: {
      name: 'Ondansetron',
      dosage: '4mg',
      timing: 'As needed',
      frequency: 'as_needed',
      notes: 'For nausea/vomiting. Max 3 doses per day.',
      childId: child.id
    }
  })

  // Create medication logs
  await prisma.medicationLog.create({
    data: {
      medicationId: medication1.id,
      administeredBy: parentUser.name!,
      dosageGiven: '25mg',
      notes: 'Taken with dinner. No adverse effects.',
      administeredAt: new Date()
    }
  })

  await prisma.medicationLog.create({
    data: {
      medicationId: medication2.id,
      administeredBy: nurseUser.name!,
      dosageGiven: '15mg',
      notes: 'Weekly dose administered. Patient tolerated well.',
      administeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  })

  // Create entries (without type field)
  await prisma.entry.create({
    data: {
      title: 'Weekly blood work',
      description: 'CBC with differential and comprehensive metabolic panel',
      tags: ['medical', 'lab', 'routine'],
      priority: 'high',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      data: {
        location: 'Children\'s Hospital Lab',
        fasting: false,
        estimatedDuration: '30 minutes'
      },
      userId: parentUser.id,
      childId: child.id,
      assignedToId: parentUser.id,
      assignedById: doctorUser.id
    }
  })

  await prisma.entry.create({
    data: {
      title: 'Oncology follow-up appointment',
      description: 'Monthly check-up with Dr. Chen',
      tags: ['appointment', 'oncology'],
      priority: 'high',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      data: {
        location: 'Children\'s Hospital, Oncology Wing',
        duration: '45 minutes',
        preparation: 'Bring current medication list'
      },
      userId: doctorUser.id,
      childId: child.id,
      assignedToId: parentUser.id,
      assignedById: doctorUser.id
    }
  })

  await prisma.entry.create({
    data: {
      title: 'Update medication schedule',
      description: 'Review and update timing for evening medications',
      tags: ['todo', 'medication'],
      priority: 'medium',
      data: {
        medications: ['Mercaptopurine'],
        reason: 'Adjust for better absorption'
      },
      userId: parentUser.id,
      childId: child.id,
      assignedToId: parentUser.id,
      assignedById: parentUser.id
    }
  })

  await prisma.entry.create({
    data: {
      title: 'Insurance pre-authorization',
      description: 'Submit pre-auth request for next month\'s medications',
      tags: ['todo', 'insurance', 'urgent'],
      priority: 'urgent',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      data: {
        medications: ['Mercaptopurine', 'Methotrexate'],
        insuranceProvider: 'Blue Cross',
        contactNumber: '1-800-555-0199'
      },
      userId: parentUser.id,
      childId: child.id,
      assignedToId: parentUser.id,
      assignedById: parentUser.id
    }
  })

  await prisma.entry.create({
    data: {
      title: 'Treatment side effects note',
      description: 'Alex experienced mild nausea after last chemo session',
      tags: ['note', 'side-effects'],
      priority: 'medium',
      data: {
        symptoms: ['nausea', 'fatigue'],
        duration: '2 hours',
        treatment: 'Ondansetron 4mg',
        outcome: 'Symptoms resolved'
      },
      userId: parentUser.id,
      childId: child.id,
      assignedById: parentUser.id,
      completedAt: new Date()
    }
  })

  // Create medical measurements
  await prisma.medicalMeasurement.create({
    data: {
      type: 'weight',
      value: 22.5,
      unit: 'kg',
      notes: 'Stable weight, good appetite',
      measuredBy: nurseUser.name!,
      childId: child.id
    }
  })

  await prisma.medicalMeasurement.create({
    data: {
      type: 'height',
      value: 1.1,
      unit: 'm',
      notes: 'Normal growth progression',
      measuredBy: nurseUser.name!,
      childId: child.id
    }
  })

  await prisma.medicalMeasurement.create({
    data: {
      type: 'blood_pressure',
      value: 110,
      additionalValue: 70,
      unit: 'mmHg',
      notes: 'Normal BP for age',
      measuredBy: nurseUser.name!,
      childId: child.id
    }
  })

  await prisma.medicalMeasurement.create({
    data: {
      type: 'temperature',
      value: 36.5,
      unit: '°C',
      notes: 'Normal temperature',
      measuredBy: parentUser.name!,
      childId: child.id
    }
  })

  await prisma.medicalMeasurement.create({
    data: {
      type: 'blood_levels',
      value: 4500,
      unit: 'cells/μL',
      testName: 'White Blood Cell Count',
      normalRange: '4,000-11,000 cells/μL',
      notes: 'WBC within normal range',
      measuredBy: 'Lab Tech',
      childId: child.id
    }
  })

  // Create reminders
  await prisma.reminder.create({
    data: {
      title: 'Evening medication reminder',
      description: 'Time for Alex\'s Mercaptopurine',
      type: 'medication',
      frequency: 'daily',
      resetOnCompletion: true,
      nextDueAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      assignedTo: parentUser.id,
      childId: child.id
    }
  })

  await prisma.reminder.create({
    data: {
      title: 'Weekly weight check',
      description: 'Monitor Alex\'s weight and record',
      type: 'measurement',
      frequency: 'weekly',
      resetOnCompletion: true,
      nextDueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assignedTo: parentUser.id,
      childId: child.id
    }
  })

  // Create messages
  await prisma.message.create({
    data: {
      content: 'Alex had a great day today! Energy levels seem to be improving.',
      type: 'general',
      tags: ['daily-update', 'positive'],
      userId: parentUser.id,
      childId: child.id
    }
  })

  await prisma.message.create({
    data: {
      content: 'Lab results show stable blood counts. Continue current treatment plan.',
      type: 'medical',
      tags: ['lab-results', 'treatment'],
      userId: doctorUser.id,
      childId: child.id
    }
  })

  await prisma.message.create({
    data: {
      content: 'Reminder: Next appointment is scheduled for next week. Please arrive 15 minutes early.',
      type: 'system',
      tags: ['appointment', 'reminder'],
      userId: nurseUser.id,
      childId: child.id
    }
  })

  await prisma.message.create({
    data: {
      content: 'Thinking of you all. Let me know if you need anything! ❤️',
      type: 'general',
      tags: ['support', 'family'],
      userId: grandparentUser.id,
      childId: child.id
    }
  })

  // Create contacts
  await prisma.contact.create({
    data: {
      name: 'Children\'s Hospital Main',
      type: 'hospital',
      phone: '+1-555-0100',
      email: 'info@childrenshospital.org',
      address: '123 Medical Center Drive, City, State 12345',
      availability: '24/7 Emergency',
      notes: 'Main hospital number for emergencies',
      childId: child.id
    }
  })

  await prisma.contact.create({
    data: {
      name: 'Dr. Michael Chen',
      type: 'doctor',
      phone: '+1-555-0456',
      email: 'mchen@childrenshospital.org',
      specialty: 'Pediatric Oncology',
      department: 'Oncology',
      hospital: 'Children\'s Hospital',
      availability: 'Mon-Fri 8AM-5PM',
      notes: 'Primary oncologist',
      favoritedAt: new Date(),
      childId: child.id
    }
  })

  await prisma.contact.create({
    data: {
      name: 'Emily Rodriguez',
      type: 'specialist',
      phone: '+1-555-0789',
      email: 'erodriguez@childrenshospital.org',
      specialty: 'Pediatric Nursing',
      department: 'Oncology',
      hospital: 'Children\'s Hospital',
      availability: 'Mon-Fri 7AM-7PM',
      notes: 'Primary nurse coordinator',
      favoritedAt: new Date(),
      childId: child.id
    }
  })

  await prisma.contact.create({
    data: {
      name: 'City Pharmacy',
      type: 'pharmacy',
      phone: '+1-555-0987',
      email: 'prescriptions@citypharmacy.com',
      address: '456 Main Street, City, State 12345',
      availability: 'Mon-Sat 9AM-9PM, Sun 10AM-6PM',
      notes: 'Specialized in oncology medications',
      childId: child.id
    }
  })

  await prisma.contact.create({
    data: {
      name: 'Emergency Services',
      type: 'emergency',
      phone: '911',
      availability: '24/7',
      notes: 'Emergency services - call for immediate medical emergencies',
      favoritedAt: new Date(),
      childId: child.id
    }
  })

  // Create notifications
  await prisma.notification.create({
    data: {
      title: 'Medication Reminder',
      message: 'Time for Alex\'s evening medication',
      type: 'reminder',
      relatedItemId: medication1.id,
      data: {
        medicationId: medication1.id,
        medicationName: 'Mercaptopurine'
      },
      userId: parentUser.id,
      childId: child.id
    }
  })

  await prisma.notification.create({
    data: {
      title: 'Lab Results Available',
      message: 'New lab results have been posted',
      type: 'system',
      data: {
        testType: 'CBC with differential'
      },
      userId: parentUser.id,
      childId: child.id
    }
  })

  const messageEntry = await prisma.message.create({
    data: {
      content: 'Lab results discussion - please review before next appointment',
      type: 'medical',
      tags: ['lab-results', 'discussion'],
      userId: doctorUser.id,
      childId: child.id
    }
  })

  await prisma.notification.create({
    data: {
      title: 'New Message',
      message: 'Dr. Chen sent a message about treatment plan',
      type: 'message',
      relatedItemId: messageEntry.id,
      data: {
        senderId: doctorUser.id,
        senderName: doctorUser.name
      },
      userId: parentUser.id,
      childId: child.id
    }
  })

  // Create a notification for an entry
  const labEntry = await prisma.entry.create({
    data: {
      title: 'Review lab results',
      description: 'Review CBC results and discuss with Dr. Chen',
      tags: ['lab-results', 'follow-up'],
      priority: 'high',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      userId: parentUser.id,
      childId: child.id,
      assignedToId: parentUser.id,
      assignedById: doctorUser.id
    }
  })

  await prisma.notification.create({
    data: {
      title: 'New Task Assigned',
      message: 'Dr. Chen assigned you a new task: Review lab results',
      type: 'entry',
      relatedItemId: labEntry.id,
      data: {
        assignedBy: doctorUser.name,
        priority: 'high'
      },
      userId: parentUser.id,
      childId: child.id
    }
  })

  // Create invitation
  await prisma.invitation.create({
    data: {
      email: 'caregiver@example.com',
      role: 'caregiver',
      token: 'invite-token-123',
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      senderId: parentUser.id,
      childId: child.id
    }
  })

  console.log('✅ Seed completed successfully!')
  console.log(`Created:`)
  console.log(`- 4 users (parent, doctor, nurse, grandparent)`)
  console.log(`- 1 child (Alex Johnson)`)
  console.log(`- 4 collaborations with different permission levels`)
  console.log(`- 3 medications with logs`)
  console.log(`- 6 entries (appointments, todos, notes, follow-ups)`)
  console.log(`- 5 medical measurements`)
  console.log(`- 2 reminders`)
  console.log(`- 5 messages`)
  console.log(`- 5 contacts`)
  console.log(`- 4 notifications (with model attachments)`)
  console.log(`- 1 pending invitation`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
