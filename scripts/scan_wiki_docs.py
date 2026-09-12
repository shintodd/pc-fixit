import urllib.request
import json
import re
import os

BASE_API = "https://api.github.com/repos/r-techsupport/rTS_Wiki/contents/src/content/docs"
RAW_BASE = "https://raw.githubusercontent.com/r-techsupport/rTS_Wiki/master/src/content/docs"

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

def get_files_recursive(path=""):
    url = f"{BASE_API}/{path}" if path else BASE_API
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as resp:
            items = json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"Error reading {url}: {e}")
        return []

    files = []
    for item in items:
        if item["type"] == "file" and (item["name"].endswith(".md") or item["name"].endswith(".mdx")):
            if not item["name"].startswith("index."):
                files.append(item["path"].replace("src/content/docs/", ""))
        elif item["type"] == "dir":
            subpath = f"{path}/{item['name']}" if path else item["name"]
            files.extend(get_files_recursive(subpath))
    return files

print("Fetching file list from rTS_Wiki repository...")
all_doc_files = get_files_recursive()
print(f"Found {len(all_doc_files)} community markdown docs.")
for f in all_doc_files:
    print(" -", f)
