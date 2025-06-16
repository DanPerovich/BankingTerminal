#!/bin/bash
# HTTP Development Mode Starter Script
# This script starts the ATM application in HTTP mode for local development
# allowing HTTP API endpoints to work without mixed content security restrictions

echo "Starting ATM application in HTTP development mode..."
echo "This allows testing HTTP API endpoints on localhost"
echo "Application will be available at http://localhost:3000"
echo ""

# Set HTTP mode environment variable and start the server
HTTP_MODE=true npm run dev