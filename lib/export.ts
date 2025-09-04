import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";

/**
 * Export cover letter as PDF
 */
export async function exportToPDF(
  coverLetter: string,
  filename: string = "cover-letter.pdf"
) {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Set fonts and sizes
    pdf.setFont("helvetica");
    pdf.setFontSize(11);

    // Add date
    const date = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    pdf.text(date, 20, 20);

    // Add greeting
    pdf.text("Hiring Manager", 20, 30);

    // Split cover letter into lines for PDF
    const lines = pdf.splitTextToSize(coverLetter, 170);

    // Add body text
    let yPosition = 45;
    lines.forEach((line: string) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, 20, yPosition);
      yPosition += 6;
    });

    // Add closing
    pdf.text("Sincerely,", 20, yPosition + 10);
    pdf.text("[Your Name]", 20, yPosition + 20);

    // Save the PDF
    pdf.save(filename);

    return { success: true };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return { success: false, error };
  }
}

/**
 * Export cover letter as Word document
 */
export async function exportToWord(
  coverLetter: string,
  filename: string = "cover-letter.docx"
) {
  try {
    // Split cover letter into paragraphs
    const paragraphs = coverLetter.split("\n").filter((p) => p.trim());

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Date
            new Paragraph({
              children: [
                new TextRun({
                  text: new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }),
                  size: 22,
                  color: "666666",
                }),
              ],
              spacing: { after: 200 },
            }),

            // Greeting
            new Paragraph({
              children: [
                new TextRun({
                  text: "Hiring Manager",
                  size: 24,
                  bold: true,
                }),
              ],
              spacing: { after: 400 },
            }),

            // Body paragraphs
            ...paragraphs.map((paragraph) => {
              return new Paragraph({
                children: [
                  new TextRun({
                    text: paragraph,
                    size: 24,
                  }),
                ],
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 240 },
                indent: { firstLine: 360 },
              });
            }),

            // Signature
            new Paragraph({
              children: [
                new TextRun({
                  text: "Sincerely,",
                  size: 24,
                }),
              ],
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "[Your Name]",
                  size: 24,
                  color: "666666",
                }),
              ],
            }),
          ],
        },
      ],
    });

    // Generate and save
    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);

    return { success: true };
  } catch (error) {
    console.error("Error generating Word document:", error);
    return { success: false, error };
  }
}

/**
 * Export as plain text
 */
export function exportToText(
  coverLetter: string,
  filename: string = "cover-letter.txt"
) {
  try {
    const date = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const fullLetter = `${date}\n\nHiring Manager\n\n${coverLetter}\n\nSincerely,\n[Your Name]`;

    const blob = new Blob([fullLetter], { type: "text/plain;charset=utf-8" });
    saveAs(blob, filename);

    return { success: true };
  } catch (error) {
    console.error("Error generating text file:", error);
    return { success: false, error };
  }
}
