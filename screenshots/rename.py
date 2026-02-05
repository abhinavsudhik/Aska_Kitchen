#!/usr/bin/env python3
import os
import shutil
from pathlib import Path

# Get the script's directory
script_dir = Path(__file__).parent

# Find all Screenshot PNG files
screenshot_files = sorted([f for f in script_dir.glob("Screenshot*.png")])

if len(screenshot_files) != 5:
    print(f"Warning: Expected 5 screenshots, found {len(screenshot_files)}")

# New names in chronological order
new_names = [
    "landing-hero.png",           # 4.03.26 PM
    "landing-join-family.png",    # 4.03.36 PM
    "customer-homepage.png",      # 4.04.09 PM
    "login-page.png",             # 4.05.07 PM
    "signup-page.png",            # 4.05.14 PM
]

print("Renaming screenshots...\n")

for old_path, new_name in zip(screenshot_files, new_names):
    new_path = script_dir / new_name
    shutil.copy2(old_path, new_path)
    print(f"✓ {old_path.name}\n  → {new_name}")

print("\n" + "="*60)
print("Screenshot files ready for README:")
print("="*60)

for new_name in new_names:
    file_path = script_dir / new_name
    if file_path.exists():
        size_kb = file_path.stat().st_size / 1024
        print(f"  ✓ {new_name} ({size_kb:.1f} KB)")

print("\n✅ All screenshots are now ready and referenced in README.md!")
