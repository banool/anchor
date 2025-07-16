# Firebase Setup Guide for Anchor App

This guide will walk you through setting up Firebase for your Anchor app with Cloud SQL + Data Connect, Firebase Authentication, Firebase Crashlytics, and Firebase Remote Config.

## Prerequisites

1. A Firebase project (create one at https://console.firebase.google.com/)
2. A Google Cloud Platform project with billing enabled
3. Cloud SQL instance set up for PostgreSQL

## 1. Firebase Project Setup

### Step 1: Create Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name your project (e.g., "anchor-app")
4. Enable Google Analytics if desired
5. Create the project

### Step 2: Add Your Apps
1. In the Firebase console, click "Add app"
2. Select iOS and Android platforms
3. Download the configuration files:
   - `google-services.json` for Android
   - `GoogleService-Info.plist` for iOS
4. Place these files in your project root directory

## 2. Firebase Authentication Setup

### Step 1: Enable Authentication
1. In the Firebase console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable the following providers:
   - **Google**: Click "Enable", then configure
   - **Apple**: Click "Enable" (iOS only)

### Step 2: Configure Google Sign-In
1. In the Google provider settings:
   - Copy the "Web client ID"
   - Add this to your environment variables as `GOOGLE_WEB_CLIENT_ID`
2. Update your `app.json` with the correct iOS URL scheme:
   ```json
   {
     "expo": {
       "plugins": [
         [
           "@react-native-google-signin/google-signin",
           {
             "iosUrlScheme": "com.googleusercontent.apps.YOUR_GOOGLE_CLIENT_ID"
           }
         ]
       ]
     }
   }
   ```

### Step 3: Configure Apple Sign-In (iOS Only)
1. In the Apple provider settings:
   - Add your iOS bundle ID
   - Add your team ID
   - Configure the key ID and private key

## 3. Cloud SQL Setup

### Step 1: Create Cloud SQL Instance
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to SQL > Create Instance
3. Choose PostgreSQL
4. Configure your instance:
   - Instance ID: `anchor-db-instance`
   - Database version: PostgreSQL 14 or later
   - Region: `us-central1` (or your preferred region)
   - Machine type: Choose based on your needs
5. Create the instance

### Step 2: Create Database
1. In the Cloud SQL console, select your instance
2. Go to "Databases" tab
3. Click "Create database"
4. Name it `anchor_db`
5. Create the database

### Step 3: Set Up Database User
1. Go to "Users" tab in your Cloud SQL instance
2. Click "Add user account"
3. Create a PostgreSQL user with username and password
4. Grant necessary permissions

## 4. Firebase Data Connect Setup

### Step 1: Enable Data Connect
1. In the Firebase console, go to "Data Connect"
2. Click "Get started"
3. Select your Cloud SQL instance
4. Choose the database you created (`anchor_db`)
5. Set up the connection

### Step 2: Configure Data Connect
The project already includes Data Connect configuration files:
- `dataconnect/dataconnect.yaml` - Main configuration
- `dataconnect/schema/schema.gql` - GraphQL schema
- `dataconnect/anchor-connector/` - Connector configuration

Update the `dataconnect/dataconnect.yaml` file with your instance details:

```yaml
specVersion: 'v1alpha'
serviceId: 'anchor-service'
location: 'us-central1'  # Update to your region
schema:
  source: './schema'
  datasource:
    postgresql:
      database: 'anchor_db'
      cloudSql:
        instanceId: 'your-project-id:region:anchor-db-instance'  # Update this
connectorDirs: ['./anchor-connector']
```

### Step 3: Deploy Data Connect
Run the following commands:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Deploy Data Connect
firebase deploy --only dataconnect
```

## 5. Firebase Services Setup

### Step 1: Enable Firebase Services
In the Firebase console, enable:
1. **Authentication**: Already enabled from step 2
2. **Crashlytics**: Go to Quality > Crashlytics > Enable
3. **Remote Config**: Go to Engage > Remote Config > Get started

### Step 2: Configure Remote Config
1. In Remote Config, add the following parameters:
   - `enable_new_feature` (Boolean): `false`
   - `max_entries_per_child` (Number): `1000`
   - `enable_push_notifications` (Boolean): `true`
   - `enable_collaboration` (Boolean): `true`
   - `maintenance_mode` (Boolean): `false`

2. Publish the configuration

## 6. Environment Configuration

### Step 1: Create Environment File
Copy the provided `env.example` file to `.env` and update with your values:

```bash
cp env.example .env
```

### Step 2: Update Environment Variables
Edit `.env` with your Firebase configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@/anchor_db?host=/cloudsql/your-project-id:region:anchor-db-instance"

# Firebase Configuration
FIREBASE_API_KEY="your_api_key_here"
FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
FIREBASE_PROJECT_ID="your_project_id"
FIREBASE_STORAGE_BUCKET="your_project_id.appspot.com"
FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
FIREBASE_APP_ID="your_app_id"
FIREBASE_MEASUREMENT_ID="G-your_measurement_id"

# Google Sign-In Configuration
GOOGLE_WEB_CLIENT_ID="your_google_web_client_id.apps.googleusercontent.com"

# Cloud SQL Configuration
CLOUD_SQL_CONNECTION_NAME="your_project_id:region:anchor-db-instance"
CLOUD_SQL_DATABASE_NAME="anchor_db"
CLOUD_SQL_USER="your_cloud_sql_user"
CLOUD_SQL_PASSWORD="your_cloud_sql_password"
```

## 7. Database Migration

### Step 1: Run Prisma Migration
Since you're switching from Supabase to Firebase, you'll need to run the database migration:

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to Cloud SQL
pnpm db:push

# Run seed data (optional)
pnpm db:seed
```

### Step 2: Verify Database Setup
Check that your database is properly configured:

```bash
# Open Prisma Studio to verify
pnpm db:studio
```

## 8. Build and Test

### Step 1: Build Development Client
Since you're using React Native Firebase, you need to build a development client:

```bash
# Build for iOS
npx expo run:ios

# Build for Android
npx expo run:android
```

### Step 2: Test Firebase Services
1. **Authentication**: Test Google and Apple sign-in
2. **Crashlytics**: Check the Firebase console after running the app
3. **Remote Config**: Verify config values are loaded in the app
4. **Data Connect**: Test database operations

## 9. Authentication Flow

The app now includes a complete authentication system:

### Features Implemented:
- **Google Sign-In**: Social login with Google accounts
- **Apple Sign-In**: Social login with Apple ID (iOS only)
- **User Management**: Automatic user creation and database integration
- **Authentication State**: Persistent login state management
- **Route Protection**: Authenticated routes with automatic redirects

### Authentication Flow:
1. User opens app → Redirected to login screen if not authenticated
2. User signs in with Google/Apple → User record created in database
3. User is redirected to main app with full access
4. User can sign out from profile section

## 10. Production Deployment

### Step 1: App Store Configuration
1. Add the configuration files to your iOS/Android projects
2. Update `app.json` with your bundle identifiers
3. Configure proper signing certificates
4. Build and submit to app stores

### Step 2: Firebase Security Rules
Set up appropriate security rules for your Firebase services.

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Check that Google/Apple sign-in is properly configured
   - Verify environment variables are set correctly
   - Ensure bundle IDs match in Firebase console

2. **Build Errors**:
   - Make sure you have the latest Expo CLI and React Native Firebase
   - Verify all native dependencies are properly installed

3. **Database Connection**:
   - Verify your Cloud SQL instance is running and accessible
   - Check that Data Connect is properly configured

4. **Navigation Issues**:
   - Ensure all route files are properly created
   - Check that authentication context is properly wrapped

### Debug Commands

```bash
# Check Firebase project
firebase projects:list

# Test database connection
pnpm db:studio

# Verify Prisma client
pnpm db:generate

# Check authentication state
# Look at the app logs for authentication status
```

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)
- [React Native Firebase](https://rnfirebase.io/)

## Next Steps

Once setup is complete, you can:
1. Start using the authentication system for user management
2. Implement collaboration features with user invitations
3. Use Remote Config for feature flags and A/B testing
4. Monitor app performance and crashes with Crashlytics
5. Scale your Cloud SQL instance as needed

The app now has a complete authentication system integrated with Firebase and is ready for user management and collaboration features!
