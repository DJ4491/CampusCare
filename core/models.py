from email.policy import default
from django.core.files import images
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.validators import UnicodeUsernameValidator


# Using Django's built-in AbstractUser for extensibility and authentication
class User(AbstractUser):
    # Override username to be non-unique; keep Django's validations/help text.
    username_validator = UnicodeUsernameValidator()
    username = models.CharField(
        max_length=150,
        unique=False,
        help_text="Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.",
        validators=[username_validator],
        error_messages={
            "unique": "A user with that username already exists.",
        },
    )

    # Use email for login; must be unique and non-null
    email = models.EmailField(
        "email address",
        unique=True,
        blank=False,
        null=False,
    )

    # Configure authentication fields
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
    pfp = models.URLField(default="/static/images/profile.png")
    aboutme = models.TextField(default="", blank=True)

    def __str__(self):
        return self.username


# Create your models here.
class Report(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    avatar = models.URLField()
    category = models.CharField(default="", max_length=255)
    location = models.CharField(default="", max_length=255)
    title = models.CharField(max_length=100)
    time = models.DateTimeField(default=timezone.now)
    desc = models.TextField(default="")
    liked = models.BooleanField(
        choices=[(True, "True"), (False, "False")], default=False
    )
    likes = models.IntegerField(default=0)
    image = models.ImageField(upload_to="", default="")

    def __str__(self):
        return self.title


class Comments(models.Model):
    added_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    report = models.ForeignKey(Report, on_delete=models.CASCADE)
    comment = models.TextField(default="", blank=True)

    def __str__(self):
        if self.added_by:
            return f"{self.added_by.username}: {self.comment[:50]}..."
        return f"Anonymous: {self.comment[:50]}..."


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    report = models.ForeignKey(Report, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("user", "report")  # Prevent duplicate likes

    def __str__(self):
        return f"{self.user.username} liked {self.report.title}"


class Notification(models.Model):
    type_icon = models.URLField()
    title = models.CharField(max_length=50)
    desc = models.TextField(default="")
    time = models.DateTimeField(default=timezone.now)
    Latest = models.IntegerField(default=0)

    def __str__(self):
        return self.title
