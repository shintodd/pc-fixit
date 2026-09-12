import cv2
import numpy as np

brain_dir = "C:/Users/ainol/.gemini/antigravity/brain/d18ead3e-0f2c-405f-bc62-ce82f288e8f5"
pub_dir = "public/brand"

# 1. Trace Symbol #1
sym_gray = cv2.imread(f"{brain_dir}/interlocking_hex_symbol_1789158557918.jpg", cv2.IMREAD_GRAYSCALE)
_, thresh_s = cv2.threshold(sym_gray, 140, 255, cv2.THRESH_BINARY)
contours_s, hierarchy_s = cv2.findContours(thresh_s, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_TC89_KCOS)

# Get bounding box of all contours
all_pts = np.concatenate([c for c in contours_s if cv2.contourArea(c) > 500])
x_s, y_s, w_s, h_s = cv2.boundingRect(all_pts)

def contour_to_svg_d(contours, hierarchy, offset_x=0, offset_y=0, scale=1.0):
    paths = []
    if hierarchy is None or len(hierarchy) == 0:
        return ""
    hier = hierarchy[0]
    for idx, c in enumerate(contours):
        if cv2.contourArea(c) < 30:
            continue
        # Approximate polygon slightly for clean vector lines
        epsilon = 0.0025 * cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, epsilon, True)
        
        pts = approx[:, 0, :]
        d = f"M {(pts[0][0] - offset_x) * scale:.2f} {(pts[0][1] - offset_y) * scale:.2f} "
        for pt in pts[1:]:
            d += f"L {(pt[0] - offset_x) * scale:.2f} {(pt[1] - offset_y) * scale:.2f} "
        d += "Z"
        paths.append(d)
    return " ".join(paths)

symbol_path_d = contour_to_svg_d([c for c in contours_s if cv2.contourArea(c) > 500], hierarchy_s, offset_x=x_s, offset_y=y_s)

# Save standalone symbol SVG
symbol_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w_s} {h_s}" fill="currentColor">
  <path fill-rule="evenodd" clip-rule="evenodd" d="{symbol_path_d}" />
</svg>'''

with open(f"{pub_dir}/pcfix-symbol.svg", "w", encoding="utf-8") as f:
    f.write(symbol_svg)
with open(f"{brain_dir}/pcfix-symbol.svg", "w", encoding="utf-8") as f:
    f.write(symbol_svg)

print("Symbol SVG exported successfully.")
