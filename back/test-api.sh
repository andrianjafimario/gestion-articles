#!/bin/bash

# Content Management System API - Setup Guide
# This script helps test the CMS API

API_URL="http://localhost:5000"

echo "🚀 CMS API Testing Script"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test health endpoint
echo -e "${BLUE}1. Testing Health Endpoint${NC}"
curl -X GET "$API_URL/health" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Get all categories
echo -e "${BLUE}2. Getting All Categories${NC}"
curl -X GET "$API_URL/api/categories" \
  -H "Content-Type: application/json" | jq '.data | length, .[:1]'
echo ""

# Get all networks
echo -e "${BLUE}3. Getting All Networks${NC}"
curl -X GET "$API_URL/api/networks" \
  -H "Content-Type: application/json" | jq '.data | length'
echo ""

# Get articles
echo -e "${BLUE}4. Getting Articles (first page, 5 per page)${NC}"
curl -X GET "$API_URL/api/articles?page=1&limit=5" \
  -H "Content-Type: application/json" | jq '.pagination'
echo ""

# Get published articles
echo -e "${BLUE}5. Getting Published Articles${NC}"
curl -X GET "$API_URL/api/articles?status=published&limit=3" \
  -H "Content-Type: application/json" | jq '.pagination'
echo ""

# Get featured articles
echo -e "${BLUE}6. Getting Featured Articles${NC}"
curl -X GET "$API_URL/api/articles?featured=true" \
  -H "Content-Type: application/json" | jq '.data | length'
echo ""

echo -e "${GREEN}✅ API Tests Complete!${NC}"
echo ""
echo "For more information, see the README.md file"
