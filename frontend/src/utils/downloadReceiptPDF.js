


import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";



const downloadReceiptPDF = ({
  schoolName,
  receiptNumber,
  studentName,
  studentID,
  amountPaid,
  paymentDate,
  paymentMode,
  remarks,
}) => {
  const doc = new jsPDF();

  let formattedAmount = 0;

if (typeof amountPaid === "number") {
  formattedAmount = amountPaid;
} else if (typeof amountPaid === "string") {
  formattedAmount = Number(amountPaid.replace(/[^0-9]/g, "")) || 0;
}




  // ================= SCHOOL HEADER =================
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
doc.text(schoolName || "School Name", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
 

  // Line
  doc.setDrawColor(180);
  doc.line(20, 30, 190, 30);

  // ================= RECEIPT TITLE =================
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("School Fee Receipt", 105, 40, { align: "center" });

  // ================= META INFO =================
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  doc.text(`Receipt No: ${receiptNumber || "N/A"}`, 20, 50);
  doc.text(
    `Date: ${
      paymentDate
        ? new Date(paymentDate).toLocaleDateString("en-GB")
        : "N/A"
    }`,
    150,
    50
  );

  // ================= STUDENT INFO BOX =================
  doc.setDrawColor(200);
  doc.rect(20, 58, 170, 45);

  doc.setFont("helvetica", "bold");
  doc.text("Student Name:", 25, 70);
  doc.text("Student ID:", 25, 80);
  doc.text("Payment Mode:", 25, 90);

  doc.setFont("helvetica", "normal");
  doc.text(studentName || "N/A", 80, 70);
  doc.text(studentID || "N/A", 80, 80);
  doc.text(paymentMode || "N/A", 80, 90);



  autoTable(doc, {
  startY: 110,
  head: [["Description", "Amount"]],
  body: [
    ["School Fee Payment", `Rs. ${formattedAmount}`],
  ],
  styles: {
    fontSize: 11,
  },
  headStyles: {
    fillColor: [240, 240, 240],
    textColor: 0,
    fontStyle: "bold",
  },
  theme: "grid",
});


  // ================= TOTAL =================
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text(`Total Amount Paid: Rs. ${amountPaid || 0}`, 140, finalY);

  // ================= REMARKS =================
  if (remarks) {
    doc.setFont("helvetica", "normal");
    doc.text("Remarks:", 20, finalY + 10);
    doc.text(remarks, 20, finalY + 18);
  }

  // ================= FOOTER =================
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    "This is a system generated receipt. No signature required.",
    105,
    285,
    { align: "center" }
  );

  // ================= SAVE =================
  doc.save(`Receipt_${receiptNumber || "School"}.pdf`);
};

export default downloadReceiptPDF;
