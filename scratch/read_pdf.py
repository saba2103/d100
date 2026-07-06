import pypdf

files = [
    "Phase 2 - Abs workout.pdf",
    "Phase 2 - Calorie and Macro Calculator.pdf"
]

for filename in files:
    path = f"/Users/saba/Documents/Personal/GYM/Course/{filename}"
    reader = pypdf.PdfReader(path)
    print(f"\n=========================================\n{filename}\n=========================================")
    for idx, page in enumerate(reader.pages):
        print(f"--- Page {idx+1} ---")
        print(page.extract_text())
