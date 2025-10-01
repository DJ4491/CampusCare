from django.contrib import admin
from .models import Notification, Report, Comments, User


# Register your models here.
@admin.register(Notification)
class NotificationsAdmin(admin.ModelAdmin):
    list_display = ("title", "desc", "time", "Latest")
    fields = ("type_icon", "title", "desc", "time", "Latest")
    search_fields = ("title", "desc")
    list_filter = ("time", "Latest")

admin.site.register(Report)
admin.site.register(Comments)
admin.site.register(User)