#!/bin/bash

echo "🏥 Health First Server - Provider Registration Module"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if MongoDB is running (optional check)
if command -v mongod &> /dev/null; then
    if ! pgrep -x "mongod" > /dev/null; then
        echo "⚠️  MongoDB is not running. Please start MongoDB first:"
        echo "   sudo systemctl start mongod"
        echo "   or"
        echo "   docker run -d -p 27017:27017 --name mongodb mongo:latest"
        echo ""
    else
        echo "✅ MongoDB is running"
    fi
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ .env file created from template"
        echo "   Please edit .env file with your configuration"
    else
        echo "❌ env.example file not found"
        exit 1
    fi
fi

echo ""
echo "🚀 Starting the server..."
echo "   Server will be available at: http://localhost:3000"
echo "   Health check: http://localhost:3000/health"
echo "   API base: http://localhost:3000/api/v1"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm run dev 