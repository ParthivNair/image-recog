#!/bin/bash

# Script to start the backend server

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Color Blob Detection Backend...${NC}"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${GREEN}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${GREEN}Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/.dependencies_installed" ]; then
    echo -e "${GREEN}Installing dependencies...${NC}"
    pip install -r requirements.txt
    touch venv/.dependencies_installed
fi

# Start the server
echo -e "${GREEN}Starting FastAPI server on http://localhost:8000${NC}"
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

