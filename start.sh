#!/bin/sh
set -e

echo "Running migrations..."
python manage.py migrate
python manage.py collectstatic --noinput

# Railway gives us a dynamic port. Use it.
PORT=${PORT:-8080}
echo "Starting Gunicorn on port $PORT"

# Explicitly tell Gunicorn what to bind to
exec gunicorn campuscare.wsgi:application \
  --bind 0.0.0.0:$PORT \
  --workers 2 \
  --timeout 120
