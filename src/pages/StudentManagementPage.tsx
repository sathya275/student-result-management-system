import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  X,
  FileSpreadsheet,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';

export const StudentManagementPage: React.FC = () => {
  const { students, departments, saveStudent, deleteStudent, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form Fields
  const [registerNumber, setRegisterNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.departmentId || 'dept_cse');
  const [course, setCourse] = useState('B.E. Computer Science and Engineering');
  const [currentSemester, setCurrentSemester] = useState(4);
  const [academicYear, setAcademicYear] = useState('2023-2027');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [formError, setFormError] = useState('');

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setRegisterNumber('');
    setName('');
    setEmail('');
    setDepartmentId(departments[0]?.departmentId || 'dept_cse');
    setCourse('B.E. Computer Science and Engineering');
    setCurrentSemester(4);
    setAcademicYear('2023-2027');
    setPhone('');
    setDob('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (s: Student) => {
    setEditingStudent(s);
    setRegisterNumber(s.registerNumber);
    setName(s.name);
    setEmail(s.email);
    setDepartmentId(s.departmentId);
    setCourse(s.course);
    setCurrentSemester(s.currentSemester);
    setAcademicYear(s.academicYear);
    setPhone(s.phone || '');
    setDob(s.dob || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!registerNumber.trim() || !name.trim()) {
      setFormError('Register number and student name are required.');
      return;
    }

    // Check duplicate register number if creating new
    if (!editingStudent) {
      const exists = students.some(
        s => s.registerNumber.toLowerCase() === registerNumber.trim().toLowerCase()
      );
      if (exists) {
        setFormError(`A student with register number "${registerNumber.trim()}" already exists.`);
        return;
      }
    }

    const studentData: Student = {
      studentId: editingStudent ? editingStudent.studentId : `stud_${Date.now()}`,
      registerNumber: registerNumber.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim() || `${registerNumber.trim().toLowerCase()}@student.apex.edu`,
      departmentId,
      course,
      currentSemester: Number(currentSemester),
      academicYear,
      phone: phone.trim(),
      dob: dob.trim(),
      createdAt: editingStudent?.createdAt || new Date().toISOString(),
    };

    await saveStudent(studentData);
    setIsModalOpen(false);
  };

  const handleDelete = async (studentId: string, studentName: string) => {
    if (confirm(`Are you sure you want to delete student "${studentName}"?`)) {
      await deleteStudent(studentId);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Register Number', 'Name', 'Email', 'Department', 'Course', 'Semester', 'Academic Year', 'Phone'];
    const rows = filteredStudents.map(s => {
      const dept = departments.find(d => d.departmentId === s.departmentId)?.code || s.departmentId;
      return [s.registerNumber, `"${s.name}"`, s.email, dept, `"${s.course}"`, s.currentSemester, s.academicYear, s.phone || ''];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Students_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Student records exported to CSV', 'success');
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.registerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'all' || s.departmentId === filterDept;
    const matchesSem = filterSemester === 'all' || s.currentSemester.toString() === filterSemester;
    return matchesSearch && matchesDept && matchesSem;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Student Management Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enroll students, update department assignments, and audit examination eligibility.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enroll New Student</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search name or register no..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d.departmentId} value={d.departmentId}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>

          <select
            value={filterSemester}
            onChange={e => setFilterSemester(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
              <option key={sem} value={sem.toString()}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50/60">
                <th className="py-3 px-4">Register Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Degree Course</th>
                <th className="py-3 px-3 text-center">Semester</th>
                <th className="py-3 px-3">Academic Batch</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s, idx) => {
                  const dept = departments.find(d => d.departmentId === s.departmentId);
                  return (
                    <tr key={s.studentId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {s.registerNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">{s.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{s.email}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {dept?.code || 'CSE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-medium">{s.course}</td>
                      <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-800">
                        Sem {s.currentSemester}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600 text-[11px]">{s.academicYear}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit student"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.studentId, s.name)}
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No students match the specified search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex justify-between items-center">
          <span>Showing {filteredStudents.length} of {students.length} students</span>
          <span className="font-mono">Page 1 of 1</span>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudent ? 'Edit Student Record' : 'Enroll New Student'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Register Number *
                  </label>
                  <input
                    type="text"
                    value={registerNumber}
                    onChange={e => setRegisterNumber(e.target.value)}
                    placeholder="e.g. 710023104009"
                    required
                    className="w-full px-3 py-1.5 text-xs font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Kousalya Murugan"
                    required
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@apex.edu"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={departmentId}
                    onChange={e => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {departments.map(d => (
                      <option key={d.departmentId} value={d.departmentId}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Current Semester *
                  </label>
                  <select
                    value={currentSemester}
                    onChange={e => setCurrentSemester(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Degree Program *
                </label>
                <input
                  type="text"
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                  placeholder="e.g. B.E. Computer Science and Engineering"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Academic Year Batch
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={e => setAcademicYear(e.target.value)}
                    placeholder="2023-2027"
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  {editingStudent ? 'Update Student Record' : 'Save & Enroll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
