#!/usr/bin/env python3
"""Validate a .docx file structure before delivery."""

import sys
import zipfile
from pathlib import Path

REQUIRED_PARTS = [
    "word/document.xml",
    "[Content_Types].xml",
    "word/_rels/document.xml.rels",
]


def validate_docx(path: Path) -> list[str]:
    errors: list[str] = []

    if not path.exists():
        return [f"File not found: {path}"]

    if path.suffix.lower() != ".docx":
        errors.append("File must have a .docx extension")

    if path.stat().st_size < 1024:
        errors.append("File is suspiciously small (< 1 KB)")

    try:
        with zipfile.ZipFile(path, "r") as archive:
            names = set(archive.namelist())
            for part in REQUIRED_PARTS:
                if part not in names:
                    errors.append(f"Missing required part: {part}")

            document_xml = archive.read("word/document.xml").decode("utf-8", errors="replace")
            if "<w:document" not in document_xml:
                errors.append("document.xml does not contain a valid w:document root")
            if "<w:body" not in document_xml:
                errors.append("document.xml is missing w:body")
    except zipfile.BadZipFile:
        errors.append("File is not a valid ZIP archive (.docx)")
    except Exception as exc:  # noqa: BLE001
        errors.append(f"Unexpected error reading docx: {exc}")

    return errors


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python scripts/office/validate.py <file.docx>")
        return 1

    target = Path(sys.argv[1])
    errors = validate_docx(target)

    if errors:
        print(f"Validation FAILED for {target}")
        for err in errors:
            print(f"  - {err}")
        return 1

    size_kb = target.stat().st_size / 1024
    print(f"Validation PASSED: {target} ({size_kb:.1f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
