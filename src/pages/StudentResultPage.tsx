import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  FileText,
  Printer,
  Download,
  AlertCircle,
  Award,
  Calendar,
  User,
  GraduationCap,
} from 'lucide-react';
import { generateMarksheetPDF } from '../utils/pdfGenerator';
import crestImage from '../assets/images/college_crest_emblem_1792056488844.jpg';

export const StudentResultPage: React.FC = () => {
  const {
    students,
    examinations,
    settings,
    getStudentResultSummary,
    openMarksheetModal,
    addToast,
  } = useApp();

  const [registerNumber, setRegisterNumber] = useState('710023104001');
  const [selectedExamId, setSelectedExamId] = useState<string>(
    examinations.find(e => e.isPublished)?.examinationId || examinations[0]?.examinationId || ''
  );
  const [activeSummary, setActiveSummary] = useState(
    getStudentResultSummary('stud_1', examinations.find(e => e.isPublished)?.examinationId || '')
  );
  const [errorMessage, setErrorMessage] = useState('');

  const selectedExam = examinations.find(e => e.examinationId === selectedExamId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const clean = registerNumber.trim();
    if (!clean) {
      setErrorMessage('Please provide a student register number.');
      return;
    }

    const student = students.find(
      s => s.registerNumber.toLowerCase() === clean.toLowerCase()
    );

    if (!student) {
      setErrorMessage(`No student record found with register number: ${clean}`);
      setActiveSummary(null);
      return;
    }

    if (selectedExam && !selectedExam.isPublished) {
      setErrorMessage(
        'Results for this examination term are currently under confidential evaluation and have not been published by the examination cell.'
      );
      setActiveSummary(null);
      return;
    }

    const summary = getStudentResultSummary(student.studentId, selectedExamId);
    if (!summary || summary.marks.length === 0) {
      setErrorMessage('No marks records found for this student in the selected examination session.');
      setActiveSummary(null);
      return;
    }

    setActiveSummary(summary);
  };

  const handleDownloadPDF = () => {
    if (activeSummary) {
      generateMarksheetPDF(activeSummary, settings);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Student Examination Result & Grade Card
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Official semester grade statement, subject credits, internal-external assessment breakdown, and SGPA transcript.
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Student Register Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={registerNumber}
                onChange={e => setRegisterNumber(e.target.value)}
                placeholder="e.g. 710023104001"
                className="w-full px-3.5 py-2 text-xs font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Examination Session
            </label>
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {examinations.map(exam => (
                <option key={exam.examinationId} value={exam.examinationId}>
                  {exam.title} {exam.isPublished ? '(Published)' : '(In Review)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Query Result Card</span>
            </button>
          </div>
        </form>

        {/* Quick sample chips */}
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
          <span>Sample demo candidates:</span>
          {students.slice(0, 4).map(s => (
            <button
              key={s.studentId}
              type="button"
              onClick={() => {
                setRegisterNumber(s.registerNumber);
              }}
              className="font-mono text-blue-600 hover:underline"
            >
              {s.registerNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Error / Unpublished Banner */}
      {errorMessage && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-950">Result Query Status</p>
            <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Marksheet Display */}
      {activeSummary && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Action Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
              <Award className="w-4 h-4 text-blue-700" />
              <span>Statement of Grades · {activeSummary.student.registerNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Certified PDF</span>
              </button>
            </div>
          </div>

          {/* Marksheet Institutional Body */}
          <div className="p-8 sm:p-10 space-y-6">
            {/* Header Lockup */}
            <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
              <img
                src={crestImage}
                alt="College Crest"
                className="w-16 h-16 object-contain rounded-full border border-slate-200 p-0.5"
              />
              <div className="text-center flex-1">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                  {settings.collegeName}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  {settings.affiliation} · Code: {settings.collegeCode}
                </p>
                <p className="text-[11px] text-slate-500">{settings.accreditation}</p>
              </div>
              <div className="w-16 text-right">
                <span className="text-[10px] text-slate-400 font-mono block">GRADE SHEET</span>
                <span
                  className={`text-xs font-bold ${
                    activeSummary.overallStatus === 'PASS'
                      ? 'text-emerald-700'
                      : activeSummary.overallStatus === 'WITHHELD'
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}
                >
                  {activeSummary.overallStatus}
                </span>
              </div>
            </div>

            {/* Candidate Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Register Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {activeSummary.student.registerNumber}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Student Name</span>
                <span className="font-bold text-slate-900 uppercase">
                  {activeSummary.student.name}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Degree Course</span>
                <span className="font-medium text-slate-800">
                  {activeSummary.student.course}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Semester / Batch</span>
                <span className="font-medium text-slate-800">
                  Sem {activeSummary.student.currentSemester} ({activeSummary.student.academicYear})
                </span>
              </div>
            </div>

            {/* Marks Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-medium">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 w-24">Subject Code</th>
                    <th className="py-2.5 px-3">Course Title</th>
                    <th className="py-2.5 px-3 text-center w-16">Credits</th>
                    <th className="py-2.5 px-3 text-right w-16">Internal</th>
                    <th className="py-2.5 px-3 text-right w-16">External</th>
                    <th className="py-2.5 px-3 text-right w-16">Total</th>
                    <th className="py-2.5 px-3 text-center w-14">Grade</th>
                    <th className="py-2.5 px-3 text-center w-14">GP</th>
                    <th className="py-2.5 px-3 text-center w-18">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                  {activeSummary.marks.map((m, idx) => (
                    <tr key={m.markId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-2.5 px-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{m.subjectCode}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-800">{m.subjectName}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600">3</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{m.isAbsent ? 'AB' : m.internalMarks}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{m.isAbsent ? 'AB' : m.externalMarks}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {m.isAbsent ? 0 : m.totalMarks}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold font-sans text-slate-900">{m.grade}</td>
                      <td className="py-2.5 px-3 text-center text-slate-700">{m.gradePoint}</td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        {m.isPassed ? (
                          <span className="text-[11px] font-semibold text-emerald-700">PASS</span>
                        ) : m.isWithheld ? (
                          <span className="text-[11px] font-semibold text-amber-700">WITHHELD</span>
                        ) : (
                          <span className="text-[11px] font-semibold text-rose-700">FAIL</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Performance Calculation Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-medium">Earned Credits</span>
                <p className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                  {activeSummary.earnedCredits} / {activeSummary.totalCredits}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-medium">Total Marks Scored</span>
                <p className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                  {activeSummary.totalMarksScored} / {activeSummary.maximumMarksTotal}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-medium">Overall Percentage</span>
                <p className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                  {activeSummary.percentage.toFixed(2)}%
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-medium">Semester SGPA</span>
                <p className="text-2xl font-black text-blue-800 font-mono tabular-nums">
                  {activeSummary.sgpa.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
