import urllib.request
import re
import json

urls = [
    ("Home", "https://r-techsupport.github.io/"),
    ("Hardware", "https://r-techsupport.github.io/books/hardware/"),
    ("Software", "https://r-techsupport.github.io/books/software/"),
    ("Networking", "https://r-techsupport.github.io/books/networking/"),
    ("Malware", "https://r-techsupport.github.io/books/malware/"),
]

all_links = set()
for name, url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8', errors='ignore')
            found = re.findall(r'href="([^"]+)"', content)
            for link in found:
                if "books/" in link or "docs/" in link or "pages/" in link:
                    all_links.add(link)
    except Exception as e:
        print(f"Failed {url}: {e}")

print(f"Total community guide links discovered: {len(all_links)}")
for l in sorted(list(all_links))[:30]:
    print(" -", l)
