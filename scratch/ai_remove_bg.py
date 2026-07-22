import os
from PIL import Image
from rembg import remove

def main():
    public_dir = r"c:\Users\adamb\Downloads\Sites\Spymals\public"
    
    # Process Mascot
    mascot_path = os.path.join(public_dir, "detective_mascot.png")
    if os.path.exists(mascot_path):
        print(f"Removing background from mascot: {mascot_path}")
        with open(mascot_path, 'rb') as i:
            input_data = i.read()
            output_data = remove(input_data)
            with open(mascot_path, 'wb') as o:
                o.write(output_data)
        print("Mascot done!")

    # Process Avatars
    avatars_dir = os.path.join(public_dir, "avatars")
    if os.path.exists(avatars_dir):
        for fname in os.listdir(avatars_dir):
            if fname.endswith(".png"):
                file_path = os.path.join(avatars_dir, fname)
                print(f"Removing background from avatar: {file_path}")
                with open(file_path, 'rb') as i:
                    input_data = i.read()
                    output_data = remove(input_data)
                    with open(file_path, 'wb') as o:
                        o.write(output_data)
                print(f"Avatar {fname} done!")

if __name__ == "__main__":
    main()
