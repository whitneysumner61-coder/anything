#!/bin/bash
# PyBridge DevOS Launcher Script

echo "🚀 Starting PyBridge DevOS..."

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build
npm run build:app

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Open browser after a short delay
(sleep 2 && xdg-open http://localhost:3000 2>/dev/null || open http://localhost:3000 2>/dev/null || echo "Please open http://localhost:3000 in your browser") &

# Start the server
echo "🌐 Starting server at http://localhost:3000"
echo "Press Ctrl+C to stop the server"
npm run app
