import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart2,
  Download,
  Award,
  TrendingUp,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  GraduationCap,
} from 'lucide-react';

export const SemesterReportPage: React.FC = () => {
  const {
    examinations,
    departments,
    students,
    subjects,
    marks,
    getStudentResultSummary,
    addToast,
  } = useApp();

  const [selectedExamId, setSelectedExamId] = useState<string>(
    examinations.find(e => e.isPublished)?.examinationId || examinations[0]?.examinationId || ''
  );
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');

  const selectedExam = examinations.find(e => e.examinationId === selectedExamId);

  // Filter students based on department
  const filteredStudents = students.filter(
    s => selectedDeptId === 'all' || s.departmentId === selectedDeptId
  );

  // Compute student summary reports for each student
  const studentReports = filteredStudents
    .map(student => {
      const summary = getStudentResultSummary(student.studentId, selectedExamId);
      return summary;
    })
    .filter(Boolean);

  // Statistics
  const totalEvaluated = studentReports.length;
  const passedStudents = studentReports.filter(r => r?.overallStatus === 'PASS').length;
  const failedStudents = studentReports.filter(r => r?.overallStatus === 'FAIL').length;
  const withheldStudents = studentReports.filter(r => r?.overallStatus === 'WITHHELD').length;
  const passPercentage =
    totalEvaluated > 0 ? Math.round((passedStudents / totalEvaluated) * 100 * 10) / 10 : 0;

  // Grade distributions across all marks in this exam
  const examMarks = marks.filter(m => m.examinationId === selectedExamId);
  const gradeCounts: Record<string, number> = {
    O: 0,
    'A+': 0,
    A: 0,
    'B+': 0,
    B: 0,
    C: 0,
    RA: 0,
    AB: 0,
    WH: 0,
  };
  examMarks.forEach(m => {
    if (gradeCounts[m.grade] !== undefined) {
      gradeCounts[m.grade]++;
    }
  });

  // Sort top students by SGPA
  const rankList = [...studentReports].sort((a, b) => (b?.sgpa || 0) - (a?.sgpa || 0));

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Rank',
      'Register Number',
      'Student Name',
      'Department',
      'Semester',
      'Total Scored',
      'Max Marks',
      'Percentage',
      'SGPA',
      'Status',
    ];

    const rows = rankList.map((r, idx) => [
      idx + 1,
      r?.student.registerNumber,
      `"${r?.student.name}"`,
      departments.find(d => d.departmentId === r?.student.departmentId)?.code || 'CSE',
      r?.student.currentSemester,
      r?.totalMarksScored,
      r?.maximumMarksTotal,
      `${r?.percentage.toFixed(2)}%`,
      r?.sgpa.toFixed(2),
      r?.overallStatus,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Academic_Report_${selectedExam?.examinationId}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Semester performance report exported to CSV', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Semester Performance & Result Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department-wise pass percentage, university rank distribution, and institutional academic reports.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Analytics Report (CSV)</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Examination Session
            </label>
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              {examinations.map(exam => (
                <option key={exam.examinationId} value={exam.examinationId}>
                  {exam.title} {exam.isPublished ? '(Published)' : '(In Review)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Department Filter
            </label>
            <select
              value={selectedDeptId}
              onChange={e => setSelectedDeptId(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Academic Departments</option>
              {departments.map(d => (
                <option key={d.departmentId} value={d.departmentId}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Session Status: {selectedExam?.isPublished ? 'Published to Students' : 'Administrative Draft'}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Candidates Evaluated</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalEvaluated}
          </p>
          <span className="text-[11px] text-slate-400">Total registered candidates</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Overall Pass Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {passPercentage}%
          </p>
          <span className="text-[11px] text-slate-400">{passedStudents} of {totalEvaluated} cleared all subjects</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Re-Appearance (Arrear)</span>
            <Users className="w-4 h-4 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-700 font-mono tabular-nums">
            {failedStudents}
          </p>
          <span className="text-[11px] text-slate-400">Requires supplementary exam</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Results Withheld</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700 font-mono tabular-nums">
            {withheldStudents}
          </p>
          <span className="text-[11px] text-slate-400">Pending administrative review</span>
        </div>
      </div>

      {/* Grade Distribution Bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Letter Grade Distribution Breakdown
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
          {Object.entries(gradeCounts).map(([grade, count]) => (
            <div
              key={grade}
              className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-center"
            >
              <span className="text-xs font-bold text-slate-700 font-mono block">{grade}</span>
              <span className="text-lg font-black text-slate-900 font-mono tabular-nums mt-1 block">
                {count}
              </span>
              <span className="text-[10px] text-slate-400">courses</span>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Rank & Merit List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Academic Merit & Rank Order
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            Ranked by Semester SGPA
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50/40">
                <th className="py-3 px-4 w-14 text-center">Rank</th>
                <th className="py-3 px-4">Register Number</th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3 text-right">Total Scored</th>
                <th className="py-3 px-3 text-right">Aggregate %</th>
                <th className="py-3 px-3 text-center">Semester SGPA</th>
                <th className="py-3 px-4 text-center">Final Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {rankList.map((r, idx) => (
                <tr key={r?.student.studentId} className={idx === 0 ? 'bg-amber-50/40 font-semibold' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                  <td className="py-3 px-4 text-center">
                    {idx === 0 ? (
                      <span className="inline-block px-2 py-0.5 bg-amber-500 text-white rounded font-bold text-[11px]">
                        #1
                      </span>
                    ) : (
                      <span className="text-slate-500">#{idx + 1}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {r?.student.registerNumber}
                  </td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-800">
                    {r?.student.name}
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px] text-slate-700">
                      {departments.find(d => d.departmentId === r?.student.departmentId)?.code || 'CSE'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-700">
                    {r?.totalMarksScored} / {r?.maximumMarksTotal}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-900">
                    {r?.percentage.toFixed(2)}%
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-blue-700 text-sm">
                    {r?.sgpa.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    {r?.overallStatus === 'PASS' ? (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        PASS
                      </span>
                    ) : r?.overallStatus === 'WITHHELD' ? (
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
  );
};
