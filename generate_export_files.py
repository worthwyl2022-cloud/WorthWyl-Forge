import os
import shutil
import base64
import json

root_dir = "cranium_substrate"
os.makedirs("public", exist_ok=True)
md_out_path = "public/CRANIUM_SUBSTRATE_ALL.md"

content_blocks = []
content_blocks.append("# CRANIUM SUBSTRATE ENGINE — COMPLETE UNIFIED REPOSITORY\n")
content_blocks.append("This file contains the complete, unabridged source code for all modules in the `cranium_substrate` repository.\n\n")

for dirpath, dirnames, filenames in sorted(os.walk(root_dir)):
    for filename in sorted(filenames):
        filepath = os.path.join(dirpath, filename)
        relpath = os.path.relpath(filepath, ".").replace("\\", "/")
        ext = os.path.splitext(filename)[1].lower()
        lang = "kotlin" if ext == ".kt" else "python" if ext == ".py" else "json" if ext == ".json" else "markdown" if ext == ".md" else ""
        
        content_blocks.append(f"---\n\n## File: `/{relpath}`\n\n```{lang}\n")
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            content_blocks.append(f.read())
        content_blocks.append("\n```\n\n")

full_md = "".join(content_blocks)
with open(md_out_path, "w", encoding="utf-8") as out:
    out.write(full_md)

print(f"Generated {md_out_path} with size: {os.path.getsize(md_out_path)} bytes")

# Also make ZIP
shutil.make_archive("public/cranium_substrate", "zip", ".", "cranium_substrate")
print("Generated public/cranium_substrate.zip")

# Also export as TypeScript string for direct in-browser download
with open("src/fullCodeExport.ts", "w", encoding="utf-8") as ts_out:
    ts_out.write("export const FULL_CRANIUM_SUBSTRATE_MD = " + json.dumps(full_md) + ";\n")
print("Generated src/fullCodeExport.ts")
