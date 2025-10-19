#!/bin/sh
set -e

python manage.py migrate
python manage.py collectstatic --noinput

PORT=${PORT:-8080}
exec gunicorn campuscare.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 3 \
    --timeout 120
