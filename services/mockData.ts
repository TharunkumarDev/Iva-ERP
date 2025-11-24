
import { User, UserRole, Homework, Announcement, SystemNotification, StudyMaterial, AttendanceRecord } from '../types';

// Mock Database
let USERS: User[] = [
  {
    id: 'admin1',
    name: 'Master Admin',
    role: UserRole.ADMIN,
    username: 'ivamuc001',
    password: 'Ivamusic001',
    avatar: 'https://picsum.photos/id/1/200/200',
    stats: { students: 120, tasks: 5 }
  },
  {
    id: 'student1',
    name: 'Alice Melody',
    role: UserRole.STUDENT,
    username: 'IVA-S001',
    password: 'password123',
    avatar: 'https://picsum.photos/id/64/200/200',
    instrument: 'Piano',
    stats: { attendance: 92, tasks: 3 }
  },
  {
    id: 'student2',
    name: 'John Doe',
    role: UserRole.STUDENT,
    username: 'IVA-S002',
    password: 'password123',
    avatar: 'https://picsum.photos/id/65/200/200',
    instrument: 'Guitar',
    stats: { attendance: 85, tasks: 1 }
  },
  {
    id: 'teacher1',
    name: 'Prof. Harmony',
    role: UserRole.TEACHER,
    username: 'IVA-T001',
    avatar: 'https://picsum.photos/id/22/200/200',
    stats: { students: 45, tasks: 12 }
  }
];

const HOMEWORK: Homework[] = [
  {
    id: 'hw1',
    title: 'Major Scales Practice',
    description: 'Record a video playing C Major scale in 2 octaves.',
    dueDate: '2023-10-25',
    assignedBy: 'Prof. Harmony',
    status: 'pending',
    subject: 'Piano',
    studentId: 'student1'
  },
  {
    id: 'hw2',
    title: 'Music Theory Basics',
    description: 'Complete the worksheet on intervals.',
    dueDate: '2023-10-28',
    assignedBy: 'Prof. Harmony',
    status: 'submitted',
    subject: 'Theory',
    studentId: 'student1'
  }
];

let MATERIALS: StudyMaterial[] = [
  {
    id: 'm1',
    title: 'Sheet Music - Fur Elise',
    type: 'PDF',
    url: '#',
    studentId: 'student1',
    uploadedBy: 'Prof. Harmony',
    date: '2023-10-20',
    isNew: false
  }
];

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Annual Recital',
    content: 'The winter recital will be held on December 15th.',
    date: '2 Oct',
    type: 'event'
  },
  {
    id: 'a2',
    title: 'School Closed',
    content: 'Academy closed for maintenance this Sunday.',
    date: '5 Oct',
    type: 'alert'
  }
];

let NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'n1',
    message: 'Welcome to the new term!',
    time: '1 day ago',
    type: 'info',
    targetRole: 'ALL'
  }
];

export const MockService = {
  login: async (username: string, role: UserRole, password?: string): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Case insensitive username match
        const normalizedInput = username.trim().toLowerCase();
        const user = USERS.find(u => u.username.toLowerCase() === normalizedInput && u.role === role);
        
        if (user) {
          // If the user has a specific password set, verify it
          if (user.password) {
            if (user.password === password) {
              resolve(user);
            } else {
              resolve(null);
            }
          } else {
             // Legacy/Mock behavior: If no password set on user object, allow access (or check hardcoded admin)
             if (role === UserRole.ADMIN) {
                if (password === 'Ivamusic001') resolve(user);
                else resolve(null);
             } else {
                resolve(user); // Allow students/teachers without passwords for now
             }
          }
        } else {
          resolve(null);
        }
      }, 800);
    });
  },

  getHomework: (studentId: string) => HOMEWORK.filter(h => h.studentId === studentId),
  
  addHomework: (homework: Homework) => {
    HOMEWORK.push(homework);
    
    // Notify specific student
    const student = USERS.find(u => u.id === homework.studentId);
    if (student) {
        NOTIFICATIONS.unshift({
            id: Date.now().toString(),
            message: `New homework assigned: ${homework.title}`,
            time: 'Just now',
            type: 'info',
            targetRole: UserRole.STUDENT,
            targetUserId: student.id
        });
    }
    return true;
  },

  markAttendance: (records: AttendanceRecord[]) => {
    console.log('Submitting attendance for:', records);
    return true;
  },

  getAnnouncements: () => ANNOUNCEMENTS,

  getStats: () => {
    // Calculate average attendance from all students
    const students = USERS.filter(u => u.role === UserRole.STUDENT);
    const totalAttendance = students.reduce((acc, curr) => acc + (curr.stats?.attendance || 0), 0);
    const avgAttendance = students.length > 0 ? Math.round(totalAttendance / students.length) : 0;

    return {
      studentCount: students.length,
      teacherCount: USERS.filter(u => u.role === UserRole.TEACHER).length,
      avgAttendance
    };
  },

  addUser: (user: User) => {
    USERS.push(user);
    
    // Create notification if a student is added
    if (user.role === UserRole.STUDENT) {
      NOTIFICATIONS.unshift({
        id: Date.now().toString(),
        message: `New student registered: ${user.name} (${user.username}) - ${user.instrument || 'Music'}`,
        time: 'Just now',
        type: 'success',
        targetRole: UserRole.TEACHER
      });
    }
    
    return true;
  },

  updateUser: (user: User) => {
    const index = USERS.findIndex(u => u.id === user.id);
    if (index !== -1) {
      // Merge existing user with new data to preserve fields like 'password' if not provided in update
      USERS[index] = { ...USERS[index], ...user };
      return true;
    }
    return false;
  },

  getUsersByRole: (role: UserRole) => USERS.filter(u => u.role === role),
  
  deleteUser: (id: string) => {
    USERS = USERS.filter(u => u.id !== id);
  },

  getNotifications: (role: UserRole, userId?: string) => {
    return NOTIFICATIONS.filter(n => {
        const roleMatch = n.targetRole === 'ALL' || n.targetRole === role;
        if (!roleMatch) return false;
        
        // If notification is targeted to a specific user, check ID
        if (n.targetUserId && userId && n.targetUserId !== userId) {
            return false;
        }
        
        return true;
    });
  },

  sendNotification: (notification: SystemNotification) => {
    NOTIFICATIONS.unshift(notification);
    return true;
  },

  // New methods for Study Materials
  getMaterialsForStudent: (studentId: string) => {
    return MATERIALS.filter(m => m.studentId === studentId);
  },

  addStudyMaterial: (material: StudyMaterial) => {
    MATERIALS.unshift(material);
    // Also add a notification for the student
    const student = USERS.find(u => u.id === material.studentId);
    if (student) {
        NOTIFICATIONS.unshift({
            id: Date.now().toString(),
            message: `New study material uploaded: ${material.title}`,
            time: 'Just now',
            type: 'info',
            targetRole: UserRole.STUDENT,
            targetUserId: student.id
        });
    }
    return true;
  },
  
  markMaterialsSeen: (studentId: string) => {
    MATERIALS = MATERIALS.map(m => 
      m.studentId === studentId ? { ...m, isNew: false } : m
    );
  }
};
