import os
from PIL import Image, ImageDraw

def create_favicon(size=512):
    # Load extracted symbol
    sym = Image.open("public/brand/pcfix-symbol-white.png").convert("RGBA")
    
    # 1. Create App Icon with rounded squircle badge for maximum legibility on any tab color
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Rounded rectangle background
    radius = int(size * 0.22)
    # Background: deep tech slate #0c111d
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=(12, 17, 29, 255), outline=(59, 130, 246, 120), width=max(1, int(size * 0.03)))
    
    # Scale symbol to fit nicely with ~22% margin
    inner_size = int(size * 0.62)
    aspect = sym.width / sym.height
    if aspect > 1:
        sw = inner_size
        sh = int(inner_size / aspect)
    else:
        sh = inner_size
        sw = int(inner_size * aspect)
        
    scaled_sym = sym.resize((sw, sh), Image.Resampling.LANCZOS)
    
    # Center symbol
    x = (size - sw) // 2
    y = (size - sh) // 2
    img.paste(scaled_sym, (x, y), scaled_sym)
    return img

def create_transparent_favicon(size=512):
    # Standalone transparent mark version
    sym = Image.open("public/brand/pcfix-symbol-white.png").convert("RGBA")
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    aspect = sym.width / sym.height
    inner_size = int(size * 0.88)
    if aspect > 1:
        sw = inner_size
        sh = int(inner_size / aspect)
    else:
        sh = inner_size
        sw = int(inner_size * aspect)
    scaled_sym = sym.resize((sw, sh), Image.Resampling.LANCZOS)
    x = (size - sw) // 2
    y = (size - sh) // 2
    img.paste(scaled_sym, (x, y), scaled_sym)
    return img

badge_512 = create_favicon(512)
badge_192 = create_favicon(192)
badge_180 = create_favicon(180)
badge_48 = create_favicon(48)
badge_32 = create_favicon(32)
badge_16 = create_favicon(16)

# Save Next.js 14 special icon routes
os.makedirs("app", exist_ok=True)
os.makedirs("public", exist_ok=True)

# 1. app/icon.png (Next.js automatically generates <link rel="icon"> from app/icon.png)
badge_512.save("app/icon.png", "PNG")
badge_512.save("public/icon.png", "PNG")

# 2. app/apple-icon.png (Next.js automatically generates <link rel="apple-touch-icon">)
badge_180.save("app/apple-icon.png", "PNG")
badge_180.save("public/apple-touch-icon.png", "PNG")

# 3. favicon.ico (multi-size standard favicon)
badge_48.save("public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
badge_48.save("app/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

print("All favicon and tab icon assets created successfully.")
