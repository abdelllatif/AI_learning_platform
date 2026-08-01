import subprocess
from pathlib import Path


def run_tesseract(path: str) -> str:
    pdf_path = Path(path)
    if not pdf_path.exists():
        return ""

    output_txt = pdf_path.with_suffix(".ocr.txt")
    try:
        subprocess.run(
            ["tesseract", str(pdf_path), str(output_txt.with_suffix("")), "pdf"],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        if output_txt.exists():
            return output_txt.read_text(encoding="utf-8", errors="ignore")
    except FileNotFoundError:
        return ""
    except subprocess.CalledProcessError:
        return ""
    finally:
        if output_txt.exists():
            output_txt.unlink(missing_ok=True)

    return ""
