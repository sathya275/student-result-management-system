import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Award,
  CheckCircle,
  FileText,
  Calendar,
  Building2,
  Users,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import campusHeroImage from '../assets/images/college_campus_hero_1792056488926.jpg';
import crestImage from '../assets/images/college_crest_emblem_1792056488844.jpg';

export const HomePage: React.FC = () => {
  const {
    students,
    examinations,
    settings,
    departments,
    loginAsDemoRole,
    getStudentResultSummary,
    openMarksheetModal,
    addToast,
    navigateTo,
  } = useApp();

  const [searchRegNo, setSearchRegNo] = useState('');
  const [selectedExamId, setSelectedExamId] = useState(
    examinations.find(e => e.isPublished)?.examinationId || examinations[0]?.examinationId || ''
  );
  const [searchError, setSearchError] = useState('');

  const publishedExams = examinations.filter(e => e.isPublished);

  const handleQuickResultSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');

    const cleanReg = searchRegNo.trim();
    if (!cleanReg) {
      setSearchError('Please enter a valid student register number');
      return;
    }

    const student = students.find(
      s => s.registerNumber.toLowerCase() === cleanReg.toLowerCase()
    );

    if (!student) {
      setSearchError(`No student record found with register number: ${cleanReg}`);
      addToast('Student register number not found', 'error');
      return;
    }

    const exam = examinations.find(ex => ex.examinationId === selectedExamId);
    if (!exam || !exam.isPublished) {
      setSearchError('Results for this examination have not been published by the academic office yet.');
      addToast('Results not yet published', 'info');
      return;
    }

    const summary = getStudentResultSummary(student.studentId, selectedExamId);
    if (!summary || summary.marks.length === 0) {
      setSearchError('No examination marks recorded for this student in the selected session.');
      return;
    }

    openMarksheetModal(summary);
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section with Campus Image Backdrop */}
      <section className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200">
        <div className="relative h-96 sm:h-[420px] w-full">
          <img
            src={campusHeroImage}
            alt="Collegiate Campus"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-slate-900/40" />

          {/* Hero Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-16 text-white max-w-3xl">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={crestImage}
                alt="Apex Seal"
                className="w-12 h-12 rounded-full border border-white/20 object-contain bg-white/10 backdrop-blur-xs"
              />
              <div>
                <span className="text-xs uppercase tracking-widest text-blue-200 font-semibold block">
                  Office of Controller of Examinations
                </span>
                <span className="text-xs text-slate-300">
                  {settings.affiliation}
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white text-balance leading-tight">
              Student Result Management System
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-200 leading-relaxed font-light">
              Secure, centralized institutional platform to calculate grades, audit semester marks,
              publish examination results, and generate tamper-proof digital transcripts.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigateTo('student-result')}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Search Examination Results</span>
              </button>
              <button
                onClick={() => navigateTo('login')}
                className="px-5 py-2.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <span>Portal Login</span>
                <ArrowRight className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Result Portal Lookup Card */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Online Examination Result Inquiry
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Students can view and download their certified semester grade cards instantly by entering their university register number.
            </p>
          </div>

          <form onSubmit={handleQuickResultSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  University Register Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchRegNo}
                    onChange={e => setSearchRegNo(e.target.value)}
                    placeholder="e.g. 710023104001"
                    className="w-full px-3.5 py-2.5 text-sm font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] text-slate-400">
                    Sample: 710023104001
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Examination Session
                </label>
                <select
                  value={selectedExamId}
                  onChange={e => setSelectedExamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {examinations.map(exam => (
                    <option key={exam.examinationId} value={exam.examinationId}>
                      {exam.title} {exam.isPublished ? '(Published)' : '(In Review)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {searchError && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                {searchError}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Protected with Cloud Firestore security rules</span>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>Retrieve Official Marksheet</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Key Stats Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {students.length}
          </p>
          <span className="text-[11px] text-slate-400">Across 4 Engineering Depts</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Academic Departments</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {departments.length}
          </p>
          <span className="text-[11px] text-slate-400">CSE, ECE, IT, MECH</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Published Results</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {publishedExams.length}
          </p>
          <span className="text-[11px] text-slate-400">Of {examinations.length} Exam Sessions</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Overall Pass Ratio</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            87.5%
          </p>
          <span className="text-[11px] text-slate-400">Sem IV Regular Examinations</span>
        </div>
      </section>

      {/* Role-Based Quick Access Portal */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            One-Click Portal Demonstration
          </h3>
          <p className="text-xs text-slate-500">
            Select any stakeholder persona below to explore full capabilities, marks calculation, approval workflows, or student transcript downloads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Admin Role Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900">Administrator Console</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Add students, configure departments and subjects, review submitted faculty marks, publish or unpublish examination results, and manage grading rules.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">Role: admin</span>
              <button
                onClick={() => loginAsDemoRole('admin')}
                className="px-3.5 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
              >
                Enter Admin Hub →
              </button>
            </div>
          </div>

          {/* Faculty Role Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900">Faculty Workspace</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                View assigned curriculum subjects, enter internal and external marks, automatically calculate percentages & grades, save drafts, and submit to Admin.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">Dr. Sarah Jenkins</span>
              <button
                onClick={() => loginAsDemoRole('faculty', 'fac_1')}
                className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                Enter Faculty Hub →
              </button>
            </div>
          </div>

          {/* Student Role Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900">Student Academic Hub</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Log in securely to view published semester marks, subject credits, earned grade points, SGPA/CGPA calculations, and download verified PDF marksheets.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">Reg: 710023104001</span>
              <button
                onClick={() => loginAsDemoRole('student', 'stud_1')}
                className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
              >
                Enter Student Hub →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* College Examination Notice Board */}
      <section className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Office of Controller of Examinations Circulars
          </h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-900">
                Publication of Semester IV Regular Examination Results (April 2026 Session)
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                The results for B.E. / B.Tech Semester IV examinations are published. Marksheets are available for PDF download.
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold whitespace-nowrap">
              Published
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-900">
                Deadline for Faculty Marks Submission - Semester V Continuous Assessment
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                All subject faculties are requested to enter internal and external marks before October 28, 2026 for administrative review.
              </p>
            </div>
            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold whitespace-nowrap">
              Action Required
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
