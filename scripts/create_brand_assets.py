import os
import numpy as np
from PIL import Image

brain_dir = "C:/Users/ainol/.gemini/antigravity/brain/d18ead3e-0f2c-405f-bc62-ce82f288e8f5"
pub_dir = "public/brand"
os.makedirs(pub_dir, exist_ok=True)

# -------------------------------------------------------------
# 1. TEXT EXTRACTION (Zero Green Residue)
# -------------------------------------------------------------
text_src = Image.open(f"{brain_dir}/.user_uploaded/media_1789158607797.png").convert("RGB")
arr_t = np.array(text_src, dtype=np.float32)

# In pure green background, R=0. Text is pure white (R=255, G=255, B=255).
# Linear smooth alpha ramp across R:
r_chan = arr_t[:, :, 0]
alpha_t = np.clip((r_chan - 8.0) / (240.0 - 8.0), 0.0, 1.0)

# Bounding box of text
coords_t = np.argwhere(alpha_t > 0.05)
y0_t, x0_t = coords_t.min(axis=0)
y1_t, x1_t = coords_t.max(axis=0) + 1
alpha_t_crop = alpha_t[y0_t:y1_t, x0_t:x1_t]
th, tw = alpha_t_crop.shape

# Helper to build RGBA from single alpha channel
def make_rgba(alpha_mask, rgb_color):
    h, w = alpha_mask.shape
    out = np.zeros((h, w, 4), dtype=np.uint8)
    for c in range(3):
        out[:, :, c] = rgb_color[c]
    out[:, :, 3] = np.uint8(np.round(alpha_mask * 255.0))
    return Image.fromarray(out, mode="RGBA")

text_white = make_rgba(alpha_t_crop, (255, 255, 255))
text_dark = make_rgba(alpha_t_crop, (15, 23, 42))       # Tailwind slate-900
text_cyan = make_rgba(alpha_t_crop, (6, 182, 212))      # Cyan-500

# -------------------------------------------------------------
# 2. SYMBOL #1 EXTRACTION
# -------------------------------------------------------------
sym_src = Image.open(f"{brain_dir}/interlocking_hex_symbol_1789158557918.jpg").convert("RGB")
arr_s = np.array(sym_src, dtype=np.float32)
gray_s = arr_s.mean(axis=2)

# Background luminance ~20-35, symbol mark is 255
alpha_s = np.clip((gray_s - 55.0) / (195.0 - 55.0), 0.0, 1.0)

# Bounding box of symbol
coords_s = np.argwhere(alpha_s > 0.05)
y0_s, x0_s = coords_s.min(axis=0)
y1_s, x1_s = coords_s.max(axis=0) + 1
alpha_s_crop = alpha_s[y0_s:y1_s, x0_s:x1_s]
sh, sw = alpha_s_crop.shape

sym_white = make_rgba(alpha_s_crop, (255, 255, 255))
sym_dark = make_rgba(alpha_s_crop, (15, 23, 42))
sym_cyan = make_rgba(alpha_s_crop, (6, 182, 212))

# -------------------------------------------------------------
# 3. COMPOSITION HELPERS
# -------------------------------------------------------------
def build_horizontal_lockup(sym_img, text_img, gap=64, padding=80):
    # Proportional scaling: make symbol height match text height plus slight optical boost
    target_sh = int(text_img.height * 1.08)
    aspect = sym_img.width / sym_img.height
    target_sw = int(target_sh * aspect)
    
    scaled_sym = sym_img.resize((target_sw, target_sh), Image.Resampling.LANCZOS)
    
    total_w = padding * 2 + target_sw + gap + text_img.width
    total_h = padding * 2 + max(target_sh, text_img.height)
    
    canvas = Image.new("RGBA", (total_w, total_h), (0, 0, 0, 0))
    
    # Vertically align symbol with text block center
    sym_y = padding + (max(target_sh, text_img.height) - target_sh) // 2
    text_y = padding + (max(target_sh, text_img.height) - text_img.height) // 2
    
    canvas.paste(scaled_sym, (padding, sym_y), scaled_sym)
    canvas.paste(text_img, (padding + target_sw + gap, text_y), text_img)
    return canvas

def build_vertical_lockup(sym_img, text_img, gap=48, padding=96):
    target_sh = int(text_img.height * 1.5)
    aspect = sym_img.width / sym_img.height
    target_sw = int(target_sh * aspect)
    
    scaled_sym = sym_img.resize((target_sw, target_sh), Image.Resampling.LANCZOS)
    
    max_content_w = max(target_sw, text_img.width)
    total_w = padding * 2 + max_content_w
    total_h = padding * 2 + target_sh + gap + text_img.height
    
    canvas = Image.new("RGBA", (total_w, total_h), (0, 0, 0, 0))
    
    sym_x = padding + (max_content_w - target_sw) // 2
    text_x = padding + (max_content_w - text_img.width) // 2
    
    canvas.paste(scaled_sym, (sym_x, padding), scaled_sym)
    canvas.paste(text_img, (text_x, padding + target_sh + gap), text_img)
    return canvas

# Build Lockups
h_lockup_white = build_horizontal_lockup(sym_white, text_white)
h_lockup_dark = build_horizontal_lockup(sym_dark, text_dark)
h_lockup_cyan = build_horizontal_lockup(sym_cyan, text_cyan)

v_lockup_white = build_vertical_lockup(sym_white, text_white)
v_lockup_dark = build_vertical_lockup(sym_dark, text_dark)

# -------------------------------------------------------------
# 4. MOCKUP PRESENTATIONS (Studio Quality)
# -------------------------------------------------------------
def make_presentation(lockup, bg_color, canvas_size=(1600, 900)):
    bg = Image.new("RGBA", canvas_size, bg_color)
    
    # Scale lockup to fill comfortably ~55% of canvas width
    scale = min((canvas_size[0] * 0.65) / lockup.width, (canvas_size[1] * 0.6) / lockup.height)
    new_w = int(lockup.width * scale)
    new_h = int(lockup.height * scale)
    scaled = lockup.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    x = (canvas_size[0] - new_w) // 2
    y = (canvas_size[1] - new_h) // 2
    bg.paste(scaled, (x, y), scaled)
    return bg.convert("RGB")

mockup_dark = make_presentation(h_lockup_white, (11, 15, 25, 255))   # Matte obsidian dark #0b0f19
mockup_light = make_presentation(h_lockup_dark, (246, 248, 250, 255)) # Soft matte off-white #f6f8fa

# -------------------------------------------------------------
# 5. SAVE ALL OUTPUTS (Public and Brain Artifacts)
# -------------------------------------------------------------
outputs = {
    "pcfix-symbol-white.png": sym_white,
    "pcfix-symbol-dark.png": sym_dark,
    "pcfix-text-white.png": text_white,
    "pcfix-text-dark.png": text_dark,
    "pcfix-lockup-horizontal-white.png": h_lockup_white,
    "pcfix-lockup-horizontal-dark.png": h_lockup_dark,
    "pcfix-lockup-vertical-white.png": v_lockup_white,
    "pcfix-lockup-vertical-dark.png": v_lockup_dark,
    "pcfix-mockup-dark.jpg": mockup_dark,
    "pcfix-mockup-light.jpg": mockup_light,
}

for name, img in outputs.items():
    pub_path = os.path.join(pub_dir, name)
    brain_path = os.path.join(brain_dir, name)
    
    if name.endswith(".jpg"):
        img.save(pub_path, "JPEG", quality=95)
        img.save(brain_path, "JPEG", quality=95)
    else:
        img.save(pub_path, "PNG")
        img.save(brain_path, "PNG")
    print(f"Saved: {name} -> {img.size}")

print("All brand assets generated successfully.")
