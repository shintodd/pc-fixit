import re

pub_dir = "public/brand"
brain_dir = "C:/Users/ainol/.gemini/antigravity/brain/d18ead3e-0f2c-405f-bc62-ce82f288e8f5"

with open(f"{pub_dir}/pcfix-symbol.svg", "r", encoding="utf-8") as f:
    sym_svg = f.read()

with open(f"{pub_dir}/pcfix-text.svg", "r", encoding="utf-8") as f:
    text_svg = f.read()

# Extract paths
sym_path = re.search(r'd="([^"]+)"', sym_svg).group(1)
text_path = re.search(r'd="([^"]+)"', text_svg).group(1)

# Proportions
# Symbol native: 550 x 638
# Text native: 517 x 254
# Target symbol height: 260 => scale = 260 / 638 = 0.40752
sym_scale = 260.0 / 638.0
sym_w = 550.0 * sym_scale # ~224.14
gap = 48.0
text_scale = 1.0 # 517 x 254
text_x = sym_w + gap
text_y = (260.0 - 254.0) / 2.0 # 3.0

total_w = int(text_x + 517.0)
total_h = 260

combined_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_w} {total_h}" fill="currentColor">
  <!-- PCFIX Symbol #1 -->
  <g transform="scale({sym_scale:.5f})">
    <path fill-rule="evenodd" clip-rule="evenodd" d="{sym_path}" />
  </g>
  <!-- PCFIX By Shin Wordmark -->
  <g transform="translate({text_x:.2f}, {text_y:.2f}) scale({text_scale:.5f})">
    <path fill-rule="evenodd" clip-rule="evenodd" d="{text_path}" />
  </g>
</svg>'''

with open(f"{pub_dir}/pcfix-logo.svg", "w", encoding="utf-8") as f:
    f.write(combined_svg)
with open(f"{brain_dir}/pcfix-logo.svg", "w", encoding="utf-8") as f:
    f.write(combined_svg)

print(f"Combined vector SVG generated: {total_w}x{total_h}")
