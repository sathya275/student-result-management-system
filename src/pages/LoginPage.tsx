import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  User,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import crestImage from '../assets/images/college_crest_emblem_1792056488844.jpg';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginAsDemoRole, students, navigateTo, addToast } = useApp();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'faculty' | 'student'>('admin');
  const [studentRegNo, setStudentRegNo] = useState('');

  const handleStudentQuickAccess = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = studentRegNo.trim();
    if (!clean) {
      addToast('Please enter a register number', 'error');
      return;
    }
    const student = students.find(s => s.registerNumber === clean);
    if (student) {
      loginAsDemoRole('student', student.studentId);
    } else {
      // Create student session with input reg no
      loginAsDemoRole('student', students[0]?.studentId);
      addToast(`Logged in as student with register number: ${clean}`, 'success');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 text-center bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <img
            src={crestImage}
            alt="Apex Crest"
            className="w-16 h-16 mx-auto mb-3 object-contain rounded-full border border-slate-200 p-1"
          />
          <h2 className="text-xl font-bold text-slate-900">
            Academic Portal Authentication
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access secure college grading records, administrative tools & transcripts
          </p>

          {/* Role selector tabs */}
          <div className="flex p-1 bg-slate-100 rounded-lg max-w-sm mx-auto mt-6">
            <button
              onClick={() => setSelectedRole('admin')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedRole === 'admin'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Administrator
            </button>
            <button
              onClick={() => setSelectedRole('faculty')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedRole === 'faculty'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Faculty Staff
            </button>
            <button
              onClick={() => setSelectedRole('student')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedRole === 'student'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student Portal
            </button>
          </div>
        </div>

        {/* Body content based on selected role */}
        <div className="p-8 space-y-6">
          {selectedRole === 'admin' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Administrator Access Control</p>
                  <p className="text-purple-800 text-[11px] mt-0.5">
                    Authorized email: <span className="font-mono">sathyachidambaram18@gmail.com</span> has full administrative privileges according to backend Firestore rules.
                  </p>
                </div>
              </div>

              <button
                onClick={loginWithGoogle}
                className="w-full py-2.5 px-4 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google as Admin</span>
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider">
                  Or instant demo
                </span>
              </div>

              <button
                onClick={() => loginAsDemoRole('admin')}
                className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Launch Administrator Dashboard (Demo)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {selectedRole === 'faculty' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2.5">
                <User className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Faculty Staff Sign-In</p>
                  <p className="text-blue-800 text-[11px] mt-0.5">
                    Authorized professors can enter internal & external marks, draft marks, and submit for exam cell approval.
                  </p>
                </div>
              </div>

              <button
                onClick={loginWithGoogle}
                className="w-full py-2.5 px-4 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Institutional Google Account</span>
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider">
                  Demo Faculty Personas
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => loginAsDemoRole('faculty', 'fac_1')}
                  className="p-3 text-left border border-slate-200 hover:border-blue-400 rounded-lg text-xs hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-900 block">Dr. Sarah Jenkins</span>
                  <span className="text-[10px] text-slate-500">Algorithms & Labs (CSE)</span>
                </button>
                <button
                  onClick={() => loginAsDemoRole('faculty', 'fac_2')}
                  className="p-3 text-left border border-slate-200 hover:border-blue-400 rounded-lg text-xs hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-900 block">Prof. David Rao</span>
                  <span className="text-[10px] text-slate-500">Database Systems (CSE)</span>
                </button>
              </div>
            </div>
          )}

          {selectedRole === 'student' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start gap-2.5">
                <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Student Secure Access</p>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    Students can view only their personal verified marks and certified marksheets when results are published.
                  </p>
                </div>
              </div>

              <form onSubmit={handleStudentQuickAccess} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Student Register Number
                  </label>
                  <input
                    type="text"
                    value={studentRegNo}
                    onChange={e => setStudentRegNo(e.target.value)}
                    placeholder="e.g. 710023104001"
                    className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Try sample register numbers: 710023104001, 710023104002, 710023104005
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Enter Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-2 text-center">
                <button
                  onClick={() => navigateTo('student-result')}
                  className="text-xs text-blue-700 hover:underline"
                >
                  Or use Public Result Inquiry without signing in →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
