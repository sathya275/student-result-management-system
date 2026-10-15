import React, { useState } from 'react';
import { useApp, ActivePage } from '../../context/AppContext';
import { Shield, User, ChevronDown, LogOut, Check } from 'lucide-react';
import crestImage from '../../assets/images/college_crest_emblem_1792056488844.jpg';

export const Navbar: React.FC = () => {
  const { currentUser, activePage, navigateTo, logout, loginAsDemoRole } = useApp();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Generate 4-5 concise single line links according to role
  const getNavLinks = (): { label: string; page: ActivePage }[] => {
    if (!currentUser) {
      return [
        { label: 'Portal Home', page: 'home' },
        { label: 'Check Results', page: 'student-result' },
        { label: 'Curriculum', page: 'subjects' },
        { label: 'Semester Reports', page: 'semester-report' },
      ];
    }
    if (currentUser.role === 'admin') {
      return [
        { label: 'Admin Console', page: 'admin-dashboard' },
        { label: 'Students', page: 'students' },
        { label: 'Subjects', page: 'subjects' },
        { label: 'Publish Results', page: 'results-publish' },
        { label: 'Analytics', page: 'semester-report' },
      ];
    }
    if (currentUser.role === 'faculty') {
      return [
        { label: 'Faculty Console', page: 'faculty-dashboard' },
        { label: 'Marks Entry', page: 'marks-entry' },
        { label: 'Courses', page: 'subjects' },
        { label: 'Performance', page: 'semester-report' },
      ];
    }
    // Student
    return [
      { label: 'My Academic Hub', page: 'student-dashboard' },
      { label: 'Semester Results', page: 'student-result' },
      { label: 'Course Catalog', page: 'subjects' },
      { label: 'Profile Settings', page: 'settings' },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 group focus:outline-hidden"
          >
            <img
              src={crestImage}
              alt="Apex Seal"
              className="w-8 h-8 rounded-full border border-slate-200 object-contain"
            />
            <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
              Apex Academic Portal
            </span>
          </button>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navLinks.map(link => {
              const isActive = activePage === link.page;
              return (
                <button
                  key={link.page}
                  onClick={() => navigateTo(link.page)}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                    isActive
                      ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action / Role switcher */}
          <div className="flex items-center gap-3 shrink-0 relative">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentUser.role === 'admin'
                        ? 'bg-purple-600'
                        : currentUser.role === 'faculty'
                        ? 'bg-blue-600'
                        : 'bg-emerald-600'
                    }`}
                  />
                  <span className="font-semibold uppercase tracking-wider text-[11px]">
                    {currentUser.role}
                  </span>
                  <span className="text-slate-500 font-normal hidden sm:inline">
                    · {currentUser.displayName.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {isRoleDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
                    onMouseLeave={() => setIsRoleDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {currentUser.displayName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    </div>

                    <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Role View
                    </div>

                    <button
                      onClick={() => {
                        loginAsDemoRole('admin');
                        setIsRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-purple-600" />
                        <span>Administrator</span>
                      </div>
                      {currentUser.role === 'admin' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>

                    <button
                      onClick={() => {
                        loginAsDemoRole('faculty', 'fac_1');
                        setIsRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>Faculty (Dr. Sarah Jenkins)</span>
                      </div>
                      {currentUser.role === 'faculty' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>

                    <button
                      onClick={() => {
                        loginAsDemoRole('student', 'stud_1');
                        setIsRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Student (Aadhavan · 710023104001)</span>
                      </div>
                      {currentUser.role === 'student' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setIsRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigateTo('login')}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 shadow-xs"
              >
                Sign In to Portal
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
