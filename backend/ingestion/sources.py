# Source metadata mapping for PDFs
# Maps filename to source_org, title, pillar, regulation_ref, doc_type
# doc_type: regulation, guideline, manual, sop, quick_card

SOURCES: dict[str, dict] = {
    # OSHA documents
    "osha_1910_119_psm.pdf": {
        "source_org": "OSHA",
        "title": "Process Safety Management of Highly Hazardous Chemicals",
        "pillar": "safety",
        "regulation_ref": "29 CFR 1910.119",
        "doc_type": "regulation",
    },
    "osha_1910_1200_hazcom_cfr.pdf": {
        "source_org": "OSHA",
        "title": "Hazard Communication Standard (CFR)",
        "pillar": "health",
        "regulation_ref": "29 CFR 1910.1200",
        "doc_type": "regulation",
    },
    "osha_1910_1200_hazcom_compliance.pdf": {
        "source_org": "OSHA",
        "title": "Hazard Communication Compliance Guide",
        "pillar": "health",
        "regulation_ref": "29 CFR 1910.1200",
        "doc_type": "guideline",
    },
    "osha_1910_146_confined_spaces.pdf": {
        "source_org": "OSHA",
        "title": "Permit-Required Confined Spaces",
        "pillar": "safety",
        "regulation_ref": "29 CFR 1910.146",
        "doc_type": "regulation",
    },
    "osha_confined_space_quick_card.pdf": {
        "source_org": "OSHA",
        "title": "Confined Space Entry Quick Card",
        "pillar": "safety",
        "regulation_ref": "29 CFR 1910.146",
        "doc_type": "quick_card",
    },
    "osha_laboratory_safety_3404.pdf": {
        "source_org": "OSHA",
        "title": "Laboratory Safety Guidance",
        "pillar": "health",
        "regulation_ref": "OSHA 3404",
        "doc_type": "guideline",
    },
    "osha_psm_refineries_3918.pdf": {
        "source_org": "OSHA",
        "title": "PSM Guidelines for Refineries",
        "pillar": "safety",
        "regulation_ref": "OSHA 3918",
        "doc_type": "guideline",
    },
    "osha_psm_small_business_3908.pdf": {
        "source_org": "OSHA",
        "title": "PSM for Small Businesses",
        "pillar": "safety",
        "regulation_ref": "OSHA 3908",
        "doc_type": "guideline",
    },
    "osha_small_business_handbook.pdf": {
        "source_org": "OSHA",
        "title": "Small Business Safety Handbook",
        "pillar": "integrated",
        "regulation_ref": None,
        "doc_type": "manual",
    },
    # HSE documents
    "hse_coshh_l5.pdf": {
        "source_org": "HSE",
        "title": "Control of Substances Hazardous to Health (COSHH)",
        "pillar": "health",
        "regulation_ref": "COSHH L5",
        "doc_type": "regulation",
    },
    # ILO documents
    "ilo_c170_chemicals_convention.pdf": {
        "source_org": "ILO",
        "title": "Chemicals Convention (C170)",
        "pillar": "health",
        "regulation_ref": "ILO C170",
        "doc_type": "regulation",
    },
    "ilo_c174_un_treaties.pdf": {
        "source_org": "ILO",
        "title": "Prevention of Major Industrial Accidents Convention",
        "pillar": "safety",
        "regulation_ref": "ILO C174",
        "doc_type": "regulation",
    },
    "ilo_chemical_safety_code.pdf": {
        "source_org": "ILO",
        "title": "Code of Practice on Chemical Safety",
        "pillar": "health",
        "regulation_ref": None,
        "doc_type": "guideline",
    },
    "ilo_major_accidents_code.pdf": {
        "source_org": "ILO",
        "title": "Code of Practice on Major Accident Prevention",
        "pillar": "safety",
        "regulation_ref": None,
        "doc_type": "guideline",
    },
    # EU documents (CELEX)
    "CELEX_3A32006R1907_3AEN_3ATXT.pdf": {
        "source_org": "EU",
        "title": "REACH Regulation",
        "pillar": "environment",
        "regulation_ref": "EC 1907/2006",
        "doc_type": "regulation",
    },
    "CELEX_3A32014L0034_3AEN_3ATXT.pdf": {
        "source_org": "EU",
        "title": "ATEX Directive",
        "pillar": "safety",
        "regulation_ref": "2014/34/EU",
        "doc_type": "regulation",
    },
    # Abu Dhabi / ADOSH
    "1 - Hazardous Materials Eng.pdf": {
        "source_org": "ADOSH",
        "title": "Hazardous Materials Code of Practice",
        "pillar": "health",
        "regulation_ref": "ADOSH CoP 1.0",
        "doc_type": "guideline",
    },
    # General EHS manuals and guides
    "AU_EHS_Manual-May_2019_-_For_Publication.pdf": {
        "source_org": "Other",
        "title": "American University EHS Manual",
        "pillar": "integrated",
        "regulation_ref": None,
        "doc_type": "manual",
    },
    "Chemical-Laboratory-Safety-and-Security-National-Academies-Press.pdf": {
        "source_org": "NAS",
        "title": "Chemical Laboratory Safety and Security",
        "pillar": "health",
        "regulation_ref": None,
        "doc_type": "guideline",
    },
    "Chemical-Safety-Guide.pdf": {
        "source_org": "Other",
        "title": "Chemical Safety Guide",
        "pillar": "health",
        "regulation_ref": None,
        "doc_type": "guideline",
    },
    "Environmental-Health-and-Safety-Manual.pdf": {
        "source_org": "Other",
        "title": "Environmental Health and Safety Manual",
        "pillar": "integrated",
        "regulation_ref": None,
        "doc_type": "manual",
    },
    "Environmental Health and Safety.pdf": {
        "source_org": "Other",
        "title": "Environmental Health and Safety Overview",
        "pillar": "integrated",
        "regulation_ref": None,
        "doc_type": "guideline",
    },
    "EHS-00005-R17-Chemical-Handling-and-Storage.pdf": {
        "source_org": "Other",
        "title": "Chemical Handling and Storage Procedure",
        "pillar": "health",
        "regulation_ref": "EHS-00005-R17",
        "doc_type": "sop",
    },
    "EHS-005-Hazardous-Chemical-Substance-Management-sample.pdf": {
        "source_org": "Other",
        "title": "Hazardous Chemical Substance Management",
        "pillar": "health",
        "regulation_ref": "EHS-005",
        "doc_type": "sop",
    },
    "Hazardous-Material-Management-Procedure.pdf": {
        "source_org": "Other",
        "title": "Hazardous Material Management Procedure",
        "pillar": "health",
        "regulation_ref": None,
        "doc_type": "sop",
    },
    "chemical_storage_guidelines_si.pdf": {
        "source_org": "Other",
        "title": "Chemical Storage Guidelines",
        "pillar": "health",
        "regulation_ref": None,
        "doc_type": "guideline",
    },
    "corrosives-sop.pdf": {
        "source_org": "Other",
        "title": "Corrosives Standard Operating Procedure",
        "pillar": "health",
        "regulation_ref": None,
        "doc_type": "sop",
    },
    "nonhazchemical.pdf": {
        "source_org": "Other",
        "title": "Non-Hazardous Chemical Safety Guide",
        "pillar": "health",
        "regulation_ref": None,
        "doc_type": "guideline",
    },
    "standard-operating-procedure-template.pdf": {
        "source_org": "Other",
        "title": "Standard Operating Procedure Template",
        "pillar": "integrated",
        "regulation_ref": None,
        "doc_type": "sop",
    },
    # HSA (Ireland)
    "103525-hsa-8-chemical-safety-brochure.pdf": {
        "source_org": "HSA",
        "title": "Chemical Safety Brochure",
        "pillar": "health",
        "regulation_ref": None,
        "doc_type": "quick_card",
    },
    # World Bank / IFC
    "112799-WP-ENGLISH-Large-Volume-Petroleum-based-Organic-Chemcials-PUBLIC.pdf": {
        "source_org": "IFC",
        "title": "Large Volume Petroleum-based Organic Chemicals Guidelines",
        "pillar": "environment",
        "regulation_ref": None,
        "doc_type": "guideline",
    },
    "2007-general-ehs-guidelines-hazardous-materials-management-en.pdf": {
        "source_org": "IFC",
        "title": "General EHS Guidelines - Hazardous Materials Management",
        "pillar": "integrated",
        "regulation_ref": None,
        "doc_type": "guideline",
    },
    # Skip image-based PDFs (no text extracted)
    "23.SOP. Chemical Handling.pdf": None,  # Image-based
    "msds-제도-홍보-영문-리플렛-210401.pdf": None,  # Image-based (KOSHA)
}


def get_source_metadata(filename: str) -> dict | None:
    """Get source metadata for a PDF filename. Returns None for skip files."""
    return SOURCES.get(filename)
