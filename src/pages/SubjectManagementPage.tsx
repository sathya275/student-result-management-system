import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Subject } from '../types';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Users,
  Award,
} from 'lucide-react';

export const SubjectManagementPage: React.FC = () => {
  const { subjects, departments, faculty, saveSubject, deleteSubject, saveFaculty, addToast, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.departmentId || 'dept_cse');
  const [semester, setSemester] = useState(4);
  const [credits, setCredits] = useState(3);
  const [maxInternalMarks, setMaxInternalMarks] = useState(40);
  const [maxExternalMarks, setMaxExternalMarks] = useState(60);
  const [minPassMarks, setMinPassMarks] = useState(50);
  const [assignedFacultyId, setAssignedFacultyId] = useState('');
  const [formError, setFormError] = useState('');

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setName('');
    setCode('');
    setDepartmentId(departments[0]?.departmentId || 'dept_cse');
    setSemester(4);
    setCredits(3);
    setMaxInternalMarks(40);
    setMaxExternalMarks(60);
    setMinPassMarks(50);
    setAssignedFacultyId(faculty[0]?.facultyId || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Subject) => {
    setEditingSubject(s);
    setName(s.name);
    setCode(s.code);
    setDepartmentId(s.departmentId);
    setSemester(s.semester);
    setCredits(s.credits);
    setMaxInternalMarks(s.maxInternalMarks);
    setMaxExternalMarks(s.maxExternalMarks);
    setMinPassMarks(s.minPassMarks);

    const currentTeacher = faculty.find(f => f.assignedSubjectIds.includes(s.subjectId));
    setAssignedFacultyId(currentTeacher?.facultyId || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !code.trim()) {
      setFormError('Subject title and course code are required.');
      return;
    }

    if (maxInternalMarks + maxExternalMarks <= 0) {
      setFormError('Sum of internal and external marks must be positive.');
      return;
    }

    if (minPassMarks > maxInternalMarks + maxExternalMarks) {
      setFormError('Minimum pass marks cannot exceed maximum total marks.');
      return;
    }

    const subId = editingSubject ? editingSubject.subjectId : `sub_${Date.now()}`;
    const subjectData: Subject = {
      subjectId: subId,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      departmentId,
      semester: Number(semester),
      credits: Number(credits),
      maxInternalMarks: Number(maxInternalMarks),
      maxExternalMarks: Number(maxExternalMarks),
      minPassMarks: Number(minPassMarks),
      isActive: true,
    };

    await saveSubject(subjectData);

    // Update faculty assignment
    if (assignedFacultyId) {
      const chosenFaculty = faculty.find(f => f.facultyId === assignedFacultyId);
      if (chosenFaculty && !chosenFaculty.assignedSubjectIds.includes(subId)) {
        await saveFaculty({
          ...chosenFaculty,
          assignedSubjectIds: [...chosenFaculty.assignedSubjectIds, subId],
        });
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (subId: string, subName: string) => {
    if (confirm(`Are you sure you want to delete subject "${subName}"?`)) {
      await deleteSubject(subId);
    }
  };

  const filteredSubjects = subjects.filter(s => {
    const matchesSearch =
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'all' || s.departmentId === filterDept;
    const matchesSem = filterSemester === 'all' || s.semester.toString() === filterSemester;
    return matchesSearch && matchesDept && matchesSem;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Curriculum & Subject Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure academic courses, credits, internal/external mark limits, and assign course instructors.
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Subject</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search course code or name..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
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
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
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

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSubjects.map(sub => {
          const dept = departments.find(d => d.departmentId === sub.departmentId);
          const teacher = faculty.find(f => f.assignedSubjectIds.includes(sub.subjectId));

          return (
            <div
              key={sub.subjectId}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                    {sub.code}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {dept?.code} · Sem {sub.semester}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  {sub.name}
                </h3>

                <div className="mt-4 grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-lg text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Credits</span>
                    <span className="font-mono font-bold text-slate-900">{sub.credits}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Max Total</span>
                    <span className="font-mono font-bold text-slate-900">
                      {sub.maxInternalMarks + sub.maxExternalMarks}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Pass Mark</span>
                    <span className="font-mono font-bold text-emerald-700">{sub.minPassMarks}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {teacher ? teacher.name : 'No instructor assigned'}
                  </span>
                </div>
              </div>

              {currentUser?.role === 'admin' && (
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Ratio: {sub.maxInternalMarks} Int / {sub.maxExternalMarks} Ext
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(sub)}
                      className="p-1 text-slate-500 hover:text-blue-700 rounded hover:bg-slate-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sub.subjectId, sub.name)}
                      className="p-1 text-slate-500 hover:text-rose-700 rounded hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingSubject ? 'Edit Subject Specifications' : 'Create New Curriculum Subject'}
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
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="e.g. CS8451"
                    required
                    className="w-full px-3 py-1.5 text-xs font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Subject Title *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Computer Networks"
                    required
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={departmentId}
                    onChange={e => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
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
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={e => setSemester(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    value={credits}
                    onChange={e => setCredits(Number(e.target.value))}
                    min={1}
                    max={10}
                    className="w-full px-2 py-1.5 text-xs font-mono border border-slate-300 rounded-lg text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Max Int (40)
                  </label>
                  <input
                    type="number"
                    value={maxInternalMarks}
                    onChange={e => setMaxInternalMarks(Number(e.target.value))}
                    min={10}
                    max={100}
                    className="w-full px-2 py-1.5 text-xs font-mono border border-slate-300 rounded-lg text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Max Ext (60)
                  </label>
                  <input
                    type="number"
                    value={maxExternalMarks}
                    onChange={e => setMaxExternalMarks(Number(e.target.value))}
                    min={10}
                    max={100}
                    className="w-full px-2 py-1.5 text-xs font-mono border border-slate-300 rounded-lg text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Pass Mark
                  </label>
                  <input
                    type="number"
                    value={minPassMarks}
                    onChange={e => setMinPassMarks(Number(e.target.value))}
                    min={10}
                    max={100}
                    className="w-full px-2 py-1.5 text-xs font-mono border border-slate-300 rounded-lg text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Assigned Faculty Instructor
                </label>
                <select
                  value={assignedFacultyId}
                  onChange={e => setAssignedFacultyId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- No Instructor Assigned --</option>
                  {faculty.map(f => (
                    <option key={f.facultyId} value={f.facultyId}>
                      {f.name} ({f.designation})
                    </option>
                  ))}
                </select>
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
                  {editingSubject ? 'Update Subject' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
