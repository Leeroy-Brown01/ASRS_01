# Digital Application Submission and Review System - MVP Implementation Plan

## Project Overview
A full-stack React application for digital application submission and review with Firebase backend.

## Core Files to Create/Modify (Max 8 files limit)

### 1. **src/pages/Index.tsx** - Main Application Component
- Firebase configuration and initialization
- Authentication state management
- Role-based routing and navigation
- Main layout with sidebar navigation

### 2. **src/components/AuthComponents.tsx** - Authentication System
- Login/Register forms for all user types
- Firebase Authentication integration
- Role assignment during registration
- Protected route wrapper

### 3. **src/components/ApplicantDashboard.tsx** - Applicant Interface
- Personal dashboard showing application status
- Multi-step application form (Personal Info, Project Details, File Upload)
- Application history and editing capabilities
- Real-time status updates

### 4. **src/components/ReviewerDashboard.tsx** - Reviewer Interface
- Assigned applications list
- Application detail view with review form
- Scoring system (1-10) and comments
- Status update functionality

### 5. **src/components/AdminDashboard.tsx** - Admin Interface
- Complete application overview with filters
- User management and role assignment
- Application assignment to reviewers
- Basic reporting and data export

### 6. **src/lib/firebase.ts** - Firebase Configuration
- Firebase app initialization
- Firestore, Auth, and Storage setup
- Database helper functions
- Security rules implementation

### 7. **src/components/FileUpload.tsx** - File Upload Component
- Firebase Storage integration
- Progress bar for uploads
- File type validation
- Secure file handling

### 8. **src/types/index.ts** - TypeScript Definitions
- User role types
- Application data structures
- Review and comment interfaces
- Firebase document types

## Key Features Implementation Priority

### Phase 1: Core Authentication & Navigation
- Firebase setup and authentication
- Role-based user registration/login
- Main layout with role-based navigation

### Phase 2: Applicant Functionality
- Application submission form
- Personal dashboard
- File upload system

### Phase 3: Reviewer & Admin Features
- Review system with scoring
- Admin management interface
- Real-time updates

## Technical Implementation Notes

### Firebase Structure:
```
users/
  {userId}/
    - role: 'applicant' | 'reviewer' | 'admin'
    - email, name, createdAt

applications/
  {applicationId}/
    - applicantId, title, description, status
    - personalInfo, projectDetails
    - fileUrls[], createdAt, updatedAt

reviews/
  {reviewId}/
    - applicationId, reviewerId
    - score, comments, createdAt
```

### Security Rules:
- Applicants: Read/write own applications only
- Reviewers: Read assigned applications, write reviews
- Admins: Full access to all data

### Real-time Features:
- Application status updates
- New application notifications
- Review completion alerts

This MVP focuses on core functionality while maintaining the 8-file limit for higher success rate.