#!/bin/sh

# Go to the app directory
cd /app

# Recreate the config file
rm -rf ./dist/env-config.js
touch ./dist/env-config.js

# Add assignment
echo "window._env_ = {" >> ./dist/env-config.js

# Read specific variables based on your .env list.
# We use default values (:-"") to ensure syntax is valid if variables are missing.

echo "  VITE_BASE_ORG: \"${VITE_BASE_ORG}\"," >> ./dist/env-config.js
echo "  VITE_API_URL: \"${VITE_API_URL}\"," >> ./dist/env-config.js
echo "  VITE_WSS_URL: \"${VITE_WSS_URL}\"," >> ./dist/env-config.js
echo "  VITE_DNS_URL: \"${VITE_DNS_URL}\"," >> ./dist/env-config.js
echo "  VITE_APP_NAME: \"${VITE_APP_NAME}\"," >> ./dist/env-config.js
echo "  VITE_APP_VERSION: \"${VITE_APP_VERSION}\"," >> ./dist/env-config.js
echo "  VITE_BUILD_DATE: \"${VITE_BUILD_DATE}\"," >> ./dist/env-config.js
echo "  VITE_API_VERSION: \"${VITE_API_VERSION}\"," >> ./dist/env-config.js
echo "  VITE_ENVIRONMENT: \"${VITE_ENVIRONMENT}\"," >> ./dist/env-config.js
echo "  VITE_COPYRIGHT: \"${VITE_COPYRIGHT}\"," >> ./dist/env-config.js
echo "  VITE_DNS_API_KEY: \"${VITE_DNS_API_KEY}\"," >> ./dist/env-config.js
echo "  VITE_RUM_CLIENT_TOKEN: \"${VITE_RUM_CLIENT_TOKEN}\"," >> ./dist/env-config.js
echo "  VITE_RUM_SITE: \"${VITE_RUM_SITE}\"," >> ./dist/env-config.js
echo "  VITE_RUM_APPLICATION_ID: \"${VITE_RUM_APPLICATION_ID}\"," >> ./dist/env-config.js
echo "  VITE_RUM_SERVICE: \"${VITE_RUM_SERVICE}\"," >> ./dist/env-config.js
echo "  VITE_RUM_ORG_IDENTIFIER: \"${VITE_RUM_ORG_IDENTIFIER}\"," >> ./dist/env-config.js
echo "  VITE_RECAPTCHA_SITE_KEY: \"${VITE_RECAPTCHA_SITE_KEY}\"," >> ./dist/env-config.js

echo "}" >> ./dist/env-config.js

# Execute the passed command (starts the server)
exec "$@"