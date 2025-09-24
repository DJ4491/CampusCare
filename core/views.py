# core/views.py
from django.shortcuts import render
from django.http import JsonResponse
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
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


def api_user(request):
    data = list(User.objects.all().values())
    return JsonResponse(data, safe=False)


def api_get_reports(request):
    data = list(Report.objects.all().values())
    return JsonResponse(data, safe=False)


def api_notifications(request):
    data = list(Notification.objects.all().values())
    return JsonResponse(data, safe=False)


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
