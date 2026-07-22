import os
from PIL import Image, ImageFilter
import numpy as np

def remove_background(image_path, output_path, sensitivity=35):
    img = Image.open(image_path).convert("RGBA")
    data = np.array(img)
    
    # Sample corner pixels to find background color
    corners = [
        data[0, 0, :3], data[0, -1, :3],
        data[-1, 0, :3], data[-1, -1, :3],
        data[5, 5, :3], data[5, -6, :3]
    ]
    bg_color = np.mean(corners, axis=0)
    
    # Compute Euclidean distance from bg_color for each pixel
    rgb = data[:, :, :3].astype(float)
    diff = np.sqrt(np.sum((rgb - bg_color) ** 2, axis=2))
    
    # Create smooth alpha mask
    alpha = np.clip((diff - 15) / (sensitivity), 0, 1) * 255
    
    # Also handle very dark pixels near corners
    r, g, b = data[:, :, 0], data[:, :, 1], data[:, :, 2]
    dark_mask = (r < 30) & (g < 35) & (b < 55) & (diff < 45)
    alpha[dark_mask] = 0
    
    data[:, :, 3] = alpha.astype(np.uint8)
    
    result = Image.fromarray(data, mode="RGBA")
    
    # Crop transparent bounding box
    bbox = result.getbbox()
    if bbox:
        result = result.crop(bbox)
        
    result.save(output_path, "PNG")
    print(f"Processed: {image_path} -> {output_path}")

def main():
    public_dir = r"c:\Users\adamb\Downloads\Sites\Spymals\public"
    
    # 1. Mascot
    mascot_in = os.path.join(public_dir, "detective_mascot.png")
    if os.path.exists(mascot_in):
        remove_background(mascot_in, mascot_in, sensitivity=40)
        
    # 2. Avatars
    avatars_dir = os.path.join(public_dir, "avatars")
    if os.path.exists(avatars_dir):
        for f in os.listdir(avatars_dir):
            if f.endswith(".png"):
                p = os.path.join(avatars_dir, f)
                remove_background(p, p, sensitivity=35)

if __name__ == "__main__":
    main()
