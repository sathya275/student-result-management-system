import React from 'react';
import { useApp, ActivePage } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Edit3,
  Send,
  FileText,
  BarChart2,
  Settings,
  GraduationCap,
  Sparkles,
  Home,
  CheckCircle2,
} from 'lucide-react';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { activePage, navigateTo, currentUser, examinations } = useApp();

  const publishedCount = examinations.filter(e => e.isPublished).length;

  interface NavItem {
    id: ActivePage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: ('admin' | 'faculty' | 'student')[];
    badge?: string | number;
  }

  const navGroups: { title: string; items: NavItem[] }[] = [
    {
      title: 'Portal Overview',
      items: [
        { id: 'home', label: 'Institutional Home', icon: Home },
        {
          id: 'admin-dashboard',
          label: 'Admin Overview',
          icon: LayoutDashboard,
          roles: ['admin'],
        },
        {
          id: 'faculty-dashboard',
          label: 'Faculty Workspace',
          icon: LayoutDashboard,
          roles: ['faculty', 'admin'],
        },
        {
          id: 'student-dashboard',
          label: 'Student Academic Hub',
          icon: GraduationCap,
          roles: ['student', 'admin', 'faculty'],
        },
      ],
    },
    {
      title: 'Academic Records',
      items: [
        { id: 'students', label: 'Student Directory', icon: Users, roles: ['admin', 'faculty'] },
        { id: 'subjects', label: 'Subjects & Credits', icon: BookOpen },
        { id: 'marks-entry', label: 'Marks Entry & Grading', icon: Edit3, roles: ['admin', 'faculty'] },
      ],
    },
    {
      title: 'Examinations & Results',
      items: [
        {
          id: 'results-publish',
          label: 'Result Publication',
          icon: Send,
          roles: ['admin'],
          badge: `${publishedCount} Live`,
        },
        { id: 'student-result', label: 'View Marksheet', icon: FileText },
        { id: 'semester-report', label: 'Semester Analytics', icon: BarChart2 },
      ],
    },
    {
      title: 'System & Rules',
      items: [
        { id: 'settings', label: 'Grading Rules & Config', icon: Settings, roles: ['admin'] },
      ],
    },
  ];

  const handleNavClick = (page: ActivePage) => {
    navigateTo(page);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          {navGroups.map((group, gIdx) => {
            const filteredItems = group.items.filter(item => {
              if (!item.roles) return true;
              if (!currentUser) return item.roles.includes('student');
              return item.roles.includes(currentUser.role);
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={gIdx}>
                <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {filteredItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-xs'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded text-white ${
                              isActive ? 'bg-blue-700' : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Database & Cloud Firestore Status */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Firestore Connected</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Enterprise</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Role security enforced via Firestore rules with real-time audit logs.
          </p>
        </div>
      </aside>
    </>
  );
};
