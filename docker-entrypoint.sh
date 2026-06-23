#!/bin/sh
set -e

# Генерира runtime config.json с API URL от env variable
# Angular го чете при стартиране вместо хардкоднатия environment.ts
cat > /usr/share/nginx/html/assets/config.json << EOF
{
  "apiUrl": "${API_URL:-https://erp.sateno.bg}"
}
EOF

echo "Config: API_URL=${API_URL:-https://erp.sateno.bg}"
exec nginx -g 'daemon off;'
