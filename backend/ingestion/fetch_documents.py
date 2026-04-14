# /// script
# requires-python = ">=3.11"
# dependencies = ["requests"]
# ///
"""Download pre-seeded EHS regulatory PDFs to backend/data/raw/ for ingestion."""

import logging
from pathlib import Path

import requests

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

RAW_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"
TIMEOUT_S = 30
MIN_PDF_BYTES = 10_000
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}

SOURCES: list[tuple[str, str]] = [
    ("osha_1910_119_psm.pdf",
     "https://www.osha.gov/sites/default/files/publications/osha3132.pdf"),
    ("osha_1910_146_confined_spaces.pdf",
     "https://www.osha.gov/sites/default/files/publications/osha3138.pdf"),
    ("osha_confined_space_quick_card.pdf",
     "https://www.osha.gov/sites/default/files/publications/confined_space_permit.pdf"),
    ("osha_1910_1200_hazcom_compliance.pdf",
     "https://www.osha.gov/sites/default/files/publications/OSHA3695.pdf"),
    ("osha_1910_1200_hazcom_cfr.pdf",
     "https://www.govinfo.gov/content/pkg/CFR-2015-title29-vol6/pdf/CFR-2015-title29-vol6-sec1910-1200.pdf"),
    ("hse_coshh_l5.pdf",
     "https://www.hse.gov.uk/pubns/priced/l5.pdf"),
    ("osha_psm_refineries_3918.pdf",
     "https://www.osha.gov/sites/default/files/publications/OSHA3918.pdf"),
    ("osha_psm_small_business_3908.pdf",
     "https://www.osha.gov/sites/default/files/publications/OSHA3908.pdf"),
    ("osha_laboratory_safety_3404.pdf",
     "https://www.osha.gov/sites/default/files/publications/OSHA3404laboratory-safety-guidance.pdf"),
    ("osha_small_business_handbook.pdf",
     "https://www.osha.gov/sites/default/files/publications/small-business.pdf"),
    ("ilo_c174_un_treaties.pdf",
     "https://treaties.un.org/doc/Publication/UNTS/Volume%201967/volume-1967-I-33639-English.pdf"),
    ("ilo_chemical_safety_code.pdf",
     "https://www.ilo.org/media/270751/download"),
    ("ilo_major_accidents_code.pdf",
     "https://www.ilo.org/media/270736/download"),
    ("ilo_c170_chemicals_convention.pdf",
     "https://www.ilo.org/media/403741/download"),
]


def fetch(filename: str, url: str) -> bool:
    path = RAW_DIR / filename
    try:
        resp = requests.get(url, timeout=TIMEOUT_S, allow_redirects=True, headers=HEADERS)
        resp.raise_for_status()
        content = resp.content
        if len(content) < MIN_PDF_BYTES:
            log.warning("FAIL %s: too small (%d bytes)", url, len(content))
            return False
        if not content[:4] == b"%PDF":
            log.warning("FAIL %s: not a PDF (magic bytes: %r)", url, content[:8])
            return False
        path.write_bytes(content)
        log.info("OK   %s -> %s (%d bytes)", url, filename, len(content))
        return True
    except requests.RequestException as e:
        log.warning("FAIL %s: %s", url, e)
        return False


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    ok = sum(fetch(fn, url) for fn, url in SOURCES)
    log.info("done: %d/%d downloaded into %s", ok, len(SOURCES), RAW_DIR)


if __name__ == "__main__":
    main()
