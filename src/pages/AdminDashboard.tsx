import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  BookOpen,
  Send,
  Award,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  FileText,
  UserCheck,
  Settings,
  Database,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    students,
    faculty,
    subjects,
    examinations,
    marks,
    departments,
    navigateTo,
    resetToSampleData,
  } = useApp();

  const publishedExams = examinations.filter(e => e.isPublished);
  const draftMarksCount = marks.filter(m => m.status === 'draft' || m.status === 'submitted').length;
  const approvedMarksCount = marks.filter(m => m.status === 'approved').length;

  // Compute overall pass percentage for published marks
  const approvedMarks = marks.filter(m => m.status === 'approved');
  const passedMarksCount = approvedMarks.filter(m => m.isPassed).length;
  const overallPassPercentage =
    approvedMarks.length > 0
      ? Math.round((passedMarksCount / approvedMarks.length) * 100 * 10) / 10
      : 88.5;

  return (
    <div className="space-y-8 pb-12">
      {/* Dashboard Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Institutional Administration Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Overview of academic departments, faculty mark submissions, examination publications, and institutional metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => resetToSampleData()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            title="Reset to fresh demo sample data"
          >
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo Data</span>
          </button>
          <button
            onClick={() => navigateTo('results-publish')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Examination Results</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (60-30-10 color discipline, tabular figures) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Enrolled</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {students.length}
          </p>
          <div className="mt-1 text-[11px] text-slate-500">
            Across {departments.length} departments
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Faculty Members</span>
            <UserCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {faculty.length}
          </p>
          <div className="mt-1 text-[11px] text-slate-500">
            Assigned to course catalog
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Curriculum Subjects</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {subjects.length}
          </p>
          <div className="mt-1 text-[11px] text-slate-500">
            Active credit offerings
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Live Published Exams</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {publishedExams.length}
          </p>
          <div className="mt-1 text-[11px] text-slate-500">
            Of {examinations.length} sessions
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pass Percentage</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-800 font-mono tabular-nums">
            {overallPassPercentage}%
          </p>
          <div className="mt-1 text-[11px] text-slate-500">
            Current session aggregate
          </div>
        </div>
      </div>

      {/* Main Grid: Management Shortcuts & Examinations Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Navigation & Examination Status (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Examination Sessions Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Examination Sessions & Publication State
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Manage examination cycles and student result visibility
                </p>
              </div>
              <button
                onClick={() => navigateTo('results-publish')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
              >
                <span>View Full Control</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50/40">
                    <th className="py-2.5 px-4">Examination Title</th>
                    <th className="py-2.5 px-3">Session</th>
                    <th className="py-2.5 px-3">Academic Year</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {examinations.map(exam => (
                    <tr key={exam.examinationId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {exam.title}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{exam.examDate}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                        {exam.academicYear}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {exam.isPublished ? (
                          <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            Confidential / Draft
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigateTo('results-publish')}
                          className="text-xs font-semibold text-blue-700 hover:underline"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Performance Overview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Academic Department Enrollment & Courses
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {departments.map(dept => {
                const deptStudents = students.filter(s => s.departmentId === dept.departmentId);
                const deptSubjects = subjects.filter(s => s.departmentId === dept.departmentId);
                return (
                  <div
                    key={dept.departmentId}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          {dept.code}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                          {deptStudents.length} Students
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 line-clamp-1">{dept.name}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{deptSubjects.length} Curriculum Courses</span>
                      <button
                        onClick={() => navigateTo('subjects')}
                        className="text-blue-700 font-semibold hover:underline"
                      >
                        View Subjects →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Administrative Tools & Alert Cards (1 col) */}
        <div className="space-y-6">
          {/* Quick Management Shortcuts */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Administrative Tools</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigateTo('students')}
                className="w-full p-2.5 text-left rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Student Management
                    </span>
                    <span className="text-[10px] text-slate-500">Add, edit, or delete enrolled records</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </button>

              <button
                onClick={() => navigateTo('subjects')}
                className="w-full p-2.5 text-left rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Course Curriculum
                    </span>
                    <span className="text-[10px] text-slate-500">Configure credits and pass thresholds</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600" />
              </button>

              <button
                onClick={() => navigateTo('semester-report')}
                className="w-full p-2.5 text-left rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Semester Analytics
                    </span>
                    <span className="text-[10px] text-slate-500">Department pass rates & rank list</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
              </button>

              <button
                onClick={() => navigateTo('settings')}
                className="w-full p-2.5 text-left rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-slate-600" />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Grading Rules & Policies
                    </span>
                    <span className="text-[10px] text-slate-500">Configure 10-point scale thresholds</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800" />
              </button>
            </div>
          </div>

          {/* Marks Verification Status Card */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Faculty Marks Pipeline</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Approved Marks</span>
                  <span className="font-mono font-bold text-slate-900">{approvedMarksCount}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{
                      width: `${(approvedMarksCount / Math.max(marks.length, 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Pending Faculty Review / Draft</span>
                  <span className="font-mono font-bold text-amber-700">{draftMarksCount}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{
                      width: `${(draftMarksCount / Math.max(marks.length, 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                Faculty marks can be audited in real-time before finalizing publication to students.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
