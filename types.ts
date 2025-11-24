
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username: string; // This is ID Card Number for Student/Teacher
  password?: string;
  avatar: string;
  instrument?: string; // New field for student's instrument
  stats?: {
    attendance?: number;
    tasks?: number;
    students?: number;
  };
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  assignedBy: string; // Teacher Name
  status: 'pending' | 'submitted' | 'graded';
  subject: string;
  studentId: string; // Link to specific student
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: 'PDF' | 'IMAGE' | 'AUDIO' | 'VIDEO';
  url: string;
  studentId: string; // Specific student ID
  uploadedBy: string;
  date: string;
  isNew?: boolean; // For notification tracking
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'info' | 'alert' | 'event';
}

export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late';
  studentId: string;
}

export interface SystemNotification {
  id: string;
  message: string;
  time: string;
  type: 'success' | 'info' | 'alert';
  targetRole: UserRole | 'ALL';
  targetUserId?: string; // Target specific user individually
}

export type ScreenName = 
  | 'AUTH' 
  | 'STUDENT_DASH' 
  | 'STUDENT_HOMEWORK' 
  | 'STUDENT_ATTENDANCE'
  | 'TEACHER_DASH' 
  | 'TEACHER_STUDENTS'
  | 'TEACHER_ADD_ATTENDANCE'
  | 'ADMIN_DASH'
  | 'ADMIN_ADD_USER'
  | 'PROFILE';
