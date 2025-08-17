#!/bin/bash

echo "🚀 Starting Admin Panel Server..."
echo "📅 Current time: $(date)"
echo "🔧 Node version: $(node --version)"
echo "📦 NPM version: $(npm --version)"
echo "🌍 Environment: $NODE_ENV"
echo "🔌 Port: $PORT"
echo "📁 Working directory: $(pwd)"
echo "📂 Contents: $(ls -la)"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found!"
    echo "📂 Available files: $(ls -la)"
    exit 1
fi

echo "✅ Dist directory found with contents: $(ls -la dist)"

# Start the server
echo "🚀 Starting server on port $PORT..."
exec node server.js
