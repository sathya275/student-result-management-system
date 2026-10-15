import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MarksheetModal } from './components/common/MarksheetModal';
import { ToastContainer } from './components/common/ToastContainer';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentManagementPage } from './pages/StudentManagementPage';
import { SubjectManagementPage } from './pages/SubjectManagementPage';
import { MarksEntryPage } from './pages/MarksEntryPage';
import { ResultPublicationPage } from './pages/ResultPublicationPage';
import { StudentResultPage } from './pages/StudentResultPage';
import { SemesterReportPage } from './pages/SemesterReportPage';
import { SettingsPage } from './pages/SettingsPage';

import { Menu, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activePage } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'login':
        return <LoginPage />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'faculty-dashboard':
        return <FacultyDashboard />;
      case 'student-dashboard':
        return <StudentDashboard />;
      case 'students':
        return <StudentManagementPage />;
      case 'subjects':
        return <SubjectManagementPage />;
      case 'marks-entry':
        return <MarksEntryPage />;
      case 'results-publish':
        return <ResultPublicationPage />;
      case 'student-result':
        return <StudentResultPage />;
      case 'semester-report':
        return <SemesterReportPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans text-slate-800 antialiased flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Body */}
      <div className="flex-1 flex">
        {/* Mobile Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed bottom-5 left-5 z-40 lg:hidden p-3 bg-blue-700 text-white rounded-full shadow-lg hover:bg-blue-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Content Viewport */}
        <main className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderActivePage()}
          </div>

          {/* Footer */}
          <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 text-xs text-slate-500 text-center">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>
                © {new Date().getFullYear()} Apex Institute of Technology & Science · Examination Automation Division
              </p>
              <div className="flex items-center gap-4 text-[11px] text-slate-400">
                <span>Autonomous Academic Regulations 2026</span>
                <span>·</span>
                <span>Cloud Firestore ABAC Security Enabled</span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Global Certified Transcript Modal */}
      <MarksheetModal />

      {/* Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
