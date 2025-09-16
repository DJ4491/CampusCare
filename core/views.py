# core/views.py
from django.shortcuts import render
from django.http import JsonResponse
from django.utils.http import url_has_allowed_host_and_scheme
from .models import Report, Comments


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


def api_get_reports(request):
    data = list(Report.objects.all().values())
    return JsonResponse(data, safe=False)


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
