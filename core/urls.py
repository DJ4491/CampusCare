from django.urls import path, include
from . import views
from django.conf import settings
from .models import User
from django.conf.urls.static import static

urlpatterns = [
    path("", views.home, name="home"),
    path("loader/", views.loader, name="loader"),
    path("search/", views.search, name="search"),
    path("notifications/", views.notifications, name="notifications"),
    path("user_profile/", views.user_profile, name="user_profile"),
    path("edit_profile/", views.Edit_user_profile, name="Edit_user_profile"),
    path("log_in/", views.log_in, name="log_in"),
    path("report/", views.report, name="report"),
    path("my_reports/", views.my_reports, name="my_reports"),
    # user API endpoints
    path("api/users/", views.api_users, name="api_users"),
    path("api/current_user/", views.current_user, name="api_current_user"),
    path("api/users/id/<int:user_id>/", views.api_user_by_id, name="api_user_by_id"),
    path("api/users/username/<str:username>/", views.api_user_by_username, name="api_user_by_username"),
    path("api/users/email/<str:email>/", views.api_user_by_email, name="api_user_by_email"),
    path("api/google-login/",views.get_or_create_user,name="google_auth"),
    path("api/reports/", views.api_reports, name="api_get_reports"),
    path("api/users/reports/", views.user_reports, name="api_user_reports"),
    path('get-media-image/<str:image_name>/',views.get_media_image_url,name = "get_media_image_url"),
    path("api/comments/", views.api_comments, name="api_comments"),
    path("api/notifications/", views.api_notifications, name="api_notifications"),
    path("lost_found/", views.lost_found, name="lost_found"),
    path("create_lost_found/", views.create_lost_found, name="create_lost_found"),
    # path("events/", views.events, name="events"),
    # ... other routes
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
