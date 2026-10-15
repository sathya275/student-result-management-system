import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  Calendar,
  Download,
  FileText,
  Printer,
  CheckCircle,
  AlertCircle,
  Clock,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { generateMarksheetPDF } from '../utils/pdfGenerator';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    students,
    examinations,
    subjects,
    settings,
    getStudentResultSummary,
    openMarksheetModal,
  } = useApp();

  // Find active student
  const activeStudent =
    students.find(s => s.studentId === currentUser?.studentId) ||
    students.find(s => s.registerNumber === '710023104001') ||
    students[0];

  const [selectedExamId, setSelectedExamId] = useState<string>(
    examinations.find(e => e.isPublished)?.examinationId || examinations[0]?.examinationId || ''
  );

  const selectedExam = examinations.find(e => e.examinationId === selectedExamId);
  const isExamPublished = selectedExam?.isPublished ?? false;

  const resultSummary = activeStudent && selectedExamId
    ? getStudentResultSummary(activeStudent.studentId, selectedExamId)
    : null;

  const handleDownloadPDF = () => {
    if (resultSummary) {
      generateMarksheetPDF(resultSummary, settings);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Student Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xl border border-blue-100">
              {activeStudent?.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 uppercase">
                  {activeStudent?.name}
                </h1>
                <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {activeStudent?.registerNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {activeStudent?.course}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span>Semester {activeStudent?.currentSemester}</span>
                <span>·</span>
                <span>Academic Batch: {activeStudent?.academicYear}</span>
                <span>·</span>
                <span className="text-emerald-700 font-semibold">Active Enrollment</span>
              </div>
            </div>
          </div>

          {resultSummary && isExamPublished && (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => openMarksheetModal(resultSummary)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Full Transcript</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          )}
        </div>

        {/* Semester Selector Bar */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Examination Session & Term
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedExamId}
                onChange={e => setSelectedExamId(e.target.value)}
                className="px-3.5 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {examinations.map(exam => (
                  <option key={exam.examinationId} value={exam.examinationId}>
                    {exam.title} {exam.isPublished ? '(Published)' : '(Pending Publication)'}
                  </option>
                ))}
              </select>

              <span
                className={`text-xs px-2.5 py-1 rounded font-semibold ${
                  isExamPublished
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {isExamPublished ? 'Official Results Live' : 'Under Confidential Review'}
              </span>
            </div>
          </div>

          {resultSummary && isExamPublished && (
            <div className="flex items-center gap-6 text-right">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                  Semester SGPA
                </span>
                <span className="text-2xl font-black text-blue-800 font-mono tabular-nums">
                  {resultSummary.sgpa.toFixed(2)}
                </span>
              </div>
              <div className="border-l border-slate-200 pl-6">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                  Overall Outcome
                </span>
                <span
                  className={`text-base font-bold ${
                    resultSummary.overallStatus === 'PASS'
                      ? 'text-emerald-700'
                      : resultSummary.overallStatus === 'WITHHELD'
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}
                >
                  {resultSummary.overallStatus}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {!isExamPublished ? (
        /* Unpublished Institutional Message */
        <div className="bg-white rounded-xl border border-amber-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Results Not Yet Published
          </h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            The examination cell has concluded assessments for <span className="font-semibold text-slate-800">{selectedExam?.title}</span>.
            Marks verification and statistical moderation are currently in progress.
            Official results will be published once administrative approval is granted.
          </p>
          <div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 font-medium inline-block">
            Expected Announcement: Within 5 working days · Contact Examination Cell for queries
          </div>
        </div>
      ) : resultSummary && resultSummary.marks.length > 0 ? (
        /* Published Marks View */
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-400 uppercase font-medium">Credits Earned</span>
              <p className="mt-1 text-xl font-bold text-slate-900 font-mono tabular-nums">
                {resultSummary.earnedCredits} / {resultSummary.totalCredits}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-400 uppercase font-medium">Aggregate Percentage</span>
              <p className="mt-1 text-xl font-bold text-slate-900 font-mono tabular-nums">
                {resultSummary.percentage.toFixed(2)}%
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-400 uppercase font-medium">Marks Scored</span>
              <p className="mt-1 text-xl font-bold text-slate-900 font-mono tabular-nums">
                {resultSummary.totalMarksScored} / {resultSummary.maximumMarksTotal}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-400 uppercase font-medium">Grade Points</span>
              <p className="mt-1 text-xl font-bold text-blue-700 font-mono tabular-nums">
                {resultSummary.sgpa.toFixed(2)} SGPA
              </p>
            </div>
          </div>

          {/* Subject Marks Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Course Marks & Performance Evaluation
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {resultSummary.marks.length} Courses Registered
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50/40">
                    <th className="py-3 px-4">Course Code</th>
                    <th className="py-3 px-4">Subject Title</th>
                    <th className="py-3 px-3 text-center">Credits</th>
                    <th className="py-3 px-3 text-right">Internal (40)</th>
                    <th className="py-3 px-3 text-right">External (60)</th>
                    <th className="py-3 px-3 text-right">Total Marks</th>
                    <th className="py-3 px-3 text-center">Letter Grade</th>
                    <th className="py-3 px-3 text-center">Grade Point</th>
                    <th className="py-3 px-4 text-center">Result Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                  {resultSummary.marks.map((m, idx) => (
                    <tr key={m.markId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{m.subjectCode}</td>
                      <td className="py-3.5 px-4 font-sans font-medium text-slate-800">{m.subjectName}</td>
                      <td className="py-3.5 px-3 text-center text-slate-600">3</td>
                      <td className="py-3.5 px-3 text-right text-slate-700">
                        {m.isAbsent ? 'AB' : m.internalMarks}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-700">
                        {m.isAbsent ? 'AB' : m.externalMarks}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                        {m.isAbsent ? 0 : m.totalMarks}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-900 font-sans">
                        {m.grade}
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-700">{m.gradePoint}</td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        {m.isPassed ? (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            PASS
                          </span>
                        ) : m.isWithheld ? (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            WITHHELD
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                            FAIL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-xs text-slate-500">
            No subject mark records located for this student registration in the selected session.
          </p>
        </div>
      )}
    </div>
  );
};
