import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Edit3,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const { currentUser, faculty, subjects, students, marks, examinations, navigateTo } = useApp();

  // Find active faculty profile
  const activeFaculty = faculty.find(f => f.facultyId === currentUser?.facultyId) || faculty[0];

  // Assigned subjects for this faculty
  const assignedSubjects = subjects.filter(s =>
    activeFaculty?.assignedSubjectIds.includes(s.subjectId)
  );

  // Faculty marks entered
  const facultyMarks = marks.filter(m =>
    assignedSubjects.some(s => s.subjectId === m.subjectId)
  );

  const submittedCount = facultyMarks.filter(m => m.status === 'submitted' || m.status === 'approved').length;
  const draftCount = facultyMarks.filter(m => m.status === 'draft').length;
  const passCount = facultyMarks.filter(m => m.isPassed).length;
  const passRate = facultyMarks.length > 0 ? Math.round((passCount / facultyMarks.length) * 100) : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Profile Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Faculty Academic Console
            </h1>
            <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
              {activeFaculty?.designation}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Instructor: <span className="font-semibold text-slate-800">{activeFaculty?.name}</span> · {activeFaculty?.email}
          </p>
        </div>

        <button
          onClick={() => navigateTo('marks-entry')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Enter / Review Student Marks</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Assigned Courses</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {assignedSubjects.length}
          </p>
          <span className="text-[11px] text-slate-400">Current semester syllabus</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Evaluated Entries</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {facultyMarks.length}
          </p>
          <span className="text-[11px] text-slate-400">Student grade records</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Submissions</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700 font-mono tabular-nums">
            {draftCount}
          </p>
          <span className="text-[11px] text-slate-400">In draft mode</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Student Pass Rate</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-800 font-mono tabular-nums">
            {passRate}%
          </p>
          <span className="text-[11px] text-slate-400">Assigned course batches</span>
        </div>
      </div>

      {/* Assigned Subjects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Teaching Allotments & Grade Status
          </h2>
          <span className="text-xs text-slate-500">
            {assignedSubjects.length} Active Courses Allocated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {assignedSubjects.map(sub => {
            const subjectMarks = marks.filter(m => m.subjectId === sub.subjectId);
            const passed = subjectMarks.filter(m => m.isPassed).length;
            const subPassPct = subjectMarks.length > 0 ? Math.round((passed / subjectMarks.length) * 100) : 0;

            return (
              <div
                key={sub.subjectId}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                      {sub.code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {sub.credits} Credits · Sem {sub.semester}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {sub.name}
                  </h3>

                  <div className="mt-4 grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Internal Max</span>
                      <span className="font-mono font-bold text-slate-800">{sub.maxInternalMarks}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">External Max</span>
                      <span className="font-mono font-bold text-slate-800">{sub.maxExternalMarks}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Min Passing</span>
                      <span className="font-mono font-bold text-slate-800">{sub.minPassMarks}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    <span>{subjectMarks.length} Students Graded</span>
                    <span className="mx-1.5">·</span>
                    <span className="font-semibold text-emerald-700">{subPassPct}% Pass</span>
                  </div>
                  <button
                    onClick={() => navigateTo('marks-entry')}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1"
                  >
                    <span>Manage Marks</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grade Entry Guidelines for Faculty */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
          Faculty Grading Regulations & Instructions
        </h3>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
          <li>Internal assessments must not exceed maximum marks (40 marks standard).</li>
          <li>End-semester external examinations must adhere to university criteria (60 marks standard).</li>
          <li>Grades and grade points are automatically calculated based on continuous weighted assessment.</li>
          <li>Draft marks can be revised anytime; once submitted to the controller of examinations, further edits require administrative clearance.</li>
        </ul>
      </div>
    </div>
  );
};
