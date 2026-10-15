import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Mark, Student } from '../types';
import { calculateMarkDetails } from '../utils/gradeCalculator';
import {
  Edit3,
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Calendar,
  RotateCcw,
} from 'lucide-react';

interface LocalMarkRow {
  studentId: string;
  registerNumber: string;
  studentName: string;
  internalMarks: number;
  externalMarks: number;
  isAbsent: boolean;
  isWithheld: boolean;
  totalMarks: number;
  percentage: number;
  grade: string;
  gradePoint: number;
  isPassed: boolean;
  status: 'draft' | 'submitted' | 'approved';
  validationError?: string;
}

export const MarksEntryPage: React.FC = () => {
  const {
    subjects,
    examinations,
    students,
    marks,
    gradingRules,
    saveMarksBatch,
    currentUser,
    faculty,
    addToast,
  } = useApp();

  const [selectedExamId, setSelectedExamId] = useState<string>(
    examinations[0]?.examinationId || ''
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.subjectId || ''
  );

  const selectedSubject = subjects.find(s => s.subjectId === selectedSubjectId);
  const selectedExam = examinations.find(e => e.examinationId === selectedExamId);

  // State of marks being edited
  const [rowList, setRowList] = useState<LocalMarkRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load / initialize roster for selected subject and exam
  useEffect(() => {
    if (!selectedSubject || !selectedExam) return;

    // Filter students belonging to this subject's semester and department
    const eligibleStudents = students.filter(
      s => s.departmentId === selectedSubject.departmentId && s.currentSemester === selectedSubject.semester
    );

    const rows: LocalMarkRow[] = eligibleStudents.map(student => {
      // Check existing mark record
      const existing = marks.find(
        m => m.studentId === student.studentId &&
             m.subjectId === selectedSubject.subjectId &&
             m.examinationId === selectedExam.examinationId
      );

      if (existing) {
        return {
          studentId: student.studentId,
          registerNumber: student.registerNumber,
          studentName: student.name,
          internalMarks: existing.internalMarks,
          externalMarks: existing.externalMarks,
          isAbsent: existing.isAbsent,
          isWithheld: existing.isWithheld,
          totalMarks: existing.totalMarks,
          percentage: existing.percentage,
          grade: existing.grade,
          gradePoint: existing.gradePoint,
          isPassed: existing.isPassed,
          status: existing.status,
        };
      }

      // Default blank row
      const calc = calculateMarkDetails({
        internalMarks: 0,
        externalMarks: 0,
        maxInternalMarks: selectedSubject.maxInternalMarks,
        maxExternalMarks: selectedSubject.maxExternalMarks,
        minPassMarks: selectedSubject.minPassMarks,
        rules: gradingRules,
      });

      return {
        studentId: student.studentId,
        registerNumber: student.registerNumber,
        studentName: student.name,
        internalMarks: 0,
        externalMarks: 0,
        isAbsent: false,
        isWithheld: false,
        totalMarks: 0,
        percentage: 0,
        grade: 'RA',
        gradePoint: 0,
        isPassed: false,
        status: 'draft',
      };
    });

    setRowList(rows);
  }, [selectedSubjectId, selectedExamId, subjects, examinations, students, marks, gradingRules]);

  // Handle Mark Change
  const handleMarkChange = (
    index: number,
    field: 'internalMarks' | 'externalMarks',
    valueStr: string
  ) => {
    if (!selectedSubject) return;

    const val = Number(valueStr);
    const updated = [...rowList];
    const row = { ...updated[index] };

    if (field === 'internalMarks') {
      row.internalMarks = val;
    } else {
      row.externalMarks = val;
    }

    // Recompute
    const calc = calculateMarkDetails({
      internalMarks: row.internalMarks,
      externalMarks: row.externalMarks,
      maxInternalMarks: selectedSubject.maxInternalMarks,
      maxExternalMarks: selectedSubject.maxExternalMarks,
      minPassMarks: selectedSubject.minPassMarks,
      isAbsent: row.isAbsent,
      isWithheld: row.isWithheld,
      rules: gradingRules,
    });

    row.totalMarks = calc.totalMarks;
    row.percentage = calc.percentage;
    row.grade = calc.grade;
    row.gradePoint = calc.gradePoint;
    row.isPassed = calc.isPassed;
    row.validationError = calc.validationError;

    updated[index] = row;
    setRowList(updated);
  };

  const handleToggleAbsent = (index: number) => {
    if (!selectedSubject) return;
    const updated = [...rowList];
    const row = { ...updated[index] };
    row.isAbsent = !row.isAbsent;
    if (row.isAbsent) {
      row.internalMarks = 0;
      row.externalMarks = 0;
      row.totalMarks = 0;
      row.percentage = 0;
      row.grade = 'AB';
      row.gradePoint = 0;
      row.isPassed = false;
      row.validationError = undefined;
    }
    updated[index] = row;
    setRowList(updated);
  };

  const handleToggleWithheld = (index: number) => {
    const updated = [...rowList];
    const row = { ...updated[index] };
    row.isWithheld = !row.isWithheld;
    if (row.isWithheld) {
      row.grade = 'WH';
      row.gradePoint = 0;
      row.isPassed = false;
    }
    updated[index] = row;
    setRowList(updated);
  };

  const handleSaveMarks = async (newStatus: 'draft' | 'submitted') => {
    if (!selectedSubject || !selectedExam) return;

    // Check if any errors
    const hasError = rowList.some(r => r.validationError);
    if (hasError) {
      addToast('Please resolve validation errors before saving marks', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const marksPayload: Mark[] = rowList.map(r => ({
        markId: `mk_${r.studentId}_${selectedSubject.subjectId}_${selectedExam.examinationId}`,
        studentId: r.studentId,
        registerNumber: r.registerNumber,
        studentName: r.studentName,
        subjectId: selectedSubject.subjectId,
        subjectCode: selectedSubject.code,
        subjectName: selectedSubject.name,
        semester: selectedSubject.semester,
        examinationId: selectedExam.examinationId,
        internalMarks: r.internalMarks,
        externalMarks: r.externalMarks,
        totalMarks: r.totalMarks,
        maxMarks: selectedSubject.maxInternalMarks + selectedSubject.maxExternalMarks,
        percentage: r.percentage,
        grade: r.grade,
        gradePoint: r.gradePoint,
        isPassed: r.isPassed,
        isAbsent: r.isAbsent,
        isWithheld: r.isWithheld,
        status: newStatus,
        submittedByFacultyId: currentUser?.facultyId || 'fac_1',
        updatedAt: new Date().toISOString(),
      }));

      await saveMarksBatch(marksPayload);
      addToast(
        newStatus === 'draft'
          ? 'Marks saved as draft locally'
          : 'Marks submitted to Controller of Examinations for final approval',
        'success'
      );
    } catch (err) {
      console.error(err);
      addToast('Failed to save marks', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Student Marks Entry & Evaluation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Input continuous internal assessment & end-semester scores. Grades, SGPA points, and pass status compute automatically.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleSaveMarks('draft')}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => handleSaveMarks('submitted')}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit for Admin Approval</span>
          </button>
        </div>
      </div>

      {/* Course & Exam Session Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Examination Session
          </label>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {examinations.map(exam => (
                <option key={exam.examinationId} value={exam.examinationId}>
                  {exam.title} {exam.isPublished ? '(Published)' : '(In Review)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Subject Course Allotment
          </label>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {subjects.map(s => (
                <option key={s.subjectId} value={s.subjectId}>
                  [{s.code}] {s.name} (Sem {s.semester})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subject Parameters Bar */}
      {selectedSubject && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-900">
              {selectedSubject.code}: {selectedSubject.name}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600">Credits: {selectedSubject.credits}</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-600">
            <span>Max Internal: <strong className="text-slate-900">{selectedSubject.maxInternalMarks}</strong></span>
            <span>·</span>
            <span>Max External: <strong className="text-slate-900">{selectedSubject.maxExternalMarks}</strong></span>
            <span>·</span>
            <span>Min Pass Total: <strong className="text-emerald-700">{selectedSubject.minPassMarks}</strong></span>
          </div>
        </div>
      )}

      {/* Spreadsheet Marks Entry Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50/70">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-32">Register No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-3 text-center w-24">Internal ({selectedSubject?.maxInternalMarks || 40})</th>
                <th className="py-3 px-3 text-center w-24">External ({selectedSubject?.maxExternalMarks || 60})</th>
                <th className="py-3 px-3 text-center w-20">Absent?</th>
                <th className="py-3 px-3 text-center w-20">Withhold?</th>
                <th className="py-3 px-3 text-center w-20">Total</th>
                <th className="py-3 px-3 text-center w-16">Grade</th>
                <th className="py-3 px-3 text-center w-14">GP</th>
                <th className="py-3 px-4 text-center w-20">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {rowList.length > 0 ? (
                rowList.map((row, idx) => (
                  <tr key={row.studentId} className={row.validationError ? 'bg-rose-50/50' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                    <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{row.registerNumber}</td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-800">{row.studentName}</td>

                    {/* Internal Marks Input */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        disabled={row.isAbsent}
                        value={row.internalMarks}
                        onChange={e => handleMarkChange(idx, 'internalMarks', e.target.value)}
                        min={0}
                        max={selectedSubject?.maxInternalMarks || 40}
                        className="w-16 px-2 py-1 text-center font-bold text-slate-900 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100"
                      />
                    </td>

                    {/* External Marks Input */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        disabled={row.isAbsent}
                        value={row.externalMarks}
                        onChange={e => handleMarkChange(idx, 'externalMarks', e.target.value)}
                        min={0}
                        max={selectedSubject?.maxExternalMarks || 60}
                        className="w-16 px-2 py-1 text-center font-bold text-slate-900 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100"
                      />
                    </td>

                    {/* Absent Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={row.isAbsent}
                        onChange={() => handleToggleAbsent(idx)}
                        className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                      />
                    </td>

                    {/* Withheld Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={row.isWithheld}
                        onChange={() => handleToggleWithheld(idx)}
                        className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                      />
                    </td>

                    {/* Total Marks */}
                    <td className="py-3 px-3 text-center font-bold text-slate-900">
                      {row.isAbsent ? 0 : row.totalMarks}
                    </td>

                    {/* Grade */}
                    <td className="py-3 px-3 text-center font-sans font-bold text-slate-900">
                      {row.grade}
                    </td>

                    {/* Grade Point */}
                    <td className="py-3 px-3 text-center text-slate-700">
                      {row.gradePoint}
                    </td>

                    {/* Result Status */}
                    <td className="py-3 px-4 text-center font-sans">
                      {row.isPassed ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          PASS
                        </span>
                      ) : row.isWithheld ? (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          WTH
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                          FAIL
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 text-xs">
                    No enrolled students in this department and semester.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>{rowList.length} Students in examination roster</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Passed: {rowList.filter(r => r.isPassed).length}
            </span>
            <span className="flex items-center gap-1 text-rose-700 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              Failed / Arrear: {rowList.filter(r => !r.isPassed && !r.isWithheld).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
