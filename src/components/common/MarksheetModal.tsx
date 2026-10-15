import React from 'react';
import { useApp } from '../../context/AppContext';
import { generateMarksheetPDF } from '../../utils/pdfGenerator';
import { Download, Printer, X, Award, CheckCircle, AlertTriangle } from 'lucide-react';
import crestImage from '../../assets/images/college_crest_emblem_1792056488844.jpg';

export const MarksheetModal: React.FC = () => {
  const { selectedResultSummary, closeMarksheetModal, settings } = useApp();

  if (!selectedResultSummary) return null;

  const {
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
  } = selectedResultSummary;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateMarksheetPDF(selectedResultSummary, settings);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden print:border-none print:shadow-none print:max-w-none">
        {/* Modal Top Actions (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Award className="w-4 h-4 text-blue-700" />
            <span className="font-semibold text-slate-800">Official Semester Grade Report</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">{student.registerNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={closeMarksheetModal}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Marksheet Body */}
        <div className="p-8 sm:p-10 text-slate-900 bg-white print:p-0">
          {/* Institution Header with Crest */}
          <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
            <img
              src={crestImage}
              alt="College Crest"
              className="w-20 h-20 object-contain rounded-full border border-slate-200 p-0.5"
            />
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
                {settings.collegeName}
              </h1>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {settings.affiliation} · College Code: {settings.collegeCode}
              </p>
              <p className="text-xs text-slate-500">{settings.accreditation}</p>
              <p className="text-xs text-slate-500">{settings.address}</p>
            </div>
            <div className="w-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center text-[10px] text-slate-400">
                <span>Official</span>
                <span>Seal</span>
              </div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="my-5 py-2 bg-slate-100 border border-slate-300 rounded text-center">
            <h2 className="text-sm font-bold tracking-wider text-slate-800 uppercase">
              Grade Sheet / Statement of Marks
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {examination.title}
            </p>
          </div>

          {/* Student Profile Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs mb-6">
            <div className="flex">
              <span className="w-32 text-slate-500 font-semibold">Register Number:</span>
              <span className="font-mono font-bold text-slate-900">{student.registerNumber}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 font-semibold">Examination Date:</span>
              <span className="font-medium text-slate-900">{examination.examDate}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 font-semibold">Student Name:</span>
              <span className="font-semibold text-slate-900 uppercase">{student.name}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 font-semibold">Academic Year:</span>
              <span className="font-medium text-slate-900">{student.academicYear}</span>
            </div>
            <div className="flex col-span-2">
              <span className="w-32 text-slate-500 font-semibold">Degree & Program:</span>
              <span className="font-medium text-slate-900">{student.course}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 font-semibold">Semester:</span>
              <span className="font-medium text-slate-900">Semester {student.currentSemester}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 font-semibold">Result Status:</span>
              <span
                className={`font-bold ${
                  overallStatus === 'PASS'
                    ? 'text-emerald-700'
                    : overallStatus === 'WITHHELD'
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {overallStatus}
              </span>
            </div>
          </div>

          {/* Tabular Marks Section */}
          <div className="border border-slate-300 rounded-lg overflow-hidden mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-medium">
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 w-24">Subject Code</th>
                  <th className="py-2.5 px-3">Subject Name</th>
                  <th className="py-2.5 px-3 text-center w-16">Credits</th>
                  <th className="py-2.5 px-3 text-right w-16">Internal</th>
                  <th className="py-2.5 px-3 text-right w-16">External</th>
                  <th className="py-2.5 px-3 text-right w-16">Total</th>
                  <th className="py-2.5 px-3 text-center w-14">Grade</th>
                  <th className="py-2.5 px-3 text-center w-14">Point</th>
                  <th className="py-2.5 px-3 text-center w-18">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
                {marks.map((m, idx) => (
                  <tr key={m.markId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{m.subjectCode}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-800">{m.subjectName}</td>
                    <td className="py-2.5 px-3 text-center text-slate-700">3</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{m.isAbsent ? 'AB' : m.internalMarks}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{m.isAbsent ? 'AB' : m.externalMarks}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {m.isAbsent ? 0 : m.totalMarks}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold font-sans text-slate-900">{m.grade}</td>
                    <td className="py-2.5 px-3 text-center text-slate-700">{m.gradePoint}</td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      {m.isPassed ? (
                        <span className="text-emerald-700 font-bold">PASS</span>
                      ) : m.isWithheld ? (
                        <span className="text-amber-700 font-bold">WTH</span>
                      ) : (
                        <span className="text-rose-700 font-bold">FAIL</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Academic Calculation Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-100 rounded-lg border border-slate-300 mb-6">
            <div>
              <p className="text-[11px] text-slate-500 uppercase font-medium">Credits Registered</p>
              <p className="text-lg font-bold text-slate-900 font-mono tabular-nums">{totalCredits}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase font-medium">Credits Earned</p>
              <p className="text-lg font-bold text-slate-900 font-mono tabular-nums">{earnedCredits}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase font-medium">Aggregate Percentage</p>
              <p className="text-lg font-bold text-slate-900 font-mono tabular-nums">{percentage.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase font-medium">Semester GPA (SGPA)</p>
              <p className="text-xl font-black text-blue-800 font-mono tabular-nums">{sgpa.toFixed(2)}</p>
            </div>
          </div>

          {/* Grading Legend */}
          <div className="text-[11px] text-slate-500 border border-slate-200 rounded p-2.5 mb-8">
            <span className="font-semibold text-slate-700">Grading Key: </span>
            O: Outstanding (90-100, GP 10) · A+: Excellent (80-89, GP 9) · A: Very Good (70-79, GP 8) · B+: Good (60-69, GP 7) · B: Above Average (50-59, GP 6) · C: Pass (45-49, GP 5) · RA: Re-Appearance / Fail · AB: Absent · WH: Withheld
          </div>

          {/* Signatures & Certification */}
          <div className="grid grid-cols-3 gap-6 pt-6 text-center text-xs">
            <div>
              <div className="border-t border-slate-400 pt-2 font-medium text-slate-800">
                Staff In-Charge
              </div>
              <p className="text-[10px] text-slate-400">Class Advisor</p>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-2 font-medium text-slate-800">
                Head of Department
              </div>
              <p className="text-[10px] text-slate-400">Academic Dean</p>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-2 font-medium text-slate-800">
                Controller of Examinations
              </div>
              <p className="text-[10px] text-slate-500 font-serif">{settings.controllerOfExams}</p>
            </div>
          </div>

          {/* Verification Barcode / Footnote */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
            <span>Reference ID: {student.registerNumber}-{examination.examinationId}</span>
            <span>Digitally authenticated through Autonomous Examination Cell</span>
            <span>Generated: {new Date().toLocaleDateString('en-GB')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
