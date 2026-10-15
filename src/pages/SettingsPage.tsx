import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CollegeSettings, GradingRule } from '../types';
import {
  Settings,
  Building2,
  Save,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Award,
  Database,
  Trash2,
} from 'lucide-react';
import crestImage from '../assets/images/college_crest_emblem_1792056488844.jpg';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    gradingRules,
    saveSettings,
    saveGradingRules,
    resetToSampleData,
    addToast,
    currentUser,
  } = useApp();

  // Settings form
  const [collegeName, setCollegeName] = useState(settings.collegeName);
  const [collegeCode, setCollegeCode] = useState(settings.collegeCode);
  const [address, setAddress] = useState(settings.address);
  const [affiliation, setAffiliation] = useState(settings.affiliation);
  const [accreditation, setAccreditation] = useState(settings.accreditation);
  const [defaultPassingPercentage, setDefaultPassingPercentage] = useState(
    settings.defaultPassingPercentage
  );
  const [controllerOfExams, setControllerOfExams] = useState(settings.controllerOfExams);

  // Local copy of grading rules
  const [localRules, setLocalRules] = useState<GradingRule[]>([...gradingRules]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CollegeSettings = {
      ...settings,
      collegeName: collegeName.trim(),
      collegeCode: collegeCode.trim().toUpperCase(),
      address: address.trim(),
      affiliation: affiliation.trim(),
      accreditation: accreditation.trim(),
      defaultPassingPercentage: Number(defaultPassingPercentage),
      controllerOfExams: controllerOfExams.trim(),
    };
    await saveSettings(updated);
  };

  const handleRuleChange = (
    index: number,
    field: 'minPercentage' | 'maxPercentage' | 'gradePoint' | 'description',
    val: string
  ) => {
    const copy = [...localRules];
    if (field === 'description') {
      copy[index].description = val;
    } else {
      copy[index][field] = Number(val);
    }
    setLocalRules(copy);
  };

  const handleSaveRules = async () => {
    await saveGradingRules(localRules);
  };

  const handleResetData = async () => {
    if (confirm('Reset entire system with initial clean sample data? All test records will be restored.')) {
      await resetToSampleData();
      setCollegeName(settings.collegeName);
      setCollegeCode(settings.collegeCode);
      setLocalRules([...gradingRules]);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Institutional Profile & System Policies
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure collegiate marksheet headers, accreditation credentials, 10-point letter grading scales, and database management.
        </p>
      </div>

      {/* College Identity Settings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <img
            src={crestImage}
            alt="Apex Crest"
            className="w-12 h-12 object-contain rounded-full border border-slate-200 p-0.5"
          />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Institution Details & Marksheet Headers
            </h2>
            <p className="text-xs text-slate-500">
              Information displayed on official student marksheets, transcripts, and certified PDFs.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Collegiate Institution Name *
              </label>
              <input
                type="text"
                value={collegeName}
                onChange={e => setCollegeName(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College Affiliation Code *
              </label>
              <input
                type="text"
                value={collegeCode}
                onChange={e => setCollegeCode(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Affiliation & Approval Text
            </label>
            <input
              type="text"
              value={affiliation}
              onChange={e => setAffiliation(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Accreditation & Recognition Line
            </label>
            <input
              type="text"
              value={accreditation}
              onChange={e => setAccreditation(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus Postal Address
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Controller of Examinations (Signatory)
              </label>
              <input
                type="text"
                value={controllerOfExams}
                onChange={e => setControllerOfExams(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Institutional Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Grading Scale Rules */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              10-Point Grading Scale & Grade Point Boundaries
            </h2>
            <p className="text-xs text-slate-500">
              These rules dynamically determine the letter grade and SGPA weighting for all student marks.
            </p>
          </div>
          <button
            onClick={handleSaveRules}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Apply Grading Scale</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                <th className="py-2.5 px-4 w-20">Letter Grade</th>
                <th className="py-2.5 px-3 w-32">Min Percentage (%)</th>
                <th className="py-2.5 px-3 w-32">Max Percentage (%)</th>
                <th className="py-2.5 px-3 w-28">Grade Point (0-10)</th>
                <th className="py-2.5 px-4">Classification Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {localRules.map((rule, idx) => (
                <tr key={rule.ruleId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                  <td className="py-2.5 px-4 font-bold text-slate-900 font-sans">{rule.grade}</td>
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      value={rule.minPercentage}
                      onChange={e => handleRuleChange(idx, 'minPercentage', e.target.value)}
                      className="w-20 px-2 py-1 text-xs border border-slate-300 rounded font-bold"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      value={rule.maxPercentage}
                      onChange={e => handleRuleChange(idx, 'maxPercentage', e.target.value)}
                      className="w-20 px-2 py-1 text-xs border border-slate-300 rounded font-bold"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      value={rule.gradePoint}
                      onChange={e => handleRuleChange(idx, 'gradePoint', e.target.value)}
                      className="w-16 px-2 py-1 text-xs border border-slate-300 rounded font-bold text-blue-700"
                    />
                  </td>
                  <td className="py-2.5 px-4 font-sans">
                    <input
                      type="text"
                      value={rule.description}
                      onChange={e => handleRuleChange(idx, 'description', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Management Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Sample Database Seeding & Reset
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Seed Cloud Firestore and local storage with realistic sample college records including 4 departments, 8 students, curriculum subjects, and multi-semester examination marks.
            </p>
          </div>
          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Database to Sample Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
