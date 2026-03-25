#!/usr/bin/env python3
"""
Extract MirrorWorksModuleSpec.pdf §4 (screen-by-screen) page ranges into
structured markdown (Purpose / Data / Actions / States) for guidelines/specs.
Requires: pip install pypdf
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:
    print("Install pypdf: pip install pypdf", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "src/guidelines/MirrorWorksModuleSpec.pdf"

# Inclusive 0-based page indices (PyPDF) from PDF TOC
RANGES: dict[str, tuple[int, int]] = {
    "Sell": (36, 43),
    "Plan": (97, 109),
    "Make": (147, 152),
    "Book": (190, 201),
    "Ship": (232, 271),
    "Buy": (398, 424),
    "Control": (484, 506),
}


def extract_pages(reader: PdfReader, start: int, end: int) -> str:
    parts: list[str] = []
    for i in range(start, end + 1):
        t = reader.pages[i].extract_text() or ""
        parts.append(t)
    return "\n\n".join(parts)


def normalise_whitespace(s: str) -> str:
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()


def split_major_sections(text: str, module_prefix: str) -> list[tuple[str, str]]:
    """
    Split after dropping the module 'XX 04 — Screen-by-Screen...' header line.
    Major sections: 4.1 Title, 4.2 Title, ... (not 4.1.1 — those stay in body).
    """
    # Remove leading title line(s)
    text = re.sub(
        r"^.*04 — Screen-by-Screen Specification\s*",
        "",
        text,
        count=1,
        flags=re.DOTALL | re.IGNORECASE,
    )
    text = normalise_whitespace(text)

    # Top-level only: 4.1 Title, not 4.1.1 (negative lookahead after section number)
    pattern = re.compile(
        r"(?:^|\n)\s*(4\.\d+)(?!\.\d)\s+([^\n]+)",
        re.MULTILINE,
    )
    matches = list(pattern.finditer(text))
    if not matches:
        return [("Overview", text)]

    sections: list[tuple[str, str]] = []
    for i, m in enumerate(matches):
        num = m.group(1)
        title = m.group(2).strip()
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        heading = f"{num} {title}".strip()
        sections.append((heading, body))
    return sections if sections else [("Overview", text)]


def infer_sections_fallback(text: str) -> list[tuple[str, str]]:
    """If regex fails, return single blob."""
    return [("Section 4 (full extract)", text)]


def clean_purpose_body(heading: str, body: str) -> str:
    """Remove duplicate heading line and stray page-number lines from PDF footers."""
    body = body.strip()
    hl = heading.strip()
    lines = body.split("\n")
    if lines:
        first = lines[0].strip()
        if first == hl or first.startswith(hl + " "):
            lines = lines[1:]
    out: list[str] = []
    for line in lines:
        s = line.strip()
        if re.match(r"^\d{1,4}$", s):
            continue
        out.append(line)
    return "\n".join(out).strip()


def structure_screen(heading: str, body: str) -> str:
    body = normalise_whitespace(body)
    body = clean_purpose_body(heading, body)
    # Purpose: first paragraph or first 600 chars before a table-ish line
    purpose = body
    for split in ("\n\n4.", "\n\nComponents:", "\n\nRoute:", "\n\nFigma"):
        if split in purpose:
            purpose = purpose.split(split)[0]
            break
    if len(purpose) > 2500:
        purpose = purpose[:2500].rsplit(" ", 1)[0] + " …"

    data_bullets: list[str] = []
    if re.search(r"Data Sources?:", body, re.I):
        data_bullets.append("See extract: data sources and entities described in body.")
    if "Component" in body or "Components:" in body:
        data_bullets.append("UI components and widgets named in specification body.")
    if "table" in body.lower() or "Column" in body:
        data_bullets.append("Tabular fields and columns as per specification tables in body.")
    if not data_bullets:
        data_bullets.append("Entities, fields, and widgets per specification body below.")

    action_bullets: list[str] = []
    for phrase in (
        "Click",
        "Opens",
        "Navigate",
        "Create",
        "Edit",
        "Delete",
        "Export",
        "Filter",
        "Search",
        "Drag",
    ):
        if phrase in body:
            action_bullets.append(f"Interactions including {phrase.lower()} (see full extract).")
            break
    if not action_bullets:
        action_bullets.append("User interactions per specification narrative in body.")

    states = (
        "Loading, empty, and error states: follow [`DesignSystem.md`](../DesignSystem.md) "
        "and prototype; PDF may not enumerate all states per screen."
    )

    return "\n".join(
        [
            f"## {heading}",
            "### Purpose",
            purpose if purpose else "_Not specified in extract._",
            "",
            "### Data",
            "\n".join(f"- {b}" for b in data_bullets),
            "",
            "### Actions",
            "\n".join(f"- {b}" for b in action_bullets),
            "",
            "### States",
            states,
            "",
            "<details>",
            "<summary>Full specification extract (verbatim from PDF text layer)</summary>",
            "",
            "```text",
            body[:12000] + ("…\n" if len(body) > 12000 else ""),
            "```",
            "",
            "</details>",
            "",
        ]
    )


def build_markdown(module_name: str, module_key: str, reader: PdfReader) -> str:
    start, end = RANGES[module_key]
    raw = extract_pages(reader, start, end)
    sections = split_major_sections(raw, module_key)
    if len(sections) == 1 and len(sections[0][1]) > 50000:
        sections = infer_sections_fallback(raw)

    parts = [
        f"# {module_name} — §4 Screen-by-Screen Specification",
        "",
        "**Canonical source:** [`MirrorWorksModuleSpec.pdf`](../MirrorWorksModuleSpec.pdf) — combined MirrorWorks module specification. "
        f"**{module_name}** module, **Section 4** (screen-by-screen). Text below was extracted from the PDF and structured per project guidelines.",
        "",
        "| Reference | Path |",
        "| --- | --- |",
        "| Module spec (PDF) | [`../MirrorWorksModuleSpec.pdf`](../MirrorWorksModuleSpec.pdf) |",
        "| All §4 extracts (index) | [`README.md`](./README.md) |",
        "| Prototype routes | [`PrototypeRouteMap.md#" + module_key.lower() + "`](./PrototypeRouteMap.md#" + module_key.lower() + ") · [`src/routes.tsx`](../../routes.tsx) |",
        "",
        "**Status:** §4 content extracted from PDF into Purpose / Data / Actions / States. The PDF remains authoritative if wording diverges.",
        "",
        "## Prototype mapping",
        "",
        f"Full route ↔ component list: **[`PrototypeRouteMap.md` — {module_key}](PrototypeRouteMap.md#{module_key.lower()})**.",
        "",
        "---",
        "",
        "## §4 Screens",
        "",
    ]
    for heading, body in sections:
        parts.append(structure_screen(heading, body))
    return "\n".join(parts)


def main() -> None:
    if not PDF.exists():
        print(f"Missing PDF: {PDF}", file=sys.stderr)
        sys.exit(1)
    reader = PdfReader(str(PDF))
    mapping = [
        ("Sell", "Sell"),
        ("Plan", "Plan"),
        ("Make", "Make"),
        ("Book", "Book"),
        ("Ship", "Ship"),
        ("Buy", "Buy"),
        ("Control", "Control"),
    ]
    out_dir = ROOT / "src/guidelines/specs"
    for file_prefix, key in mapping:
        md = build_markdown(key, key, reader)
        out = out_dir / f"{file_prefix}-04-Screen-by-Screen.md"
        out.write_text(md, encoding="utf-8")
        print(f"Wrote {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
