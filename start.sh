echo "PORT is: $PORT"
exec gunicorn campuscare.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
