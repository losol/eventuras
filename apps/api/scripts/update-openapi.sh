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

API_URL="${1:-https://localhost:5001}"
OPENAPI_ENDPOINT="${API_URL}/openapi/v3.json"
OUTPUT_DIR="$(dirname "$0")/../docs"
OUTPUT_FILE="${OUTPUT_DIR}/eventuras-v3.json"

echo "📡 Fetching OpenAPI specification from ${OPENAPI_ENDPOINT}..."

# Create output directory if it doesn't exist
mkdir -p "${OUTPUT_DIR}"

# Fetch the OpenAPI spec to a temp file first to avoid clobbering on failure
TEMP_FILE=$(mktemp)
trap 'rm -f "${TEMP_FILE}"' EXIT

if curl -k -f -s "${OPENAPI_ENDPOINT}" -o "${TEMP_FILE}"; then
    mv "${TEMP_FILE}" "${OUTPUT_FILE}"
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
