#!/bin/bash
cd "$(dirname "$0")"

cp "Screenshot 2026-02-05 at 4.03.26 PM.png" "landing-hero.png"
cp "Screenshot 2026-02-05 at 4.03.36 PM.png" "landing-join-family.png"
cp "Screenshot 2026-02-05 at 4.04.09 PM.png" "customer-homepage.png"
cp "Screenshot 2026-02-05 at 4.05.07 PM.png" "login-page.png"
cp "Screenshot 2026-02-05 at 4.05.14 PM.png" "signup-page.png"

echo "✓ Screenshots renamed successfully!"
echo ""
echo "Final files:"
ls -1 *.png | grep -E '(landing|login|signup|customer)'
