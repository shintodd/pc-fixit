import cv2
import numpy as np

brain_dir = "C:/Users/ainol/.gemini/antigravity/brain/d18ead3e-0f2c-405f-bc62-ce82f288e8f5"
pub_dir = "public/brand"

text_src = cv2.imread(f"{brain_dir}/.user_uploaded/media_1789158607797.png")
r_chan = text_src[:, :, 2]
_, thresh_t = cv2.threshold(r_chan, 120, 255, cv2.THRESH_BINARY)
contours_t, hierarchy_t = cv2.findContours(thresh_t, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_TC89_KCOS)

valid_c = [c for c in contours_t if cv2.contourArea(c) > 30]
all_pts = np.concatenate(valid_c)
x_t, y_t, w_t, h_t = cv2.boundingRect(all_pts)

def contour_to_svg(contours, offset_x=0, offset_y=0, scale=1.0):
    paths = []
    for c in contours:
        epsilon = 0.0015 * cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, epsilon, True)
        pts = approx[:, 0, :]
        d = f"M {(pts[0][0] - offset_x) * scale:.2f} {(pts[0][1] - offset_y) * scale:.2f} "
        for pt in pts[1:]:
            d += f"L {(pt[0] - offset_x) * scale:.2f} {(pt[1] - offset_y) * scale:.2f} "
        d += "Z"
        paths.append(d)
    return " ".join(paths)

text_path_d = contour_to_svg(valid_c, offset_x=x_t, offset_y=y_t)

text_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w_t} {h_t}" fill="currentColor">
  <path fill-rule="evenodd" clip-rule="evenodd" d="{text_path_d}" />
</svg>'''

with open(f"{pub_dir}/pcfix-text.svg", "w", encoding="utf-8") as f:
    f.write(text_svg)
with open(f"{brain_dir}/pcfix-text.svg", "w", encoding="utf-8") as f:
    f.write(text_svg)

print(f"Text SVG exported: {w_t}x{h_t}")
