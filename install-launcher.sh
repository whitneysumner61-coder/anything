#!/bin/bash
# Desktop Launcher Installation Script

echo "🔧 Installing PyBridge DevOS Desktop Launcher"

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Make launch script executable
chmod +x "$DIR/launch-app.sh"

# Create desktop entry
DESKTOP_FILE="$HOME/.local/share/applications/pybridge-devos.desktop"
mkdir -p "$HOME/.local/share/applications"

cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=PyBridge DevOS
Comment=Workspace & Command Manager
Exec=/bin/bash -c "cd '$DIR' && ./launch-app.sh"
Icon=$DIR/icon.png
Terminal=true
Categories=Development;Utility;
StartupNotify=true
EOF

chmod +x "$DESKTOP_FILE"

# Try to create a desktop shortcut too
if [ -d "$HOME/Desktop" ]; then
    cp "$DESKTOP_FILE" "$HOME/Desktop/"
    chmod +x "$HOME/Desktop/pybridge-devos.desktop"
    echo "✓ Desktop shortcut created at ~/Desktop/pybridge-devos.desktop"
fi

# Create a simple icon (text-based)
if ! [ -f "$DIR/icon.png" ]; then
    echo "📝 Creating icon placeholder..."
    # For now, we'll just reference a standard icon
    # You can replace this with a custom icon later
fi

echo "✅ Installation complete!"
echo ""
echo "You can now:"
echo "  1. Find 'PyBridge DevOS' in your application menu"
echo "  2. Double-click the shortcut on your desktop (if created)"
echo "  3. Run './launch-app.sh' from this directory"
echo ""
echo "To uninstall, run: rm ~/.local/share/applications/pybridge-devos.desktop"
