import { GradingRule, Mark, Subject, Student, Examination, SemesterResultSummary } from '../types';

export const DEFAULT_GRADING_RULES: GradingRule[] = [
  { ruleId: 'gr_1', grade: 'O', minPercentage: 90, maxPercentage: 100, gradePoint: 10, description: 'Outstanding' },
  { ruleId: 'gr_2', grade: 'A+', minPercentage: 80, maxPercentage: 89.99, gradePoint: 9, description: 'Excellent' },
  { ruleId: 'gr_3', grade: 'A', minPercentage: 70, maxPercentage: 79.99, gradePoint: 8, description: 'Very Good' },
  { ruleId: 'gr_4', grade: 'B+', minPercentage: 60, maxPercentage: 69.99, gradePoint: 7, description: 'Good' },
  { ruleId: 'gr_5', grade: 'B', minPercentage: 50, maxPercentage: 59.99, gradePoint: 6, description: 'Above Average' },
  { ruleId: 'gr_6', grade: 'C', minPercentage: 45, maxPercentage: 49.99, gradePoint: 5, description: 'Average / Pass' },
  { ruleId: 'gr_7', grade: 'RA', minPercentage: 0, maxPercentage: 44.99, gradePoint: 0, description: 'Re-Appearance / Fail' },
];

export interface MarkCalculationInput {
  internalMarks: number;
  externalMarks: number;
  maxInternalMarks: number;
  maxExternalMarks: number;
  minPassMarks: number;
  isAbsent?: boolean;
  isWithheld?: boolean;
  rules?: GradingRule[];
}

export interface MarkCalculationResult {
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  gradePoint: number;
  isPassed: boolean;
  isValid: boolean;
  validationError?: string;
}

export function calculateMarkDetails(input: MarkCalculationInput): MarkCalculationResult {
  const {
    internalMarks,
    externalMarks,
    maxInternalMarks,
    maxExternalMarks,
    minPassMarks,
    isAbsent = false,
    isWithheld = false,
    rules = DEFAULT_GRADING_RULES,
  } = input;

  const maxMarks = maxInternalMarks + maxExternalMarks;

  if (isAbsent) {
    return {
      totalMarks: 0,
      maxMarks,
      percentage: 0,
      grade: 'AB',
      gradePoint: 0,
      isPassed: false,
      isValid: true,
    };
  }

  if (isWithheld) {
    return {
      totalMarks: 0,
      maxMarks,
      percentage: 0,
      grade: 'WH',
      gradePoint: 0,
      isPassed: false,
      isValid: true,
    };
  }

  if (internalMarks < 0 || internalMarks > maxInternalMarks) {
    return {
      totalMarks: 0,
      maxMarks,
      percentage: 0,
      grade: 'ERR',
      gradePoint: 0,
      isPassed: false,
      isValid: false,
      validationError: `Internal marks must be between 0 and ${maxInternalMarks}`,
    };
  }

  if (externalMarks < 0 || externalMarks > maxExternalMarks) {
    return {
      totalMarks: 0,
      maxMarks,
      percentage: 0,
      grade: 'ERR',
      gradePoint: 0,
      isPassed: false,
      isValid: false,
      validationError: `External marks must be between 0 and ${maxExternalMarks}`,
    };
  }

  const totalMarks = Math.round((internalMarks + externalMarks) * 10) / 10;
  const percentage = maxMarks > 0 ? Math.round(((totalMarks / maxMarks) * 100) * 10) / 10 : 0;

  // Passing criteria:
  // Must secure overall percentage >= minPassMarks (or total >= minPassMarks)
  // And must score at least 45% in external marks
  const minExternalPassing = maxExternalMarks * 0.45;
  const isPassed = totalMarks >= minPassMarks && externalMarks >= minExternalPassing;

  let assignedGrade = 'RA';
  let assignedGradePoint = 0;

  if (!isPassed) {
    assignedGrade = 'RA';
    assignedGradePoint = 0;
  } else {
    const matchedRule = rules.find(
      r => percentage >= r.minPercentage && percentage <= r.maxPercentage
    );
    if (matchedRule) {
      assignedGrade = matchedRule.grade;
      assignedGradePoint = matchedRule.gradePoint;
    } else if (percentage >= 90) {
      assignedGrade = 'O';
      assignedGradePoint = 10;
    } else {
      assignedGrade = 'C';
      assignedGradePoint = 5;
    }
  }

  return {
    totalMarks,
    maxMarks,
    percentage,
    grade: assignedGrade,
    gradePoint: assignedGradePoint,
    isPassed,
    isValid: true,
  };
}

export function computeSemesterResultSummary(
  student: Student,
  examination: Examination,
  marks: Mark[],
  subjects: Subject[]
): SemesterResultSummary {
  const subjectMap = new Map<string, Subject>();
  subjects.forEach(s => subjectMap.set(s.subjectId, s));

  let totalCredits = 0;
  let earnedCredits = 0;
  let weightedGradePoints = 0;
  let totalMarksScored = 0;
  let maximumMarksTotal = 0;
  let hasFailedSubject = false;
  let isAnyWithheld = false;

  marks.forEach(m => {
    const subject = subjectMap.get(m.subjectId);
    const credits = subject ? subject.credits : 3;

    totalCredits += credits;
    totalMarksScored += m.totalMarks;
    maximumMarksTotal += m.maxMarks;

    if (m.isWithheld) {
      isAnyWithheld = true;
    }

    if (m.isPassed) {
      earnedCredits += credits;
      weightedGradePoints += m.gradePoint * credits;
    } else {
      hasFailedSubject = true;
    }
  });

  const sgpa = totalCredits > 0 ? Math.round((weightedGradePoints / totalCredits) * 100) / 100 : 0;
  const percentage = maximumMarksTotal > 0 ? Math.round(((totalMarksScored / maximumMarksTotal) * 100) * 10) / 10 : 0;

  let overallStatus: 'PASS' | 'FAIL' | 'WITHHELD' = 'PASS';
  if (isAnyWithheld) {
    overallStatus = 'WITHHELD';
  } else if (hasFailedSubject || earnedCredits < totalCredits) {
    overallStatus = 'FAIL';
  }

  return {
    student,
    examination,
    marks,
    totalCredits,
    earnedCredits,
    totalMarksScored,
    maximumMarksTotal,
    percentage,
    sgpa,
    overallStatus,
  };
}
