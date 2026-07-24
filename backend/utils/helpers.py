import os
import hashlib
import urllib.request
import bz2
import sys

def get_file_hash(file_path: str) -> str:
    """Calculate SHA-256 hash of a file to detect duplicates."""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(8192):
            sha256.update(chunk)
    return sha256.hexdigest()

def ensure_openh264():
    """Ensure OpenH264 DLL is present on Windows to support browser-compatible H.264 coding in OpenCV."""
    if sys.platform != "win32":
        return
        
    dll_name = "openh264-2.5.0-win64.dll"
    # FFMPEG wrapper in OpenCV checks current working dir or system path
    if os.path.exists(dll_name):
        print(f"OpenH264 DLL '{dll_name}' is already present.")
        return

    url = "http://ciscobinary.openh264.org/openh264-2.5.0-win64.dll.bz2"
    print(f"Downloading OpenH264 library from {url}...")
    try:
        # Download the compressed .bz2 DLL
        temp_bz2 = "openh264.dll.bz2"
        urllib.request.urlretrieve(url, temp_bz2)
        
        # Decompress it
        print("Decompressing OpenH264 library...")
        with bz2.BZ2File(temp_bz2) as fr, open(dll_name, "wb") as fw:
            data = fr.read()
            fw.write(data)
            
        # Clean up temporary .bz2 file
        os.remove(temp_bz2)
        print(f"Successfully installed OpenH264 library '{dll_name}'.")
    except Exception as e:
        print(f"Warning: Failed to install OpenH264 library: {e}")
        print("H.264 MP4 export may fail or fallback to a non-browser-playable codec.")
