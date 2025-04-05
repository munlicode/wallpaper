import requests
from PIL import Image
import os
import tkinter as tk
from io import BytesIO
import platform
import ctypes  # Windows
import subprocess  # macOS & Linux
import sys


# Get the user's home directory
home_dir = os.path.expanduser("~")

# Define the Pictures folder path
pictures_folder = os.path.join(home_dir, "Pictures")

if not os.path.exists(pictures_folder):
    print(f"Creating missing folder: {pictures_folder}")
    os.makedirs(pictures_folder)

# Define the Wallpapers folder inside Pictures
wallpaper_folder = os.path.join(pictures_folder, "Wallpapers")

if not os.path.exists(wallpaper_folder):
    print(f"Creating missing folder: {wallpaper_folder}")
    os.makedirs(wallpaper_folder)


print(f"Wallpaper folder is ready: {wallpaper_folder}")

image_name = "anime_wp"


def main():
    img = None

    # Get screen resolution
    screen = get_screen_info()
    if len(sys.argv) == 2:
        if sys.argv[1]:
            base, extension = os.path.splitext(sys.argv[1])
            if not extension:
                print("Missing file extension.")
                sys.exit(1)

            image_path = os.path.join(wallpaper_folder, sys.argv[1])
            if not os.path.exists(image_path):
                sys.exit(1)
            img = open_image(image_path)

            print(f"Using image on: {image_path}")           
    else:
        # Get random anime wallpaper
        resp = get_random_image_waifu()
        if resp[0] != 200:
            print(f"Error: {resp[1]}")
            return 1
        image_path = os.path.join(wallpaper_folder, f"{image_name}{resp[2]}")
        print(f"Wallpaper will be saved as: {image_path}")
        
        # Download the image
        img = get_image(resp[1])
        img = open_image(img)
    
    # Resize the image
    resize_image(img, screen, image_path)

    # Set the wallpaper
    set_wallpaper(image_path)

def set_wallpaper(image_path):
    system_name = platform.system()

    if system_name == "Windows":
        # Set wallpaper on Windows
        ctypes.windll.user32.SystemParametersInfoW(20, 0, image_path, 3)

    elif system_name == "Darwin":
        # Set wallpaper on macOS
        script = f'tell application "Finder" to set desktop picture to POSIX file "{image_path}"'
        subprocess.run(["osascript", "-e", script])

    elif system_name == "Linux":
        # Detect the Linux desktop environment
        desktop_env = os.getenv("XDG_CURRENT_DESKTOP")

        if desktop_env and "GNOME" in desktop_env:
            subprocess.run(["gsettings", "set", "org.gnome.desktop.background", "picture-uri", f"file://{image_path}"])
        elif desktop_env and "KDE" in desktop_env:
            subprocess.run(["qdbus", "org.kde.plasmashell", "/PlasmaShell", "org.kde.PlasmaShell.evaluateScript",
                            f"var allDesktops = desktops(); for (i=0; i<allDesktops.length; i++) "
                            f"{{ d = allDesktops[i]; d.wallpaperPlugin = 'org.kde.image'; "
                            f"d.currentConfigGroup = ['Wallpaper', 'org.kde.image', 'General']; "
                            f"d.writeConfig('Image', 'file://{image_path}') }}"])
        else:
            print("Linux desktop environment not supported!")

    else:
        print("OS not supported!")

    print("Check out new wallpaper")

def resize_image(img, screen: tuple, image_path):
    # Resize while maintaining aspect ratio
    img.thumbnail(screen, Image.LANCZOS)
    
    # Save the resized image
    img.save(image_path)
    return    

def open_image(img):
    return Image.open(img)

def get_image(url):
    response = requests.get(url)
    img = BytesIO(response.content)
    
    return img

def get_screen_info() -> tuple:
    root = tk.Tk()
    root.withdraw()  # Hide the Tkinter window
    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()
    root.destroy()  # Close the window
    return (screen_width, screen_height)

def get_random_image_waifu():
    
    url = 'https://api.waifu.im/search'

    headers = {
        'Accept-Version': 'v6'
    }
    params = {
        "orientation": "LANDSCAPE"
    }
    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        data = response.json()
        return (200, data['images'][0]['url'], data['images'][0]['extension'])
    else:
        return (response.status_code, response.json())


if __name__ == "__main__":
    main()