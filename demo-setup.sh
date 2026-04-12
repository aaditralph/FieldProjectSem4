#!/bin/bash

# E-Cycler BMC Ticketing System - Demo Quick Start Script
# This script helps you quickly set up and run the demo

echo "🚀 E-Cycler BMC Ticketing System - Demo Setup"
echo "=============================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if MongoDB container exists
if docker ps -a | grep -q mongodb_container; then
    echo "📦 MongoDB container exists"
    if docker ps | grep -q mongodb_container; then
        echo "✅ MongoDB is already running"
    else
        echo "🔄 Starting MongoDB container..."
        docker start mongodb_container
        sleep 5
    fi
else
    echo "📦 Creating new MongoDB container..."
    docker run -d --name mongodb_container -p 27017:27017 \
        -e MONGO_INITDB_ROOT_USERNAME=admin \
        -e MONGO_INITDB_ROOT_PASSWORD=ewaste_secure_password_2024 \
        mongo:6.0
    sleep 5
fi

echo ""
echo "🔧 Setting up backend..."
cd backend

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating backend .env file..."
    cat > .env << EOF
MONGODB_URI=mongodb://admin:ewaste_secure_password_2024@127.0.0.1:27017/ewaste?authSource=admin
MONGODB_TEST_URI=mongodb://admin:ewaste_secure_password_2024@127.0.0.1:27017/ewaste_test?authSource=admin
JWT_SECRET=demo_jwt_secret_for_testing_purposes_only
PORT=5000
NODE_ENV=development
OTP_EXPIRY=300
EOF
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Seed database
echo "🌱 Seeding database with test data..."
npm run seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Test Credentials:"
echo "   Citizen: 9876543210 (OTP: 1234)"
echo "   Vendor: 9876543211 (OTP: 1234)"
echo "   Admin:   9876543212 (OTP: 1234)"
echo ""
echo "🚀 To start the services:"
echo ""
echo "1. Backend (Terminal 1):"
echo "   cd backend && npm run dev"
echo ""
echo "2. Mobile App (Terminal 2):"
echo "   npx expo start"
echo ""
echo "3. Web Dashboard (Terminal 3):"
echo "   cd bmc-web && npm run dev"
echo ""
echo "📱 Mobile App: http://localhost:8081 (or use Expo Go app)"
echo "🌐 Web Dashboard: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000/api"
echo ""
echo "📚 For detailed testing guide, see: DEMO_TESTING_GUIDE.md"
echo ""