import pypdf

path = "/Users/saba/Documents/Personal/GYM/Course/Phase 1 - Warm up and Cool down.pdf"
reader = pypdf.PdfReader(path)
print(f"\n=========================================\nPhase 1 - Warm up and Cool down.pdf\n=========================================")
for idx, page in enumerate(reader.pages):
    print(f"--- Page {idx+1} ---")
    print(page.extract_text())
