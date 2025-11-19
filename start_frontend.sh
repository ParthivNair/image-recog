#!/bin/bash

# Script to start the frontend dev server

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Color Blob Detection Frontend...${NC}"

cd frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${GREEN}Installing npm dependencies...${NC}"
    npm install
fi

# Start the dev server
echo -e "${GREEN}Starting Vite dev server on http://localhost:5173${NC}"
npm run dev

