#!/bin/bash

echo "======================================"
echo "  VAT Calculator Pro - Local Server"
echo "======================================"
echo ""
echo "Starting server on http://localhost:8000"
echo ""
echo "Your application will be available at:"
echo "http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Try different Python commands
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m http.server 8000
elif command -v py &> /dev/null; then
    py -m http.server 8000
else
    echo "Error: Python not found. Please install Python first."
    read -p "Press any key to continue..."
fi
