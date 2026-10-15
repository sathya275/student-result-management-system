import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  Student,
  Faculty,
  Department,
  Subject,
  Semester,
  Examination,
  Mark,
  GradingRule,
  CollegeSettings,
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
import { DEFAULT_GRADING_RULES } from '../utils/gradeCalculator';

const STORAGE_KEY_PREFIX = 'srms_college_data_';

function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

export class CollegeDatabaseService {
  private isFirebaseConnected = false;

  async initDatabase(): Promise<{
    settings: CollegeSettings;
    departments: Department[];
    subjects: Subject[];
    faculty: Faculty[];
    students: Student[];
    semesters: Semester[];
    examinations: Examination[];
    marks: Mark[];
    gradingRules: GradingRule[];
  }> {
    try {
      // Check Firestore collections
      const deptsSnapshot = await getDocs(collection(db, 'departments'));
      if (deptsSnapshot.empty) {
        // Automatically seed with default sample data into Firestore if empty
        await this.seedDatabase();
      }
      this.isFirebaseConnected = true;
    } catch {
      console.warn('Using local cached store for student result records.');
      this.isFirebaseConnected = false;
    }

    return this.getAllData();
  }

  async getAllData() {
    let settings = getLocal<CollegeSettings>('settings', SAMPLE_COLLEGE_SETTINGS);
    let departments = getLocal<Department[]>('departments', SAMPLE_DEPARTMENTS);
    let subjects = getLocal<Subject[]>('subjects', SAMPLE_SUBJECTS);
    let faculty = getLocal<Faculty[]>('faculty', SAMPLE_FACULTY);
    let students = getLocal<Student[]>('students', SAMPLE_STUDENTS);
    let semesters = getLocal<Semester[]>('semesters', SAMPLE_SEMESTERS);
    let examinations = getLocal<Examination[]>('examinations', SAMPLE_EXAMINATIONS);
    let marks = getLocal<Mark[]>('marks', SAMPLE_MARKS);
    let gradingRules = getLocal<GradingRule[]>('gradingRules', DEFAULT_GRADING_RULES);

    try {
      const [
        deptsSnap,
        subsSnap,
        facSnap,
        studsSnap,
        semsSnap,
        examsSnap,
        marksSnap,
        rulesSnap,
        settingsSnap,
      ] = await Promise.all([
        getDocs(collection(db, 'departments')),
        getDocs(collection(db, 'subjects')),
        getDocs(collection(db, 'faculty')),
        getDocs(collection(db, 'students')),
        getDocs(collection(db, 'semesters')),
        getDocs(collection(db, 'examinations')),
        getDocs(collection(db, 'marks')),
        getDocs(collection(db, 'gradingRules')),
        getDocs(collection(db, 'settings')),
      ]);

      if (!deptsSnap.empty) {
        departments = deptsSnap.docs.map(d => d.data() as Department);
        setLocal('departments', departments);
      }
      if (!subsSnap.empty) {
        subjects = subsSnap.docs.map(d => d.data() as Subject);
        setLocal('subjects', subjects);
      }
      if (!facSnap.empty) {
        faculty = facSnap.docs.map(d => d.data() as Faculty);
        setLocal('faculty', faculty);
      }
      if (!studsSnap.empty) {
        students = studsSnap.docs.map(d => d.data() as Student);
        setLocal('students', students);
      }
      if (!semsSnap.empty) {
        semesters = semsSnap.docs.map(d => d.data() as Semester);
        setLocal('semesters', semesters);
      }
      if (!examsSnap.empty) {
        examinations = examsSnap.docs.map(d => d.data() as Examination);
        setLocal('examinations', examinations);
      }
      if (!marksSnap.empty) {
        marks = marksSnap.docs.map(d => d.data() as Mark);
        setLocal('marks', marks);
      }
      if (!rulesSnap.empty) {
        gradingRules = rulesSnap.docs.map(d => d.data() as GradingRule);
        setLocal('gradingRules', gradingRules);
      }
      if (!settingsSnap.empty) {
        settings = settingsSnap.docs[0].data() as CollegeSettings;
        setLocal('settings', settings);
      }
    } catch {
      // Fallback already assigned from local storage
    }

    return {
      settings,
      departments,
      subjects,
      faculty,
      students,
      semesters,
      examinations,
      marks,
      gradingRules,
    };
  }

  async seedDatabase(): Promise<boolean> {
    try {
      // Seed departments
      for (const d of SAMPLE_DEPARTMENTS) {
        await setDoc(doc(db, 'departments', d.departmentId), d);
      }
      // Seed subjects
      for (const s of SAMPLE_SUBJECTS) {
        await setDoc(doc(db, 'subjects', s.subjectId), s);
      }
      // Seed faculty
      for (const f of SAMPLE_FACULTY) {
        await setDoc(doc(db, 'faculty', f.facultyId), f);
      }
      // Seed students
      for (const st of SAMPLE_STUDENTS) {
        await setDoc(doc(db, 'students', st.studentId), st);
      }
      // Seed semesters
      for (const sem of SAMPLE_SEMESTERS) {
        await setDoc(doc(db, 'semesters', sem.semesterId), sem);
      }
      // Seed exams
      for (const ex of SAMPLE_EXAMINATIONS) {
        await setDoc(doc(db, 'examinations', ex.examinationId), ex);
      }
      // Seed marks
      for (const m of SAMPLE_MARKS) {
        await setDoc(doc(db, 'marks', m.markId), m);
      }
      // Seed rules
      for (const r of DEFAULT_GRADING_RULES) {
        await setDoc(doc(db, 'gradingRules', r.ruleId), r);
      }
      // Seed settings
      await setDoc(doc(db, 'settings', SAMPLE_COLLEGE_SETTINGS.settingId), SAMPLE_COLLEGE_SETTINGS);

      // Also sync to local
      setLocal('departments', SAMPLE_DEPARTMENTS);
      setLocal('subjects', SAMPLE_SUBJECTS);
      setLocal('faculty', SAMPLE_FACULTY);
      setLocal('students', SAMPLE_STUDENTS);
      setLocal('semesters', SAMPLE_SEMESTERS);
      setLocal('examinations', SAMPLE_EXAMINATIONS);
      setLocal('marks', SAMPLE_MARKS);
      setLocal('gradingRules', DEFAULT_GRADING_RULES);
      setLocal('settings', SAMPLE_COLLEGE_SETTINGS);

      return true;
    } catch (err) {
      console.warn('Seeded locally due to permissions or network:', err);
      // Ensure local state is populated
      setLocal('departments', SAMPLE_DEPARTMENTS);
      setLocal('subjects', SAMPLE_SUBJECTS);
      setLocal('faculty', SAMPLE_FACULTY);
      setLocal('students', SAMPLE_STUDENTS);
      setLocal('semesters', SAMPLE_SEMESTERS);
      setLocal('examinations', SAMPLE_EXAMINATIONS);
      setLocal('marks', SAMPLE_MARKS);
      setLocal('gradingRules', DEFAULT_GRADING_RULES);
      setLocal('settings', SAMPLE_COLLEGE_SETTINGS);
      return false;
    }
  }

  // --- Student operations ---
  async saveStudent(student: Student): Promise<void> {
    try {
      await setDoc(doc(db, 'students', student.studentId), student);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `students/${student.studentId}`);
    } finally {
      const students = getLocal<Student[]>('students', SAMPLE_STUDENTS);
      const idx = students.findIndex(s => s.studentId === student.studentId);
      if (idx >= 0) students[idx] = student;
      else students.push(student);
      setLocal('students', students);
    }
  }

  async deleteStudent(studentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'students', studentId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `students/${studentId}`);
    } finally {
      const students = getLocal<Student[]>('students', SAMPLE_STUDENTS).filter(s => s.studentId !== studentId);
      setLocal('students', students);
    }
  }

  // --- Subject operations ---
  async saveSubject(subject: Subject): Promise<void> {
    try {
      await setDoc(doc(db, 'subjects', subject.subjectId), subject);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `subjects/${subject.subjectId}`);
    } finally {
      const subjects = getLocal<Subject[]>('subjects', SAMPLE_SUBJECTS);
      const idx = subjects.findIndex(s => s.subjectId === subject.subjectId);
      if (idx >= 0) subjects[idx] = subject;
      else subjects.push(subject);
      setLocal('subjects', subjects);
    }
  }

  async deleteSubject(subjectId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'subjects', subjectId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `subjects/${subjectId}`);
    } finally {
      const subjects = getLocal<Subject[]>('subjects', SAMPLE_SUBJECTS).filter(s => s.subjectId !== subjectId);
      setLocal('subjects', subjects);
    }
  }

  // --- Faculty operations ---
  async saveFaculty(facultyMember: Faculty): Promise<void> {
    try {
      await setDoc(doc(db, 'faculty', facultyMember.facultyId), facultyMember);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `faculty/${facultyMember.facultyId}`);
    } finally {
      const list = getLocal<Faculty[]>('faculty', SAMPLE_FACULTY);
      const idx = list.findIndex(f => f.facultyId === facultyMember.facultyId);
      if (idx >= 0) list[idx] = facultyMember;
      else list.push(facultyMember);
      setLocal('faculty', list);
    }
  }

  async deleteFaculty(facultyId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'faculty', facultyId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `faculty/${facultyId}`);
    } finally {
      const list = getLocal<Faculty[]>('faculty', SAMPLE_FACULTY).filter(f => f.facultyId !== facultyId);
      setLocal('faculty', list);
    }
  }

  // --- Examination operations & Result Publishing ---
  async saveExamination(exam: Examination): Promise<void> {
    try {
      await setDoc(doc(db, 'examinations', exam.examinationId), exam);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `examinations/${exam.examinationId}`);
    } finally {
      const list = getLocal<Examination[]>('examinations', SAMPLE_EXAMINATIONS);
      const idx = list.findIndex(e => e.examinationId === exam.examinationId);
      if (idx >= 0) list[idx] = exam;
      else list.push(exam);
      setLocal('examinations', list);
    }
  }

  async togglePublishExamination(examinationId: string, isPublished: boolean): Promise<void> {
    const publishedAt = isPublished ? new Date().toISOString() : undefined;
    try {
      await updateDoc(doc(db, 'examinations', examinationId), {
        isPublished,
        publishedAt: publishedAt || null,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `examinations/${examinationId}`);
    } finally {
      const list = getLocal<Examination[]>('examinations', SAMPLE_EXAMINATIONS);
      const idx = list.findIndex(e => e.examinationId === examinationId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], isPublished, publishedAt };
        setLocal('examinations', list);
      }
    }
  }

  // --- Marks management & Batch Saving ---
  async saveMarksBatch(marksList: Mark[]): Promise<void> {
    for (const m of marksList) {
      try {
        await setDoc(doc(db, 'marks', m.markId), m);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `marks/${m.markId}`);
      }
    }
    const current = getLocal<Mark[]>('marks', SAMPLE_MARKS);
    const markMap = new Map<string, Mark>();
    current.forEach(m => markMap.set(m.markId, m));
    marksList.forEach(m => markMap.set(m.markId, m));
    setLocal('marks', Array.from(markMap.values()));
  }

  // --- Settings & Grading Rules ---
  async saveSettings(settings: CollegeSettings): Promise<void> {
    try {
      await setDoc(doc(db, 'settings', settings.settingId), settings);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `settings/${settings.settingId}`);
    } finally {
      setLocal('settings', settings);
    }
  }

  async saveGradingRules(rules: GradingRule[]): Promise<void> {
    for (const r of rules) {
      try {
        await setDoc(doc(db, 'gradingRules', r.ruleId), r);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `gradingRules/${r.ruleId}`);
      }
    }
    setLocal('gradingRules', rules);
  }
}

export const dbService = new CollegeDatabaseService();
