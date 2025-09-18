#!/bin/bash

echo "Setting up Smart Algos Authentication..."
echo

echo "Installing dependencies..."
npm install

echo
echo "Setting up authentication system..."
node setup-auth.js

echo
echo "Authentication setup completed!"
echo
echo "You can now:"
echo "1. Start the server: npm run dev"
echo "2. Login as admin: admin@smartalgos.com / Admin123!@#"
echo "3. Login as user: test@smartalgos.com / Test123!@#"
echo
