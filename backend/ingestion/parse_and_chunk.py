# /// script
# requires-python = ">=3.11"
# dependencies = ["pdfplumber", "tiktoken", "langdetect"]
# ///
"""Extract PDFs from backend/data/raw/ and chunk text by OpenAI token size."""

import logging
from pathlib import Path

import pdfplumber
import tiktoken
from langdetect import DetectorFactory, LangDetectException, detect

DetectorFactory.seed = 0

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

RAW_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"
ENCODING = tiktoken.get_encoding("cl100k_base")
CHUNK_SIZES = [500, 800, 1200]


def extract_pdf(path: Path) -> dict:
    """Return metadata + full_text from a PDF. All metadata fields may be None."""
    with pdfplumber.open(path) as pdf:
        meta = pdf.metadata or {}
        pages = [p.extract_text() or "" for p in pdf.pages]
        text = "\n\n".join(pages).strip()
    try:
        lang = detect(text[:3000]) if text else None
    except LangDetectException:
        lang = None
    return {
        "filename": path.name,
        "title": meta.get("Title"),
        "author": meta.get("Author"),
        "subject": meta.get("Subject"),
        "creator": meta.get("Creator"),
        "producer": meta.get("Producer"),
        "creation_date": meta.get("CreationDate"),
        "page_count": len(pages),
        "text": text,
        "token_count": len(ENCODING.encode(text)),
        "language": lang,
    }


def chunk_text(text: str, chunk_size: int, overlap: int = 0) -> list[str]:
    """Split text into token chunks of chunk_size with overlap tokens between."""
    tokens = ENCODING.encode(text)
    step = chunk_size - overlap
    chunks = []
    for start in range(0, len(tokens), step):
        chunks.append(ENCODING.decode(tokens[start : start + chunk_size]))
        if start + chunk_size >= len(tokens):
            break
    return chunks


def main() -> None:
    paths = sorted(RAW_DIR.glob("*.pdf"))
    log.info("found %d PDFs in %s", len(paths), RAW_DIR)
    rows = []
    for path in paths:
        try:
            doc = extract_pdf(path)
        except Exception as e:
            log.warning("FAIL %s: %s", path.name, e)
            continue
        rows.append(doc)
        log.info(
            "%s  pages=%d  tokens=%d  lang=%s",
            doc["filename"], doc["page_count"], doc["token_count"], doc["language"],
        )
    print_report(rows)


def print_report(rows: list[dict]) -> None:
    print("\n" + "=" * 100)
    print("PER-DOCUMENT EXTRACTION")
    print("=" * 100)
    for r in rows:
        print(f"\n{r['filename']}  ({r['page_count']}p, {r['token_count']} tok, lang={r['language']})")
        print(f"  title         = {r['title']!r}")
        print(f"  author        = {r['author']!r}")
        print(f"  subject       = {r['subject']!r}")
        print(f"  creator       = {r['creator']!r}")
        print(f"  creation_date = {r['creation_date']!r}")
        sample = (r["text"][:200] or "").replace("\n", " ")
        print(f"  sample        = {sample}")
        counts = {s: len(chunk_text(r["text"], s)) for s in CHUNK_SIZES}
        print(f"  chunks        = " + "  ".join(f"{s}tok->{c}" for s, c in counts.items()))

    print("\n" + "=" * 100)
    print("FIELD CONFIDENCE")
    print("=" * 100)
    n = len(rows)
    for f in ["title", "author", "subject", "creator", "creation_date", "language"]:
        present = sum(1 for r in rows if r.get(f))
        print(f"  {f:15s} {present:2d}/{n}")
    readable = sum(1 for r in rows if r["token_count"] > 100)
    print(f"  readable text   {readable:2d}/{n}  (tokens > 100)")

    print("\n" + "=" * 100)
    print("CHUNK SIZE TOTALS (no overlap)")
    print("=" * 100)
    for size in CHUNK_SIZES:
        total = sum(len(chunk_text(r["text"], size)) for r in rows)
        print(f"  {size:4d} tokens -> {total:5d} chunks total")


if __name__ == "__main__":
    main()
