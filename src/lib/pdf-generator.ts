import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  id: string;
  generationDate: string;
  score: number;
  grade: string;
  factors?: {
    billPaymentHistory: number;
    incomeConsistency: number;
    expenseManagement: number;
    financialGrowth: number;
    transactionDiversity: number;
  };
  transactionCount?: number;
  periodStart?: string;
  periodEnd?: string;
}

/**
 * Generate a professional PDF credit report using jsPDF
 */
export async function generateProfessionalPDF(reportData: ReportData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // Color scheme
  const colors = {
    primary: [41, 128, 185] as [number, number, number], // Blue
    success: [39, 174, 96] as [number, number, number], // Green
    warning: [243, 156, 18] as [number, number, number], // Orange
    danger: [231, 76, 60] as [number, number, number], // Red
    gray: [127, 140, 141] as [number, number, number],
    lightGray: [236, 240, 241] as [number, number, number],
  };

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Helper function to get grade color
  const getGradeColor = (grade: string): [number, number, number] => {
    switch (grade) {
      case 'A': return colors.success;
      case 'B': return colors.primary;
      case 'C': return colors.warning;
      case 'D': return colors.danger;
      default: return colors.gray;
    }
  };

  // Helper function to get score description
  const getScoreDescription = (score: number): string => {
    if (score >= 800) return 'Excellent - Very Low Risk';
    if (score >= 700) return 'Good - Low Risk';
    if (score >= 600) return 'Fair - Moderate Risk';
    if (score >= 500) return 'Needs Improvement - Higher Risk';
    return 'Poor - High Risk';
  };

  // ========== PAGE 1: COVER PAGE ==========
  
  // Header box
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('CREDIT SCORE REPORT', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Alternative Credit Analysis for Informal Economy', pageWidth / 2, 45, { align: 'center' });

  yPos = 80;

  // Score display box
  const scoreBoxY = yPos;
  const scoreBoxHeight = 70;
  doc.setFillColor(...colors.lightGray);
  doc.roundedRect(margin, scoreBoxY, contentWidth, scoreBoxHeight, 5, 5, 'F');

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('YOUR CREDIT SCORE', pageWidth / 2, scoreBoxY + 15, { align: 'center' });

  // Large score
  doc.setFontSize(60);
  const gradeColor = getGradeColor(reportData.grade);
  doc.setTextColor(...gradeColor);
  doc.text(String(reportData.score), pageWidth / 2, scoreBoxY + 45, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(...colors.gray);
  doc.text('out of 1000', pageWidth / 2, scoreBoxY + 55, { align: 'center' });

  // Grade badge
  doc.setFontSize(20);
  doc.setTextColor(...gradeColor);
  doc.text(`Grade ${reportData.grade}`, pageWidth / 2, scoreBoxY + 68, { align: 'center' });

  yPos = scoreBoxY + scoreBoxHeight + 15;

  // Score description
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  const description = getScoreDescription(reportData.score);
  doc.text(description, pageWidth / 2, yPos, { align: 'center' });

  yPos += 30;

  // Report details
  doc.setFontSize(11);
  doc.setTextColor(...colors.gray);
  const reportDate = new Date(reportData.generationDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  doc.text(`Report ID: ${reportData.id}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 7;
  doc.text(`Generated: ${reportDate}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 7;
  doc.text(`Valid Until: ${new Date(new Date(reportData.generationDate).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, yPos, { align: 'center' });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(...colors.gray);
  doc.text('CreditWise - Alternative Credit Scoring', pageWidth / 2, pageHeight - 20, { align: 'center' });
  doc.text('www.creditwise.app', pageWidth / 2, pageHeight - 15, { align: 'center' });

  // ========== PAGE 2: EXECUTIVE SUMMARY ==========
  doc.addPage();
  yPos = margin;

  // Section header
  doc.setFillColor(...colors.primary);
  doc.rect(margin, yPos, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE SUMMARY', margin + 5, yPos + 8);

  yPos += 20;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  const summaryText = `This report analyzes your alternative credit profile based on ${reportData.transactionCount || 0} transactions over the period from ${reportData.periodStart ? new Date(reportData.periodStart).toLocaleDateString() : 'N/A'} to ${reportData.periodEnd ? new Date(reportData.periodEnd).toLocaleDateString() : 'N/A'}.

Your credit score of ${reportData.score} places you in the "${getScoreDescription(reportData.score)}" category. This alternative credit score is specifically designed for individuals in the informal economy who may not have traditional credit products like credit cards or bank loans.

The score is calculated using five key factors that reflect your financial behavior and business health, with varying weights based on their importance in assessing creditworthiness.`;

  const splitText = doc.splitTextToSize(summaryText, contentWidth);
  doc.text(splitText, margin, yPos);
  yPos += splitText.length * 6 + 10;

  // Transaction analysis box
  checkPageBreak(40);
  doc.setFillColor(...colors.lightGray);
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text('Transaction Analysis Summary', margin + 5, yPos + 8);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`Total Transactions: ${reportData.transactionCount || 0}`, margin + 5, yPos + 17);
  doc.text(`Period Start: ${reportData.periodStart ? new Date(reportData.periodStart).toLocaleDateString() : 'N/A'}`, margin + 5, yPos + 24);
  doc.text(`Period End: ${reportData.periodEnd ? new Date(reportData.periodEnd).toLocaleDateString() : 'N/A'}`, margin + 5, yPos + 31);

  yPos += 45;

  // ========== PAGE 3: CREDIT FACTORS BREAKDOWN ==========
  doc.addPage();
  yPos = margin;

  // Section header
  doc.setFillColor(...colors.primary);
  doc.rect(margin, yPos, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CREDIT FACTORS BREAKDOWN', margin + 5, yPos + 8);

  yPos += 20;

  if (reportData.factors) {
    // Factors table
    const factorsData = [
      ['Bill Payment History', '30%', `${reportData.factors.billPaymentHistory}/100`, reportData.factors.billPaymentHistory >= 80 ? 'Excellent' : reportData.factors.billPaymentHistory >= 60 ? 'Good' : reportData.factors.billPaymentHistory >= 40 ? 'Fair' : 'Needs Work'],
      ['Income Consistency', '25%', `${reportData.factors.incomeConsistency}/100`, reportData.factors.incomeConsistency >= 80 ? 'Excellent' : reportData.factors.incomeConsistency >= 60 ? 'Good' : reportData.factors.incomeConsistency >= 40 ? 'Fair' : 'Needs Work'],
      ['Expense Management', '20%', `${reportData.factors.expenseManagement}/100`, reportData.factors.expenseManagement >= 80 ? 'Excellent' : reportData.factors.expenseManagement >= 60 ? 'Good' : reportData.factors.expenseManagement >= 40 ? 'Fair' : 'Needs Work'],
      ['Financial Growth', '15%', `${reportData.factors.financialGrowth}/100`, reportData.factors.financialGrowth >= 80 ? 'Excellent' : reportData.factors.financialGrowth >= 60 ? 'Good' : reportData.factors.financialGrowth >= 40 ? 'Fair' : 'Needs Work'],
      ['Transaction Diversity', '10%', `${reportData.factors.transactionDiversity}/100`, reportData.factors.transactionDiversity >= 80 ? 'Excellent' : reportData.factors.transactionDiversity >= 60 ? 'Good' : reportData.factors.transactionDiversity >= 40 ? 'Fair' : 'Needs Work'],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Factor', 'Weight', 'Score', 'Status']],
      body: factorsData,
      theme: 'striped',
      headStyles: {
        fillColor: colors.primary,
        fontSize: 11,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 35, halign: 'center' },
        3: { cellWidth: 35, halign: 'center' },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Score calculation
    checkPageBreak(50);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.primary);
    doc.text('Score Calculation:', margin, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const calculations = [
      `Bill Payment: ${reportData.factors.billPaymentHistory}/100 × 30% = ${(reportData.factors.billPaymentHistory * 0.30).toFixed(1)} points`,
      `Income Consistency: ${reportData.factors.incomeConsistency}/100 × 25% = ${(reportData.factors.incomeConsistency * 0.25).toFixed(1)} points`,
      `Expense Management: ${reportData.factors.expenseManagement}/100 × 20% = ${(reportData.factors.expenseManagement * 0.20).toFixed(1)} points`,
      `Financial Growth: ${reportData.factors.financialGrowth}/100 × 15% = ${(reportData.factors.financialGrowth * 0.15).toFixed(1)} points`,
      `Transaction Diversity: ${reportData.factors.transactionDiversity}/100 × 10% = ${(reportData.factors.transactionDiversity * 0.10).toFixed(1)} points`,
    ];

    calculations.forEach((calc) => {
      doc.text(calc, margin, yPos);
      yPos += 6;
    });

    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Weighted Score: ${reportData.score}/1000 points`, margin, yPos);
  }

  // ========== PAGE 4: RECOMMENDATIONS ==========
  doc.addPage();
  yPos = margin;

  doc.setFillColor(...colors.primary);
  doc.rect(margin, yPos, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PERSONALIZED RECOMMENDATIONS', margin + 5, yPos + 8);

  yPos += 20;

  // Generate recommendations based on scores
  const recommendations = [];
  if (reportData.factors) {
    if (reportData.factors.billPaymentHistory < 70) {
      recommendations.push({
        priority: 'HIGH',
        area: 'Bill Payment Improvement',
        score: reportData.factors.billPaymentHistory,
        actions: [
          'Set up automatic payments for recurring bills',
          'Create payment reminders 3 days before due dates',
          'Maintain a buffer fund for unexpected expenses',
        ],
        impact: '+50-100 points in 3-6 months',
      });
    }

    if (reportData.factors.incomeConsistency < 70) {
      recommendations.push({
        priority: 'HIGH',
        area: 'Income Stabilization',
        score: reportData.factors.incomeConsistency,
        actions: [
          'Diversify customer base',
          'Establish recurring revenue contracts',
          'Build 3-month emergency fund',
        ],
        impact: '+40-80 points in 6 months',
      });
    }

    if (reportData.factors.expenseManagement < 70) {
      recommendations.push({
        priority: 'MEDIUM',
        area: 'Expense Control',
        score: reportData.factors.expenseManagement,
        actions: [
          'Aim to save 20% of monthly income',
          'Reduce discretionary expenses',
          'Implement expense tracking system',
        ],
        impact: '+30-60 points in 4-6 months',
      });
    }
  }

  if (recommendations.length === 0) {
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text('Excellent! Your credit profile is strong across all factors.', margin, yPos);
    yPos += 7;
    doc.text('Continue current financial practices to maintain your score.', margin, yPos);
  } else {
    recommendations.forEach((rec, index) => {
      checkPageBreak(50);
      
      // Priority badge
      const priorityColor = rec.priority === 'HIGH' ? colors.danger : rec.priority === 'MEDIUM' ? colors.warning : colors.primary;
      doc.setFillColor(...priorityColor);
      doc.roundedRect(margin, yPos, 25, 7, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(rec.priority, margin + 12.5, yPos + 5, { align: 'center' });

      // Area title
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(rec.area, margin + 30, yPos + 5);

      yPos += 12;

      // Current score
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Current Score: ${rec.score}/100`, margin, yPos);

      yPos += 8;

      // Action steps
      doc.setFont('helvetica', 'bold');
      doc.text('Action Steps:', margin, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      rec.actions.forEach((action) => {
        doc.text(`• ${action}`, margin + 5, yPos);
        yPos += 6;
      });

      yPos += 2;

      // Expected impact
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.primary);
      doc.text(`Expected Impact: ${rec.impact}`, margin, yPos);

      yPos += 15;
    });
  }

  // ========== PAGE 5: GRADE INTERPRETATION ==========
  doc.addPage();
  yPos = margin;

  doc.setFillColor(...colors.primary);
  doc.rect(margin, yPos, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CREDIT GRADE INTERPRETATION', margin + 5, yPos + 8);

  yPos += 20;

  const grades = [
    { grade: 'A', range: '800-1000', desc: 'Excellent - Very Low Risk', details: 'Qualifies for best lending terms, preferred customer status' },
    { grade: 'B+', range: '700-799', desc: 'Good - Low Risk', details: 'Good lending terms available, favorable interest rates' },
    { grade: 'B', range: '600-699', desc: 'Fair - Moderate Risk', details: 'Standard lending terms, may require additional documentation' },
    { grade: 'C', range: '500-599', desc: 'Needs Improvement', details: 'Limited lending options, higher interest rates' },
    { grade: 'D', range: 'Below 500', desc: 'Poor - High Risk', details: 'Very limited options, secured loans may be required' },
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Grade', 'Score Range', 'Description', 'Details']],
    body: grades.map(g => [g.grade, g.range, g.desc, g.details]),
    theme: 'grid',
    headStyles: {
      fillColor: colors.primary,
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 50 },
      3: { cellWidth: 70 },
    },
  });

  // ========== FINAL PAGE: DISCLAIMER ==========
  doc.addPage();
  yPos = margin;

  doc.setFillColor(...colors.warning);
  doc.rect(margin, yPos, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPORTANT DISCLAIMER', margin + 5, yPos + 8);

  yPos += 20;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('This is NOT a traditional FICO or credit bureau score.', margin, yPos);

  yPos += 10;

  doc.setFont('helvetica', 'normal');
  const disclaimerText = `This Alternative Credit Score is designed specifically for individuals in the informal economy who lack traditional credit products (credit cards, bank loans, mortgages).

The score evaluates financial behavior through alternative data sources including bill payments, income patterns, and transaction history rather than traditional credit products.

This report does not guarantee loan approval and is not a substitute for traditional credit checks where applicable. It should be used as a supplementary assessment tool alongside other due diligence measures.

Report valid for 90 days from generation date.`;

  const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth);
  doc.text(disclaimerLines, margin, yPos);

  yPos += disclaimerLines.length * 6 + 20;

  // Contact information
  checkPageBreak(30);
  doc.setFillColor(...colors.lightGray);
  doc.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text('Contact Information', margin + 5, yPos + 8);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('CreditWise - Alternative Credit Scoring Platform', margin + 5, yPos + 15);
  doc.text('Email: support@creditwise.app', margin + 5, yPos + 21);
  doc.text('Website: www.creditwise.app', margin + 5, yPos + 27);

  // Convert to buffer
  const pdfArrayBuffer = doc.output('arraybuffer');
  return Buffer.from(pdfArrayBuffer);
}
