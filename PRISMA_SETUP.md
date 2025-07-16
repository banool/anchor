# Prisma + Supabase Setup Guide

## Configuration Steps

### 1. Set up your Supabase project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Go to Settings → Database and find your connection string

### 2. Configure environment variables
Update your `.env` file with your actual Supabase credentials:

```env
# Replace with your actual Supabase database URL
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Replace with your actual Supabase project URL and anon key
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
```

### 3. Push your schema to Supabase
Run the following command to create the tables in your Supabase database:

```bash
pnpm db:push
```

### 4. (Optional) Seed your database
Populate your database with sample data:

```bash
pnpm db:seed
```

### 5. Generate Prisma client
Generate the Prisma client (should already be done):

```bash
pnpm db:generate
```

## Available Scripts

- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema changes to database
- `pnpm db:migrate` - Create and run migrations
- `pnpm db:studio` - Open Prisma Studio (database GUI)
- `pnpm db:seed` - Seed database with sample data

## Database Schema

The schema includes models for:
- **User** - App users (parents, caregivers)
- **Child** - Children with medical information
- **Collaboration** - User permissions for each child
- **Medication** - Medication tracking
- **Appointment** - Medical appointments
- **Todo** - Task management
- **Note** - General notes and observations
- **Question** - Questions for specialists

## Usage Examples

```typescript
import { childService, medicationService } from '../lib/database'

// Get child with all related data
const child = await childService.findById(childId)

// Get all medications for a child
const medications = await medicationService.findByChildId(childId)

// Create a new medication
const medication = await medicationService.create({
  name: 'Methotrexate',
  dosage: '15mg',
  timing: 'Weekly',
  childId: childId
})
```

## Next Steps

1. Configure your `.env` file with actual Supabase credentials
2. Run `pnpm db:push` to create the database tables
3. Run `pnpm db:seed` to populate with sample data
4. Start building your React Native components using the database services
5. Set up real-time subscriptions with Supabase for collaborative features

## Security Notes

- Never commit your `.env` file to version control
- Use Row Level Security (RLS) in Supabase for data protection
- Consider implementing proper authentication before production
