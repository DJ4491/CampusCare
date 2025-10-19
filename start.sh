#!/bin/sh
set -e

PORT=${PORT:-8080}
python manage.py migrate
python manage.py collectstatic --noinput
exec gunicorn campuscare.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120
