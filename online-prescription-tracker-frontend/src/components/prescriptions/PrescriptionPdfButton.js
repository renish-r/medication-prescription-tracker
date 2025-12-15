// src/components/prescriptions/PrescriptionPdfButton.js
import React from "react";
import jsPDF from "jspdf";

function PrescriptionPdfButton({ prescription }) {
  const handleDownload = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Online Medication & Prescription Tracker", 10, 15);
    doc.setFontSize(12);
    doc.text(`Prescription ID: ${prescription.id}`, 10, 30);
    doc.text(`Patient: ${prescription.patientUsername}`, 10, 38);
    doc.text(`Doctor: ${prescription.doctorUsername}`, 10, 46);

    doc.text(`Medication: ${prescription.medicationName}`, 10, 60);
    doc.text(`Dosage: ${prescription.dosage}`, 10, 68);
    doc.text(`Frequency: ${prescription.frequency}`, 10, 76);
    doc.text(`Duration (days): ${prescription.durationDays}`, 10, 84);

    if (prescription.instructions) {
      doc.text("Instructions:", 10, 100);
      doc.text(doc.splitTextToSize(prescription.instructions, 180), 10, 108);
    }

    doc.text(`Status: ${prescription.status}`, 10, 140);
    doc.text(`Issue Date: ${prescription.issueDate || ""}`, 10, 148);
    doc.text(`Expiry Date: ${prescription.expiryDate || ""}`, 10, 156);

    doc.save(`prescription_${prescription.id}.pdf`);
  };

  return (
    <button type="button" className="link-button" onClick={handleDownload}>
      Download PDF
    </button>
  );
}

export default PrescriptionPdfButton;
