from django.utils.deprecation import MiddlewareMixin


class CacheControlMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        # Modify the headers for static files.
        if request.path.startswith("/static/") or request.path.startswith("/media/") or request.path.startswith("/api/"):
            response["Cache-Control"] = "max-age=31536000, public"
        return response
