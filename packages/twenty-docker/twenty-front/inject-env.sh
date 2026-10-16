#!/bin/sh
set -e

if [ -n "$REACT_APP_SERVER_BASE_URL" ]; then
  echo "Injecting REACT_APP_SERVER_BASE_URL=$REACT_APP_SERVER_BASE_URL into index.html"
  sed -i "s|<!-- BEGIN: Twenty Config -->.*<!-- END: Twenty Config -->|<script id=\"twenty-env-config\">window._env_ = { REACT_APP_SERVER_BASE_URL: \"$REACT_APP_SERVER_BASE_URL\" };</script>|g" /usr/share/nginx/html/index.html
fi
