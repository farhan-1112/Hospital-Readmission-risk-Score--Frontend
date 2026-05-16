import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const downloadReport = async (elementId, filename = 'Readmission_Risk_Report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    // Temporarily hide elements we don't want in the PDF
    const excludeElements = element.querySelectorAll('.no-pdf');
    excludeElements.forEach(el => el.style.display = 'none');

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#000000', // Match theme
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);

    // Restore hidden elements
    excludeElements.forEach(el => el.style.display = '');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

export const generateClinicalPDF = (patientData, resultData, treatmentPlan, summary) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Set dark theme colors for the PDF (optional, let's keep it clean/white for printing)
  const primaryColor = [168, 85, 247]; // #A855F7
  const textColor = [40, 40, 40];
  const mutedColor = [100, 100, 100];

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('HOSPITAL READMISSION RISK REPORT', 15, 13);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString(), pageWidth - 40, 13);

  // Patient Info Section
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT INFORMATION', 15, 30);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.line(15, 32, 60, 32);

  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${patientData.patient_name || 'N/A'}`, 15, 40);
  doc.text(`Age: ${patientData.age}`, 15, 45);
  doc.text(`Gender: ${patientData.gender}`, 15, 50);
  doc.text(`Attending Physician: ${patientData.doctor_name || 'N/A'}`, 15, 55);

  // Risk Score Section
  const score = Math.round(resultData.risk_score * 100);
  const riskLevel = resultData.risk_level;
  
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RISK ASSESSMENT', 110, 30);
  doc.line(110, 32, 150, 32);

  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(22);
  doc.text(`${score}%`, 110, 45);
  doc.setFontSize(10);
  doc.text(`Risk Level: ${riskLevel}`, 110, 52);

  // Clinical Summary
  let yPos = 70;
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CLINICAL SUMMARY', 15, yPos);
  doc.line(15, yPos + 2, 60, yPos + 2);
  
  yPos += 10;
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const splitSummary = doc.splitTextToSize(summary || 'No summary available.', pageWidth - 30);
  doc.text(splitSummary, 15, yPos);
  yPos += (splitSummary.length * 5) + 10;

  // Treatment Plan
  if (treatmentPlan) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TREATMENT PLAN', 15, yPos);
    doc.line(15, yPos + 2, 60, yPos + 2);
    
    yPos += 10;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Simple markdown-ish parsing for PDF (just lines and basic wrap)
    const planText = treatmentPlan.replace(/[#*]/g, ''); // Clean markdown chars for simple view
    const splitPlan = doc.splitTextToSize(planText, pageWidth - 30);
    
    // Handle pagination for long treatment plans
    for (let i = 0; i < splitPlan.length; i++) {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(splitPlan[i], 15, yPos);
      yPos += 5;
    }
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.setFontSize(8);
    doc.text('Confidential - Clinical Decision Support Tool', 15, 290);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, 290);
  }

  doc.save(`${patientData.patient_name || 'Patient'}_Risk_Report.pdf`);
};
