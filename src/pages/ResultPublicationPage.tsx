import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Calendar,
  Lock,
  Unlock,
  Clock,
  Award,
} from 'lucide-react';

export const ResultPublicationPage: React.FC = () => {
  const {
    examinations,
    togglePublishExamination,
    marks,
    students,
    subjects,
    saveExamination,
    addToast,
  } = useApp();

  const [selectedExamId, setSelectedExamId] = useState<string>(
    examinations[0]?.examinationId || ''
  );

  const selectedExam = examinations.find(e => e.examinationId === selectedExamId);

  // Marks for this exam
  const examMarks = marks.filter(m => m.examinationId === selectedExamId);
  const distinctStudents = Array.from(new Set(examMarks.map(m => m.studentId)));

  const handleToggle = async (examId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    const confirmMsg = nextStatus
      ? 'Are you sure you want to PUBLISH examination results to the live student portal? Students will be able to view and download marksheets.'
      : 'Are you sure you want to UNPUBLISH this result? Students will no longer see marks for this examination.';

    if (confirm(confirmMsg)) {
      await togglePublishExamination(examId, nextStatus);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Examination Result Publication Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorize, publish, or temporarily retract semester results. Once published, students can view certified grade reports.
          </p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <p className="font-semibold text-blue-950">Role-Based Publication Policy</p>
          <p className="mt-0.5 text-blue-800">
            According to college policy and Firestore security rules, students cannot access marks or grades for an examination unless an administrator sets its state to <span className="font-semibold">Published</span>. Faculty marks in draft or pending status remain strictly internal.
          </p>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {examinations.map(exam => {
          const sessionMarks = marks.filter(m => m.examinationId === exam.examinationId);
          const studentCount = new Set(sessionMarks.map(m => m.studentId)).size;
          const passedCount = sessionMarks.filter(m => m.isPassed).length;
          const passPct = sessionMarks.length > 0 ? Math.round((passedCount / sessionMarks.length) * 100) : 0;

          return (
            <div
              key={exam.examinationId}
              className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                exam.isPublished
                  ? 'border-emerald-300 ring-1 ring-emerald-200'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      exam.isPublished
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {exam.isPublished ? (
                      <>
                        <Unlock className="w-3 h-3" />
                        <span>Published Online</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Confidential Review</span>
                      </>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {exam.academicYear}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Exam Session: {exam.examDate}</span>
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Candidates</span>
                    <span className="font-mono font-bold text-slate-900">{studentCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Marks</span>
                    <span className="font-mono font-bold text-slate-900">{sessionMarks.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Pass Rate</span>
                    <span className="font-mono font-bold text-blue-700">{passPct}%</span>
                  </div>
                </div>

                {exam.publishedAt && (
                  <p className="mt-3 text-[10px] text-slate-400 font-mono">
                    Published on: {new Date(exam.publishedAt).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedExamId(exam.examinationId)}
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  Audit Records →
                </button>

                <button
                  onClick={() => handleToggle(exam.examinationId, exam.isPublished)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs ${
                    exam.isPublished
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {exam.isPublished ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Unpublish</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish Results</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Detail Roster */}
      {selectedExam && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden mt-8">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Audit Record Roster: {selectedExam.title}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Detailed listing of marks entered for candidates in this examination cycle.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {examMarks.length} Course Evaluations
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50/40">
                  <th className="py-2.5 px-4">Register Number</th>
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-3">Course Code</th>
                  <th className="py-2.5 px-3">Subject Name</th>
                  <th className="py-2.5 px-3 text-right">Internal</th>
                  <th className="py-2.5 px-3 text-right">External</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                  <th className="py-2.5 px-4 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {examMarks.slice(0, 15).map((m, idx) => (
                  <tr key={m.markId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{m.registerNumber}</td>
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-800">{m.studentName || 'Student'}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{m.subjectCode}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-600">{m.subjectName}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{m.internalMarks}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{m.externalMarks}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{m.totalMarks}</td>
                    <td className="py-2.5 px-3 text-center font-sans font-bold text-slate-900">{m.grade}</td>
                    <td className="py-2.5 px-4 text-center font-sans">
                      {m.isPassed ? (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          PASS
                        </span>
                      ) : m.isWithheld ? (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          WTH
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
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
      )}
    </div>
  );
};
