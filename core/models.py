from django.db import models
from django.utils import timezone

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
    comment = models.TextField()
    time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
