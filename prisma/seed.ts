import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create test users
  const parent1 = await prisma.user.create({
    data: {
      email: 'parent1@example.com',
      name: 'Sarah Johnson',
    },
  })

  const parent2 = await prisma.user.create({
    data: {
      email: 'parent2@example.com',
      name: 'Mike Johnson',
    },
  })

  // Create a test child
  const child = await prisma.child.create({
    data: {
      name: 'Emma Johnson',
      dateOfBirth: new Date('2018-05-15'),
      diagnosis: 'Leukemia',
      allergies: 'Penicillin',
      bloodType: 'A+',
      currentWeight: 25.5,
      currentHeight: 110.0,
      headCirc: 52.0,
      ngTubePlacement: '25cm',
      keyNotes: 'Pre-warm medications before administration',
      parentId: parent1.id,
    },
  })

  // Create collaborations
  await prisma.collaboration.create({
    data: {
      userId: parent2.id,
      childId: child.id,
      role: 'parent',
    },
  })

  // Create sample medications
  await prisma.medication.create({
    data: {
      name: 'Methotrexate',
      dosage: '15mg',
      timing: 'Weekly on Mondays',
      isPRN: false,
      notes: 'Take with food',
      childId: child.id,
    },
  })

  await prisma.medication.create({
    data: {
      name: 'Ondansetron',
      dosage: '4mg',
      timing: 'As needed',
      isPRN: true,
      notes: 'For nausea',
      childId: child.id,
    },
  })

  // Create sample appointments
  await prisma.appointment.create({
    data: {
      title: 'Oncology Follow-up',
      description: 'Regular check-up with oncologist',
      datetime: new Date('2024-02-15T10:00:00'),
      location: 'Children\'s Hospital - Oncology Wing',
      specialist: 'Dr. Smith',
      childId: child.id,
    },
  })

  // Create sample todos
  await prisma.todo.create({
    data: {
      title: 'Change NG Tube',
      description: 'Replace NG tube - every 7 days',
      priority: 'high',
      assignedTo: 'Sarah',
      dueDate: new Date('2024-02-10'),
      childId: child.id,
    },
  })

  // Create sample notes
  await prisma.note.create({
    data: {
      title: 'Blood Work Results',
      content: 'WBC: 4.5, RBC: 4.2, Platelets: 250k. All within normal range.',
      type: 'medical',
      tags: ['blood-work', 'lab-results'],
      isPinned: true,
      childId: child.id,
    },
  })

  // Create sample questions
  await prisma.question.create({
    data: {
      question: 'Should we adjust medication timing for school schedule?',
      specialist: 'Oncologist',
      status: 'pending',
      tags: ['medication', 'school'],
      childId: child.id,
    },
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
