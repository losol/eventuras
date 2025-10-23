#!/usr/bin/env bash
#
# Script to fetch the latest OpenAPI specification from a running API instance
# and save it to the openapi directory.
#
# Usage:
#   ./scripts/update-openapi.sh [API_URL]
#
# Default API_URL: https://localhost:5001

set -e

API_URL="${1:-http://localhost:5000}"
OPENAPI_ENDPOINT="${API_URL}/swagger/v3/swagger.json"
OUTPUT_DIR="$(dirname "$0")/../docs"
OUTPUT_FILE="${OUTPUT_DIR}/eventuras-v3.json"

echo "📡 Fetching OpenAPI specification from ${OPENAPI_ENDPOINT}..."

# Create output directory if it doesn't exist
mkdir -p "${OUTPUT_DIR}"

# Fetch the OpenAPI spec (using -k to allow self-signed certificates in development)
if curl -k -f -s "${OPENAPI_ENDPOINT}" -o "${OUTPUT_FILE}"; then
    echo "✅ OpenAPI specification saved to ${OUTPUT_FILE}"
    echo ""
    echo "Next steps:"
    echo "  1. Review the changes: git diff ${OUTPUT_FILE}"
    echo "  2. Regenerate SDK: cd libs/event-sdk && pnpm build"
else
    echo "❌ Failed to fetch OpenAPI specification"
    echo ""
    echo "Make sure the API is running at ${API_URL}"
    echo "You can start it with: cd apps/api && dotnet run --project src/Eventuras.WebApi"
    exit 1
fi
