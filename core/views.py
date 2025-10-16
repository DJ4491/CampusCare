# core/views.py
from django.shortcuts import render
from django.http import JsonResponse
import random
from django.conf import settings
from django.views.decorators.cache import cache_page
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, logout, get_user_model
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


# note:- User DashBoard
@csrf_exempt
def user_reports(request):
    user = request.user
    user_id = getattr(user, "id")
    if request.method == "GET":
        reports = Report.objects.filter(
            author_id=user_id
        ).values()  # values() is used to get a dict-like queryset
        report_count = reports.count()
        return JsonResponse(
            {
                "user_id": user_id,
                "reports_count": report_count,
            }
        )  # safe=False allows non-dict objects


@require_http_methods(["GET", "POST"])
@login_required
def current_user(request):
    if request.method == "GET":
        user = request.user
        about_me_placeholders = [
            "Favorite music genre?",
            "Best travel memory?",
            "Current hobby?",
            "Favorite book or movie?",
            "Future goals?",
            "Most inspiring person?",
            "Dream skill to learn?",
            "Guiding principles?",
            "Weekend plans?",
            "Something unique about you?",
        ]
        # If user.aboutme is empty or None, use a random placeholder
        aboutme = getattr(user, "aboutme", None)
        if not aboutme:
            aboutme = random.choice(about_me_placeholders)
        userdata = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "pfp": getattr(user, "pfp", ""),
            "aboutme": aboutme,
        }
        return JsonResponse(userdata)

    # POST: update current logged-in user
    user = request.user
    try:
        username = request.POST.get("username")
        email = request.POST.get("email")
        aboutme = request.POST.get("aboutme")

        # Handle profile picture from file upload or direct URL
        uploaded_pfp = request.FILES.get("pfp")
        pfp_url_from_form = request.POST.get("pfp")

        # Update simple fields if provided
        if username:
            user.username = username
        if email:
            user.email = email
        if aboutme is not None:
            user.aboutme = aboutme

        # Save uploaded file to MEDIA and store resulting URL in URLField
        if uploaded_pfp:
            from django.core.files.storage import FileSystemStorage

            fs = FileSystemStorage()  # defaults to MEDIA_ROOT
            filename = fs.save(uploaded_pfp.name, uploaded_pfp)
            stored_url = fs.url(filename)  # typically under MEDIA_URL
            user.pfp = stored_url
        elif pfp_url_from_form:
            # Fallback: allow setting URL directly if sent
            user.pfp = pfp_url_from_form

        user.save()

        return JsonResponse(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "pfp": getattr(user, "pfp", ""),
                "aboutme": getattr(user, "aboutme", ""),
            }
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


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


User = get_user_model()


@csrf_exempt
@require_http_methods(["POST"])
def get_or_create_user(request):
    data = json.loads(request.body)
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    pfp = data.get("pfp", None)
    aboutme = data.get("aboutme", "")

    # Basic validation
    if not username or not password:
        return JsonResponse({"error": "Username and password are required"}, status=400)

    try:
        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": email, "aboutme": aboutme},
        )

        if created:
            # Ensure password is hashed for newly created users
            user.set_password(password)
            if pfp is not None and hasattr(user, "pfp"):
                user.pfp = pfp
            user.save()
            # Log in newly created user
            login(request, user)

        else:
            # Existing user: verify password and log in
            if not user.check_password(password):
                return JsonResponse({"error": "Invalid credentials"}, status=401)
            login(request, user)

        return JsonResponse(
            {
                "id": user.id,
                "username": user.username,
                "email": getattr(user, "email", ""),
                "aboutme": getattr(user, "aboutme", ""),
                "pfp": getattr(user, "pfp", ""),
                "created": created,
            },
            status=(
                201 if created else 200
            ),  # This sets the HTTP status code to 201 (Created) if a new user was created,
            # or 200 (OK) if the user already existed.
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


## POST and ADD report objects


@csrf_exempt
@require_http_methods(["GET", "POST"])
@login_required
def api_reports(request):
    if request.method == "GET":
        reports = Report.objects.select_related("author").all().order_by("-id")
        data = [
            {
                "id": r.id,
                "author": {
                    "id": r.author.id if r.author else None,
                    "username": r.author.username if r.author else "",
                },
                # Always reflect the author's CURRENT profile picture
                "avatar": getattr(r.author, "pfp", "") or r.avatar,
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
            # sourcing avatar from the current user's profile picture URL
            avatar = getattr(author, "pfp", "")
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
        comments = Comments.objects.select_related("added_by").all()
        data = [
            {
                "id": comment.id,
                "added_by": {
                    "id": comment.added_by.id if comment.added_by else None,
                    "username": (
                        comment.added_by.username if comment.added_by else "Anonymous"
                    ),
                },
                "report": comment.report.id,
                "comment": comment.comment,
            }
            for comment in comments
        ]
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

            # Create the comment with the current user (if authenticated)
            comment = Comments.objects.create(
                report=report,
                comment=comment_text,
                added_by=request.user if request.user.is_authenticated else None,
            )

            return JsonResponse(
                {
                    "id": comment.id,
                    "added_by": {
                        "id": comment.added_by.id if comment.added_by else None,
                        "username": (
                            comment.added_by.username
                            if comment.added_by
                            else "Anonymous"
                        ),
                    },
                    "report": comment.report.id,
                    "comment": comment.comment,
                },
                status=201,
            )

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


@login_required
def home(request):
    # pass any context needed by the fragment
    return render_fragment_or_full(request, "pages/home.html")


@login_required
@cache_page(60 * 5)
def loader(request):
    return render_fragment_or_full(request, "pages/loader.html")


# add similar functions for search, notifications, user_profile, events, etc.


@login_required
def search(request):
    return render_fragment_or_full(request, "pages/search.html")


@login_required
def notifications(request):
    return render_fragment_or_full(request, "pages/notifications.html")


@login_required
def user_profile(request):
    return render_fragment_or_full(request, "pages/user_profile.html")


@login_required
def Edit_user_profile(request):
    return render_fragment_or_full(request, "pages/edit_profile.html")


def log_in(request):
    return render_fragment_or_full(request, "pages/log_in.html")


@login_required
@cache_page(60 * 5)
def report(request):
    return render_fragment_or_full(request, "pages/report.html")


@login_required
def my_reports(request):
    return render_fragment_or_full(request, "pages/my_reports.html")


@login_required
def lost_found(request):
    return render_fragment_or_full(request, "pages/lost_found.html")


@login_required
@cache_page(60 * 5)
def create_lost_found(request):
    return render_fragment_or_full(request, "pages/create_lost_found.html")
