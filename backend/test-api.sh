#!/bin/bash

# E-Waste Management System - API Test Script
# This script tests all major endpoints

BASE_URL="http://localhost:5000/api"
echo "🧪 Testing E-Waste Management API"
echo "=================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Health Check..."
curl -s $BASE_URL/health | jq .
echo ""

# Test 2: Send OTP
echo "2️⃣  Send OTP..."
curl -s -X POST $BASE_URL/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}' | jq .
echo ""

# Test 3: Login
echo "3️⃣  Login as Citizen..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"1234"}')
echo $LOGIN_RESPONSE | jq .
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo ""

# Test 4: Get Current User
echo "4️⃣  Get Current User..."
curl -s $BASE_URL/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 5: Create Request
echo "5️⃣  Create E-Waste Request..."
REQUEST_RESPONSE=$(curl -s -X POST $BASE_URL/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "category":"Mobile Phone",
    "quantity":2,
    "address":"123 Main St, Mumbai",
    "type":"HOME_PICKUP"
  }')
echo $REQUEST_RESPONSE | jq .
REQUEST_ID=$(echo $REQUEST_RESPONSE | jq -r '.id')
echo ""

# Test 6: Get Requests
echo "6️⃣  Get All Requests..."
curl -s $BASE_URL/requests \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 7: Schedule Request
echo "7️⃣  Schedule Request..."
curl -s -X POST $BASE_URL/requests/$REQUEST_ID/schedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "timeSlot":"09:00",
    "date":"2024-12-20"
  }' | jq .
echo ""

# Test 8: Get Pricing
echo "8️⃣  Get Pricing Config..."
curl -s $BASE_URL/pricing | jq .
echo ""

# Test 9: Get Drives
echo "9️⃣  Get Drives..."
curl -s $BASE_URL/drives | jq .
echo ""

echo "✅ API Tests Complete!"
echo ""
echo "📝 Notes:"
echo "- Replace TOKEN with actual token for protected routes"
echo "- Use vendor credentials to test vendor endpoints"
echo "- Use admin credentials to test admin endpoints"
