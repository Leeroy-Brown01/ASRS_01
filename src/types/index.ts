// TypeScript type definitions for the application
import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'applicant' | 'reviewer' | 'admin';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
}

export interface ProjectDetails {
  title: string;
  description: string;
  category: string;
  budget: number;
  timeline: string;
  objectives: string[];
}

export interface Application {
  id: string;
  applicantId: string;
  status: 'pending' | 'in-review' | 'accepted' | 'rejected';
  personalInfo: PersonalInfo;
  projectDetails: ProjectDetails;
  fileUrls: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Review {
  id: string;
  applicationId: string;
  reviewerId: string;
  reviewerName: string;
  score: number;
  comments: string;
  privateNotes: string;
  createdAt: Timestamp;
}

export interface FileUploadProgress {
  file: File;
  progress: number;
  url?: string;
  error?: string;
}

export interface ApplicationFormData {
  personalInfo: PersonalInfo;
  projectDetails: ProjectDetails;
  files: File[];
}

export interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  inReviewApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
}