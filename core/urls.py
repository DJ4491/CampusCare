from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("loader/", views.loader, name="loader"),
    path("create/", views.create, name="create"),
    path("search/", views.search, name="search"),
    path("notifications/", views.notifications, name="notifications"),
    path("user_profile/", views.user_profile, name="user_profile"),
    path("log_in/", views.log_in, name="log_in"),
    path("report/", views.report, name="report"),
    path("my_reports/", views.my_reports, name="my_reports"),
    # new API endpoints
    path("api/user/", views.api_user, name="api_user"),
    path("api/reports/", views.api_get_reports, name="api_get_reports"),
    path("api/comments/", views.api_comments, name="api_comments"),
    path("api/notifications/", views.api_notifications, name="api_notifications"),
    # path("events/", views.events, name="events"),
    # ... other routes
]
