from email.policy import default
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser


# Using Django's built-in AbstractUser for extensibility and authentication
class User(AbstractUser):
    pfp = models.URLField(
        default="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpapers.com%2Fimages%2Fhd%2Fpfp-pictures-ph6qxvz14p4uvj2j.jpg&f=1&nofb=1&ipt=3a6b6418b7e35569da64e680a1fc79cc6da0b827a8b84ad6d8a3563557dd"
    )
    aboutme = models.TextField(default="", blank=True)
    user_email = models.EmailField(max_length=200)

    def __str__(self):
        return self.username


# Create your models here.
class Report(models.Model):
    author = models.CharField(max_length=50)
    avatar = models.URLField()
    title = models.CharField(max_length=100)
    time = models.DateTimeField(default=timezone.now)
    desc = models.TextField(default="")
    likes = models.IntegerField(default=0)


class Comments(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE)
    comment = models.TextField(default="", blank=True)
    # time = models.DateTimeField(auto_now_add=True)


class Notification(models.Model):
    type_icon = models.URLField()
    title = models.CharField(max_length=50)
    desc = models.TextField(default="")
    time = models.DateTimeField(default=timezone.now)
    Latest = models.IntegerField(default=0)

    def __str__(self):
        return self.title
