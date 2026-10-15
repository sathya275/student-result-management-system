export type UserRole = 'admin' | 'faculty' | 'student';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  studentId?: string;
  facultyId?: string;
  createdAt?: string;
}

export interface Department {
  departmentId: string;
  name: string;
  code: string;
  description?: string;
}

export interface Student {
  studentId: string;
  registerNumber: string;
  name: string;
  email: string;
  departmentId: string;
  course: string;
  currentSemester: number;
  academicYear: string;
  phone?: string;
  dob?: string;
  createdAt?: string;
}

export interface Faculty {
  facultyId: string;
  name: string;
  email: string;
  departmentId: string;
  designation: string;
  phone?: string;
  assignedSubjectIds: string[];
  createdAt?: string;
}

export interface Subject {
  subjectId: string;
  name: string;
  code: string;
  departmentId: string;
  semester: number;
  credits: number;
  maxInternalMarks: number;
  maxExternalMarks: number;
  minPassMarks: number;
  isActive: boolean;
}

export interface Semester {
  semesterId: string;
  number: number;
  academicYear: string;
  isCurrent: boolean;
}

export interface Examination {
  examinationId: string;
  title: string;
  semesterId: string;
  academicYear: string;
  examDate: string;
  isPublished: boolean;
  publishedAt?: string;
}

export type MarkStatus = 'draft' | 'submitted' | 'approved';

export interface Mark {
  markId: string;
  studentId: string;
  registerNumber: string;
  studentName?: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  semester: number;
  examinationId: string;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  gradePoint: number;
  isPassed: boolean;
  isAbsent: boolean;
  isWithheld: boolean;
  status: MarkStatus;
  submittedByFacultyId?: string;
  updatedAt?: string;
}

export interface GradingRule {
  ruleId: string;
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  gradePoint: number;
  description: string;
}

export interface CollegeSettings {
  settingId: string;
  collegeName: string;
  collegeCode: string;
  address: string;
  affiliation: string;
  accreditation: string;
  defaultPassingPercentage: number;
  controllerOfExams: string;
}

export interface SemesterResultSummary {
  student: Student;
  examination: Examination;
  marks: Mark[];
  totalCredits: number;
  earnedCredits: number;
  totalMarksScored: number;
  maximumMarksTotal: number;
  percentage: number;
  sgpa: number;
  overallStatus: 'PASS' | 'FAIL' | 'WITHHELD';
}
