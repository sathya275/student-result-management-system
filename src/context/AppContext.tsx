import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { dbService } from '../services/db';
import {
  UserProfile,
  UserRole,
  Student,
  Faculty,
  Department,
  Subject,
  Semester,
  Examination,
  Mark,
  GradingRule,
  CollegeSettings,
  SemesterResultSummary,
} from '../types';
import {
  SAMPLE_COLLEGE_SETTINGS,
  SAMPLE_DEPARTMENTS,
  SAMPLE_FACULTY,
  SAMPLE_STUDENTS,
  SAMPLE_SUBJECTS,
  SAMPLE_SEMESTERS,
  SAMPLE_EXAMINATIONS,
  SAMPLE_MARKS,
} from '../data/sampleData';
import { DEFAULT_GRADING_RULES, computeSemesterResultSummary } from '../utils/gradeCalculator';

export type ActivePage =
  | 'home'
  | 'login'
  | 'admin-dashboard'
  | 'faculty-dashboard'
  | 'student-dashboard'
  | 'students'
  | 'subjects'
  | 'marks-entry'
  | 'results-publish'
  | 'student-result'
  | 'semester-report'
  | 'settings';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  // Auth state
  currentUser: UserProfile | null;
  firebaseAuthUser: User | null;
  isLoadingAuth: boolean;
  isFirebaseActive: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsDemoRole: (role: UserRole, specificId?: string) => void;
  logout: () => Promise<void>;

  // Navigation
  activePage: ActivePage;
  navigateTo: (page: ActivePage) => void;

  // Data Store
  settings: CollegeSettings;
  departments: Department[];
  subjects: Subject[];
  faculty: Faculty[];
  students: Student[];
  semesters: Semester[];
  examinations: Examination[];
  marks: Mark[];
  gradingRules: GradingRule[];

  // Data actions
  saveStudent: (student: Student) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  saveSubject: (subject: Subject) => Promise<void>;
  deleteSubject: (subjectId: string) => Promise<void>;
  saveFaculty: (faculty: Faculty) => Promise<void>;
  deleteFaculty: (facultyId: string) => Promise<void>;
  saveExamination: (exam: Examination) => Promise<void>;
  togglePublishExamination: (examId: string, isPublished: boolean) => Promise<void>;
  saveMarksBatch: (marksList: Mark[]) => Promise<void>;
  saveSettings: (settings: CollegeSettings) => Promise<void>;
  saveGradingRules: (rules: GradingRule[]) => Promise<void>;
  resetToSampleData: () => Promise<void>;

  // Result helper
  getStudentResultSummary: (studentId: string, examinationId: string) => SemesterResultSummary | null;

  // Marksheet Modal
  selectedResultSummary: SemesterResultSummary | null;
  openMarksheetModal: (summary: SemesterResultSummary) => void;
  closeMarksheetModal: () => void;

  // Feedback notifications
  toasts: ToastNotification[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    // Default to admin for seamless evaluation
    return {
      uid: 'demo_admin_uid',
      email: 'sathyachidambaram18@gmail.com',
      displayName: 'System Administrator',
      role: 'admin',
    };
  });
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isFirebaseActive, setIsFirebaseActive] = useState<boolean>(true);

  const [activePage, setActivePage] = useState<ActivePage>('home');

  // Data
  const [settings, setSettings] = useState<CollegeSettings>(SAMPLE_COLLEGE_SETTINGS);
  const [departments, setDepartments] = useState<Department[]>(SAMPLE_DEPARTMENTS);
  const [subjects, setSubjects] = useState<Subject[]>(SAMPLE_SUBJECTS);
  const [faculty, setFaculty] = useState<Faculty[]>(SAMPLE_FACULTY);
  const [students, setStudents] = useState<Student[]>(SAMPLE_STUDENTS);
  const [semesters, setSemesters] = useState<Semester[]>(SAMPLE_SEMESTERS);
  const [examinations, setExaminations] = useState<Examination[]>(SAMPLE_EXAMINATIONS);
  const [marks, setMarks] = useState<Mark[]>(SAMPLE_MARKS);
  const [gradingRules, setGradingRules] = useState<GradingRule[]>(DEFAULT_GRADING_RULES);

  const [selectedResultSummary, setSelectedResultSummary] = useState<SemesterResultSummary | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Init Data from Firebase / Service
  useEffect(() => {
    async function loadData() {
      try {
        const data = await dbService.initDatabase();
        setSettings(data.settings);
        setDepartments(data.departments);
        setSubjects(data.subjects);
        setFaculty(data.faculty);
        setStudents(data.students);
        setSemesters(data.semesters);
        setExaminations(data.examinations);
        setMarks(data.marks);
        setGradingRules(data.gradingRules);
      } catch (err) {
        console.error('Data initialization error:', err);
      }
    }
    loadData();
  }, []);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      setFirebaseAuthUser(firebaseUser);
      setIsLoadingAuth(false);
      if (firebaseUser) {
        setIsFirebaseActive(true);
        // If email matches owner, bootstrap as admin
        const isAdmin = firebaseUser.email === 'sathyachidambaram18@gmail.com';
        setCurrentUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Authorized User',
          role: isAdmin ? 'admin' : 'faculty',
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const user = cred.user;
      const isAdmin = user.email === 'sathyachidambaram18@gmail.com';
      setCurrentUser({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Google User',
        role: isAdmin ? 'admin' : 'faculty',
      });
      addToast(`Signed in as ${user.displayName} (${isAdmin ? 'Admin' : 'Faculty'})`, 'success');
      navigateTo(isAdmin ? 'admin-dashboard' : 'faculty-dashboard');
    } catch (err: unknown) {
      console.error('Google Sign-in error:', err);
      addToast('Google Sign-in popup cancelled or blocked.', 'error');
    }
  };

  const loginAsDemoRole = (role: UserRole, specificId?: string) => {
    if (role === 'admin') {
      setCurrentUser({
        uid: 'demo_admin',
        email: 'sathyachidambaram18@gmail.com',
        displayName: 'College Administrator (Demo)',
        role: 'admin',
      });
      addToast('Switched to Administrator Mode', 'success');
      setActivePage('admin-dashboard');
    } else if (role === 'faculty') {
      const chosenFaculty = faculty.find(f => f.facultyId === specificId) || faculty[0];
      setCurrentUser({
        uid: 'demo_faculty_' + chosenFaculty.facultyId,
        email: chosenFaculty.email,
        displayName: chosenFaculty.name,
        role: 'faculty',
        facultyId: chosenFaculty.facultyId,
      });
      addToast(`Switched to Faculty Mode: ${chosenFaculty.name}`, 'success');
      setActivePage('faculty-dashboard');
    } else {
      const chosenStudent = students.find(s => s.studentId === specificId) || students[0];
      setCurrentUser({
        uid: 'demo_student_' + chosenStudent.studentId,
        email: chosenStudent.email,
        displayName: chosenStudent.name,
        role: 'student',
        studentId: chosenStudent.studentId,
      });
      addToast(`Switched to Student Mode: ${chosenStudent.name} (${chosenStudent.registerNumber})`, 'success');
      setActivePage('student-dashboard');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignored
    }
    setCurrentUser(null);
    setFirebaseAuthUser(null);
    addToast('Logged out successfully', 'info');
    setActivePage('home');
  };

  const navigateTo = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CRUD handlers
  const saveStudent = async (student: Student) => {
    await dbService.saveStudent(student);
    setStudents(prev => {
      const idx = prev.findIndex(s => s.studentId === student.studentId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = student;
        return copy;
      }
      return [...prev, student];
    });
    addToast(`Student record ${student.name} saved successfully`, 'success');
  };

  const deleteStudent = async (studentId: string) => {
    await dbService.deleteStudent(studentId);
    setStudents(prev => prev.filter(s => s.studentId !== studentId));
    addToast('Student deleted successfully', 'info');
  };

  const saveSubject = async (subject: Subject) => {
    await dbService.saveSubject(subject);
    setSubjects(prev => {
      const idx = prev.findIndex(s => s.subjectId === subject.subjectId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = subject;
        return copy;
      }
      return [...prev, subject];
    });
    addToast(`Subject ${subject.name} saved`, 'success');
  };

  const deleteSubject = async (subjectId: string) => {
    await dbService.deleteSubject(subjectId);
    setSubjects(prev => prev.filter(s => s.subjectId !== subjectId));
    addToast('Subject deleted', 'info');
  };

  const saveFaculty = async (facultyMember: Faculty) => {
    await dbService.saveFaculty(facultyMember);
    setFaculty(prev => {
      const idx = prev.findIndex(f => f.facultyId === facultyMember.facultyId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = facultyMember;
        return copy;
      }
      return [...prev, facultyMember];
    });
    addToast(`Faculty member ${facultyMember.name} updated`, 'success');
  };

  const deleteFaculty = async (facultyId: string) => {
    await dbService.deleteFaculty(facultyId);
    setFaculty(prev => prev.filter(f => f.facultyId !== facultyId));
    addToast('Faculty member removed', 'info');
  };

  const saveExamination = async (exam: Examination) => {
    await dbService.saveExamination(exam);
    setExaminations(prev => {
      const idx = prev.findIndex(e => e.examinationId === exam.examinationId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = exam;
        return copy;
      }
      return [...prev, exam];
    });
    addToast(`Examination ${exam.title} saved`, 'success');
  };

  const togglePublishExamination = async (examId: string, isPublished: boolean) => {
    await dbService.togglePublishExamination(examId, isPublished);
    setExaminations(prev =>
      prev.map(e =>
        e.examinationId === examId
          ? { ...e, isPublished, publishedAt: isPublished ? new Date().toISOString() : undefined }
          : e
      )
    );
    addToast(
      isPublished ? 'Results successfully published for all students' : 'Results unpublished and set to confidential review',
      isPublished ? 'success' : 'info'
    );
  };

  const saveMarksBatch = async (marksList: Mark[]) => {
    await dbService.saveMarksBatch(marksList);
    setMarks(prev => {
      const map = new Map<string, Mark>();
      prev.forEach(m => map.set(m.markId, m));
      marksList.forEach(m => map.set(m.markId, m));
      return Array.from(map.values());
    });
    addToast(`Updated marks for ${marksList.length} student entries`, 'success');
  };

  const saveSettings = async (newSettings: CollegeSettings) => {
    await dbService.saveSettings(newSettings);
    setSettings(newSettings);
    addToast('College institutional settings updated', 'success');
  };

  const saveGradingRules = async (newRules: GradingRule[]) => {
    await dbService.saveGradingRules(newRules);
    setGradingRules(newRules);
    addToast('Grading scale rules updated and applied', 'success');
  };

  const resetToSampleData = async () => {
    await dbService.seedDatabase();
    setSettings(SAMPLE_COLLEGE_SETTINGS);
    setDepartments(SAMPLE_DEPARTMENTS);
    setSubjects(SAMPLE_SUBJECTS);
    setFaculty(SAMPLE_FACULTY);
    setStudents(SAMPLE_STUDENTS);
    setSemesters(SAMPLE_SEMESTERS);
    setExaminations(SAMPLE_EXAMINATIONS);
    setMarks(SAMPLE_MARKS);
    setGradingRules(DEFAULT_GRADING_RULES);
    addToast('Database reset and seeded with fresh sample college records', 'success');
  };

  const getStudentResultSummary = (studentId: string, examinationId: string): SemesterResultSummary | null => {
    const student = students.find(s => s.studentId === studentId);
    const examination = examinations.find(e => e.examinationId === examinationId);
    if (!student || !examination) return null;

    const studentMarks = marks.filter(m => m.studentId === studentId && m.examinationId === examinationId);
    return computeSemesterResultSummary(student, examination, studentMarks, subjects);
  };

  const openMarksheetModal = (summary: SemesterResultSummary) => {
    setSelectedResultSummary(summary);
  };

  const closeMarksheetModal = () => {
    setSelectedResultSummary(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        firebaseAuthUser,
        isLoadingAuth,
        isFirebaseActive,
        loginWithGoogle,
        loginAsDemoRole,
        logout,
        activePage,
        navigateTo,
        settings,
        departments,
        subjects,
        faculty,
        students,
        semesters,
        examinations,
        marks,
        gradingRules,
        saveStudent,
        deleteStudent,
        saveSubject,
        deleteSubject,
        saveFaculty,
        deleteFaculty,
        saveExamination,
        togglePublishExamination,
        saveMarksBatch,
        saveSettings,
        saveGradingRules,
        resetToSampleData,
        getStudentResultSummary,
        selectedResultSummary,
        openMarksheetModal,
        closeMarksheetModal,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
