# core/views.py
from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, logout
import json
from .models import Report, Comments, Notification, User


def is_ajax(request):
    return request.headers.get("x-requested-with") == "XMLHttpRequest"


def render_fragment_or_full(request, fragment_path, context=None):
    ctx = context or {}
    if is_ajax(request):
        # return only the fragment HTML for AJAX
        return render(request, fragment_path, ctx)
    # normal full-page load -> wrap fragment into base.html by passing its path
    ctx["content_template"] = fragment_path
    return render(request, "base.html", ctx)


def register_view(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return "success"
        else:
            form = UserCreationForm()
        return render_fragment_or_full(request, "")


@require_http_methods(["GET"])
def api_users(request):
    users = list(User.objects.all().values("id", "username", "email", "pfp", "aboutme"))
    return JsonResponse(users, safe=False)


@require_http_methods(["GET"])
def api_user_by_id(request, user_id):
    try:
        user = User.objects.values("id", "username", "email", "pfp", "aboutme").get(
            id=user_id
        )
        return JsonResponse(user, safe=False)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)


@require_http_methods(["GET"])
def api_user_by_username(request, username):
    users = list(
        User.objects.filter(username=username).values(
            "id", "username", "email", "pfp", "aboutme"
        )
    )
    # Return list to handle non-unique usernames
    return JsonResponse(users, safe=False)


@require_http_methods(["GET"])
def api_user_by_email(request, email):
    try:
        user = User.objects.values("id", "username", "email", "pfp", "aboutme").get(
            email=email
        )
        return JsonResponse(user, safe=False)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)


## POST and ADD report objects


@csrf_exempt
@require_http_methods(["GET", "POST"])
@login_required
def api_reports(request):
    if request.method == "GET":
        reports = (
            Report.objects.select_related("author").all().order_by("-id")
        )
        data = [
            {
                "id": r.id,
                "author": {
                    "id": r.author.id if r.author else None,
                    "username": r.author.username if r.author else "",
                },
                "avatar": r.avatar,
                "category": r.category,
                "location": r.location,
                "title": r.title,
                "time": r.time,
                "desc": r.desc,
                "likes": r.likes,
                "image": r.image.url if r.image else "",
            }
            for r in reports
        ]
        return JsonResponse(data, safe=False)
    elif request.method == "POST":
        try:
            # Expecting multipart form data from FormData()
            author = request.user
            avatar = request.POST.get("avatar", "")
            category = request.POST.get("category", "")
            location = request.POST.get("location", "")
            title = request.POST.get("title", "")
            desc = request.POST.get("desc", "")
            image = request.FILES.get("image")

            report = Report.objects.create(
                author=author,
                avatar=avatar,
                category=category,
                location=location,
                title=title,
                desc=desc,
                image=image or "",
            )
            return JsonResponse(
                {
                    "id": report.id,
                    "author": {
                        "id": report.author.id,
                        "username": report.author.username,
                    },
                    "avatar": report.avatar,
                    "category": report.category,
                    "location": report.location,
                    "title": report.title,
                    "time": report.time,
                    "desc": report.desc,
                    "likes": report.likes,
                    "image": report.image.url if report.image else "",
                },
                status=201,
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


def get_media_image_url(request, image_name):
    image_url = f"{settings.MEDIA_URL}{image_name}"
    return JsonResponse({"image_url": image_url})


def api_notifications(request):
    data = list(Notification.objects.all().values())
    return JsonResponse(data, safe=False)


# POST and GET comment objects


@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_comments(request):
    if request.method == "GET":
        data = list(Comments.objects.all().values())
        return JsonResponse(data, safe=False)

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            report_id = data.get("report")
            comment_text = data.get("comment")

            if not report_id or not comment_text:
                return JsonResponse(
                    {"error": "Missing report ID or comment text"}, status=400
                )

            # Get the report object
            try:
                report = Report.objects.get(id=report_id)
            except Report.DoesNotExist:
                return JsonResponse({"error": "Report not found"}, status=404)

            # Create the comment
            comment = Comments.objects.create(report=report, comment=comment_text)

            return JsonResponse(
                {
                    "id": comment.id,
                    "report": comment.report.id,
                    "comment": comment.comment,
                },
                status=201,
            )

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


def home(request):
    # pass any context needed by the fragment
    return render_fragment_or_full(request, "pages/home.html")


def create(request):
    return render_fragment_or_full(request, "pages/create.html")


def loader(request):
    return render_fragment_or_full(request, "pages/loader.html")


# add similar functions for search, notifications, user_profile, events, etc.


def search(request):
    return render_fragment_or_full(request, "pages/search.html")


def notifications(request):
    return render_fragment_or_full(request, "pages/notifications.html")


def user_profile(request):
    return render_fragment_or_full(request, "pages/user_profile.html")


def log_in(request):
    return render_fragment_or_full(request, "pages/log_in.html")


def report(request):
    return render_fragment_or_full(request, "pages/report.html")


def my_reports(request):
    return render_fragment_or_full(request, "pages/my_reports.html")
