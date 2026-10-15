import { jsPDF } from 'jspdf';
import { SemesterResultSummary, CollegeSettings } from '../types';

export function generateMarksheetPDF(
  summary: SemesterResultSummary,
  settings: CollegeSettings
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Top header background
  doc.setFillColor(15, 34, 64); // Dark Navy Blue
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Institution title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(settings.collegeName.toUpperCase(), pageWidth / 2, 11, { align: 'center' });

  // Affiliation & Code
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`${settings.affiliation} | College Code: ${settings.collegeCode}`, pageWidth / 2, 17, { align: 'center' });
  doc.text(settings.accreditation, pageWidth / 2, 22, { align: 'center' });

  // Document Title Banner
  doc.setFillColor(241, 245, 249);
  doc.rect(14, 32, pageWidth - 28, 10, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, 32, pageWidth - 28, 10, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('OFFICIAL GRADE SHEET / STATEMENT OF MARKS', pageWidth / 2, 38.5, { align: 'center' });

  // Student Details Box
  const startY = 46;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, startY, pageWidth - 28, 30, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');

  // Left column
  doc.text('Register Number:', 18, startY + 6);
  doc.text('Student Name:', 18, startY + 13);
  doc.text('Degree & Branch:', 18, startY + 20);
  doc.text('Semester & Year:', 18, startY + 27);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(summary.student.registerNumber, 55, startY + 6);
  doc.text(summary.student.name.toUpperCase(), 55, startY + 13);
  doc.text(summary.student.course, 55, startY + 20);
  doc.text(`Semester ${summary.student.currentSemester} (${summary.student.academicYear})`, 55, startY + 27);

  // Right column
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('Examination:', 115, startY + 6);
  doc.text('Session Date:', 115, startY + 13);
  doc.text('Result Status:', 115, startY + 20);
  doc.text('Issue Date:', 115, startY + 27);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  const examTitle = summary.examination.title.length > 32 
    ? summary.examination.title.substring(0, 32) + '...' 
    : summary.examination.title;
  doc.text(examTitle, 142, startY + 6);
  doc.text(summary.examination.examDate, 142, startY + 13);

  // Status color
  if (summary.overallStatus === 'PASS') {
    doc.setTextColor(22, 101, 52); // green
  } else if (summary.overallStatus === 'WITHHELD') {
    doc.setTextColor(161, 98, 7); // amber
  } else {
    doc.setTextColor(185, 28, 28); // red
  }
  doc.setFont('helvetica', 'bold');
  doc.text(summary.overallStatus, 142, startY + 20);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('en-GB'), 142, startY + 27);

  // Table of Marks
  const tableStartY = startY + 36;
  const colX = {
    sl: 16,
    code: 28,
    name: 52,
    credits: 116,
    internal: 130,
    external: 144,
    total: 158,
    grade: 172,
    result: 184,
  };

  // Table Header
  doc.setFillColor(30, 58, 138); // Blue 900
  doc.rect(14, tableStartY, pageWidth - 28, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('#', colX.sl, tableStartY + 5.5);
  doc.text('Course Code', colX.code, tableStartY + 5.5);
  doc.text('Course Title', colX.name, tableStartY + 5.5);
  doc.text('Credits', colX.credits, tableStartY + 5.5);
  doc.text('Internal', colX.internal, tableStartY + 5.5);
  doc.text('External', colX.external, tableStartY + 5.5);
  doc.text('Total', colX.total, tableStartY + 5.5);
  doc.text('Grade', colX.grade, tableStartY + 5.5);
  doc.text('Result', colX.result, tableStartY + 5.5);

  let curY = tableStartY + 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  summary.marks.forEach((mark, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, curY, pageWidth - 28, 7, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(14, curY + 7, pageWidth - 14, curY + 7);

    doc.setTextColor(71, 85, 105);
    doc.text((index + 1).toString(), colX.sl, curY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(mark.subjectCode, colX.code, curY + 5);

    doc.setFont('helvetica', 'normal');
    const truncatedName = mark.subjectName.length > 34
      ? mark.subjectName.substring(0, 32) + '...'
      : mark.subjectName;
    doc.text(truncatedName, colX.name, curY + 5);

    // Subject credits fallback
    doc.text('3', colX.credits + 2, curY + 5);
    doc.text(mark.isAbsent ? 'AB' : mark.internalMarks.toString(), colX.internal + 2, curY + 5);
    doc.text(mark.isAbsent ? 'AB' : mark.externalMarks.toString(), colX.external + 2, curY + 5);
    doc.text(mark.isAbsent ? '0' : mark.totalMarks.toString(), colX.total + 2, curY + 5);

    doc.setFont('helvetica', 'bold');
    doc.text(mark.grade, colX.grade + 1, curY + 5);

    if (mark.isPassed) {
      doc.setTextColor(22, 101, 52);
      doc.text('PASS', colX.result, curY + 5);
    } else if (mark.isWithheld) {
      doc.setTextColor(161, 98, 7);
      doc.text('WTH', colX.result, curY + 5);
    } else {
      doc.setTextColor(185, 28, 28);
      doc.text('FAIL', colX.result, curY + 5);
    }

    curY += 7;
  });

  // Table summary box
  curY += 4;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, curY, pageWidth - 28, 20, 1.5, 1.5, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');

  doc.text(`Total Credits Registered: ${summary.totalCredits}`, 20, curY + 7);
  doc.text(`Total Credits Earned: ${summary.earnedCredits}`, 20, curY + 14);

  doc.text(`Total Marks: ${summary.totalMarksScored} / ${summary.maximumMarksTotal}`, 85, curY + 7);
  doc.text(`Overall Percentage: ${summary.percentage.toFixed(2)}%`, 85, curY + 14);

  doc.text(`Semester GPA (SGPA):`, 148, curY + 7);
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text(`${summary.sgpa.toFixed(2)}`, 185, curY + 7);

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Final Result:`, 148, curY + 14);

  if (summary.overallStatus === 'PASS') {
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(10);
    doc.text('PASS', 185, curY + 14);
  } else {
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(10);
    doc.text(summary.overallStatus, 185, curY + 14);
  }

  // Grading scheme legend
  curY += 26;
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Grading Scale: O (90-100%, GP 10) | A+ (80-89%, GP 9) | A (70-79%, GP 8) | B+ (60-69%, GP 7) | B (50-59%, GP 6) | C (45-49%, GP 5) | RA: Re-Appearance | AB: Absent | WH: Withheld',
    pageWidth / 2,
    curY,
    { align: 'center' }
  );

  // Signatures section
  const sigY = curY + 28;
  doc.setDrawColor(148, 163, 184);
  doc.line(20, sigY, 65, sigY);
  doc.line(85, sigY, 125, sigY);
  doc.line(145, sigY, 190, sigY);

  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('Prepared & Verified By', 42.5, sigY + 5, { align: 'center' });
  doc.text('Head of Department', 105, sigY + 5, { align: 'center' });
  doc.text('Controller of Examinations', 167.5, sigY + 5, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(settings.controllerOfExams, 167.5, sigY + 9, { align: 'center' });

  // Security Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Official Digitally Generated Grade Card | Reference: ${summary.student.registerNumber}-${summary.examination.examinationId} | Generated on ${new Date().toLocaleString()}`,
    pageWidth / 2,
    288,
    { align: 'center' }
  );

  // Save PDF file
  const filename = `Marksheet_${summary.student.registerNumber}_Sem${summary.student.currentSemester}.pdf`;
  doc.save(filename);
}
