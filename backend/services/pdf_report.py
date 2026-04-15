# PDF report generation using fpdf2
import io
import logging
from datetime import datetime

from fpdf import FPDF

log = logging.getLogger(__name__)


class ComplianceReport(FPDF):
    """Custom PDF class for compliance reports."""

    def header(self):
        self.set_font("Helvetica", "B", 14)
        self.cell(0, 10, "EHS Compliance Report", align="C", ln=True)
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")


def generate_report(
    submission: dict,
    approval: dict,
    checklist: list[dict],
    photos: dict[str, bytes],
    compliance_gaps: list[dict],
) -> bytes:
    """Generate PDF compliance report in memory."""
    pdf = ComplianceReport()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Permit Details Section
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Permit Details", ln=True)
    pdf.set_font("Helvetica", "", 10)

    details = [
        ("Operation Type", approval.get("operation_type", "")),
        ("Site Name", approval.get("site_name", "")),
        ("Planned Start", str(approval.get("planned_start", ""))),
        ("Planned End", str(approval.get("planned_end", ""))),
        ("Risk Score", f"{approval.get('risk_score', 'N/A')} ({approval.get('risk_colour', '')})"),
        ("Status", approval.get("status", "")),
    ]
    for label, value in details:
        pdf.cell(50, 6, f"{label}:", ln=False)
        pdf.cell(0, 6, str(value), ln=True)

    pdf.ln(5)

    # Approval Record Section
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Approval Record", ln=True)
    pdf.set_font("Helvetica", "", 10)

    approval_details = [
        ("Reviewer Notes", approval.get("reviewer_notes", "N/A")),
        ("Approved At", str(approval.get("updated_at", ""))),
    ]
    for label, value in approval_details:
        pdf.cell(50, 6, f"{label}:", ln=False)
        pdf.cell(0, 6, str(value), ln=True)

    pdf.ln(5)

    # Checklist Section
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Completed Checklist", ln=True)
    pdf.set_font("Helvetica", "", 10)

    for i, step in enumerate(checklist, 1):
        status = "Done" if step.get("completed", False) else "Incomplete"
        pdf.cell(0, 6, f"{i}. {step.get('label', 'Step')} - {status}", ln=True)
        if step.get("regulation_ref"):
            pdf.set_font("Helvetica", "I", 9)
            pdf.cell(0, 5, f"   Ref: {step.get('regulation_ref')}", ln=True)
            pdf.set_font("Helvetica", "", 10)

    pdf.ln(5)

    # Photo Evidence Section
    if photos:
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, "Photo Evidence", ln=True)

        for step_label, photo_bytes in photos.items():
            try:
                # Create in-memory image
                img_stream = io.BytesIO(photo_bytes)
                pdf.set_font("Helvetica", "I", 9)
                pdf.cell(0, 5, f"Photo for: {step_label}", ln=True)

                # Add image with max width 150
                pdf.image(img_stream, w=100)
                pdf.ln(3)
            except Exception as e:
                log.warning("Failed to embed photo for %s: %s", step_label, e)
                pdf.set_font("Helvetica", "I", 9)
                pdf.cell(0, 5, f"[Photo for {step_label} could not be embedded]", ln=True)

        pdf.ln(5)

    # AI Compliance Notes Section
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "AI Compliance Notes", ln=True)
    pdf.set_font("Helvetica", "", 10)

    if compliance_gaps:
        for gap in compliance_gaps:
            pdf.set_text_color(180, 0, 0)
            pdf.multi_cell(0, 6, f"- {gap.get('step', 'Unknown')}: {gap.get('regulation', '')}")
            pdf.set_text_color(0, 0, 0)
    else:
        pdf.set_text_color(0, 128, 0)
        pdf.cell(0, 6, "No compliance gaps detected.", ln=True)
        pdf.set_text_color(0, 0, 0)

    pdf.ln(5)

    # Submission Info
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Submission Information", ln=True)
    pdf.set_font("Helvetica", "", 10)

    pdf.cell(50, 6, "Submitted At:", ln=False)
    pdf.cell(0, 6, str(submission.get("submitted_at", datetime.now())), ln=True)
    pdf.cell(50, 6, "Compliance Status:", ln=False)
    pdf.cell(0, 6, submission.get("compliance_status", ""), ln=True)
    if submission.get("notes"):
        pdf.cell(50, 6, "Notes:", ln=False)
        pdf.multi_cell(0, 6, submission.get("notes", ""))

    # Output to bytes
    return pdf.output()
