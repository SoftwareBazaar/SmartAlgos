#!/bin/bash

echo "Starting Smart Algos Desktop Development Environment..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed or not in PATH"
    exit 1
fi

echo "Node.js version:"
node --version
echo "npm version:"
npm --version
echo

# Start the development environment
node start-dev.js
